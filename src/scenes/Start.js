export class Start extends Phaser.Scene {
    // =========================================================================
    // START SCENE
    // =========================================================================
    // This version keeps the game readable early, then ramps pressure by score.
    //
    // Core pacing goals applied:
    // - 2-item waves stay as the base wave size.
    // - 0–4 hearts: very light learning phase, no flooding.
    // - 5–19 hearts: tomatoes begin, still not screen-filling.
    // - 20–59 hearts: denser gameplay, but still readable.
    // - 60+ hearts (ICON): tomatoes are about 3% more common than hearts.
    // - 300 hearts: Chaos Mode triggers, blinking message, tomato flood, end run.
    //
    // Fairness goals:
    // - One safe lane instead of two.
    // - Early waves allow only 1 tomato max.
    // - Later waves can allow 2 tomatoes in a 2-item wave when appropriate.
    // - Screen target fills scale by score instead of immediately flooding.
    // =========================================================================

    constructor() {
        super('Start');
    }

    // =========================================================================
    // PRELOAD
    // =========================================================================
    preload() {
        this.load.image('backgroundgames1', 'assets/BG1.png');
        this.load.image('backgroundgames2', 'assets/BG2.png');

        this.load.image('openover', 'assets/Tomatoend1.PNG');
        this.load.image('closeover', 'assets/Tomatoend2.PNG');

        this.load.image('LuvaGirl', 'assets/LuvaGirl.png');
        this.load.image('Luvagirldrag', 'assets/Luvagirldrag.png');
        this.load.image('LuvaGirlBad', 'assets/LuvaGirlbad.png');
        this.load.image('LuvaGirlBonus', 'assets/LuvaGirlbonus.png');
        this.load.image('LuvaGirlstar', 'assets/LuvaGirlstar.png');

        this.load.image('heartBlue', 'assets/blue.png');
        this.load.image('heartGreen', 'assets/green.png');
        this.load.image('heartPink', 'assets/pink.png');
        this.load.image('heartYellow', 'assets/yellow.png');

        this.load.image('lifeFull', 'assets/lifescore.png');
        this.load.image('lifeLost', 'assets/lostscore.png');

        this.load.image('tomato', 'assets/Tomotoe.png');
        this.load.image('grammy', 'assets/grammy.png');
        this.load.image('ramenItem', 'assets/ramen.png');
        this.load.image('noteItem', 'assets/note.png');

        this.load.audio('gameOverSound', 'assets/GameOver.mp3');
        this.load.audio('bgMusic', 'assets/BGmusic.mp3');
        this.load.audio('arcadeMusic', 'assets/Arcade.mp3');
    }

    // =========================================================================
    // CREATE
    // =========================================================================
    create() {
        // ---------------------------------------------------------------------
        // Base game size
        // ---------------------------------------------------------------------
        this.gameWidth = 360;
        this.gameHeight = 640;

        // ---------------------------------------------------------------------
        // Background
        // ---------------------------------------------------------------------
        this.background = this.add.tileSprite(180, 320, 360, 640, 'backgroundgames1');

        // ---------------------------------------------------------------------
        // Core state
        // ---------------------------------------------------------------------
        this.gameStarted = false;
        this.gameCountdownActive = false;
        this.isGameOver = false;
        this.reactionTimer = null;
        this.introGateActive = true;
        this.homeScreenActive = false;
        this.isUnlockingIntroGate = false;

        // ---------------------------------------------------------------------
        // Player
        // ---------------------------------------------------------------------
        this.ship = this.add.image(180, 550, 'LuvaGirl').setScale(0.22);
        this.shipBaseY = 550;
        this.ship.setAlpha(0);

        // ---------------------------------------------------------------------
        // Input
        // ---------------------------------------------------------------------
        this.cursors = this.input.keyboard.createCursorKeys();

        // ---------------------------------------------------------------------
        // Home movement visual state
        // ---------------------------------------------------------------------
        this.homePointerMoving = false;
        this.homeMoveVisualTimer = null;
        this.homeMoveVisualDelay = 120;

        // ---------------------------------------------------------------------
        // Items group
        // ---------------------------------------------------------------------
        this.items = this.add.group();

        // ---------------------------------------------------------------------
        // Score / lives / speed
        // ---------------------------------------------------------------------
        this.heartsCaught = 0;
        this.lives = 3;
        this.currentFallSpeed = 2;

        // ---------------------------------------------------------------------
        // Level flags
        // ---------------------------------------------------------------------
        this.starLevelShown = false;
        this.superStarShown = false;
        this.iconLevelShown = false;
        this.legendaryShown = false;
        this.chaosLevelShown = false;

        // ---------------------------------------------------------------------
        // Final level text
        // ---------------------------------------------------------------------
        this.currentLevelName = 'Luva Girl';

        // ---------------------------------------------------------------------
        // Grammy state
        // ---------------------------------------------------------------------
        this.grammyUnlocked = false;
        this.grammySpawned = false;
        this.grammyCaught = false;
        this.grammyForcedSpawnPending = false;

        // ---------------------------------------------------------------------
        // Special spawn limits
        // ---------------------------------------------------------------------
        this.musicSpawnCount = 0;
        this.ramenSpawnCount = 0;
        this.maxMusicSpawns = 3;
        this.maxRamenSpawns = 3;

        // ---------------------------------------------------------------------
        // Heart texture pool
        // ---------------------------------------------------------------------
        this.heartKeys = ['heartBlue', 'heartGreen', 'heartPink', 'heartYellow'];

        // ---------------------------------------------------------------------
        // Audio refs
        // ---------------------------------------------------------------------
        this.bgMusic = null;
        this.arcadeMusic = null;

        // ---------------------------------------------------------------------
        // HUD refs
        // ---------------------------------------------------------------------
        this.lifeIcons = [];
        this.heartsLabelText = null;
        this.heartsNumberText = null;
        this.endGameButton = null;

        // ---------------------------------------------------------------------
        // Catch zone
        // ---------------------------------------------------------------------
        this.catchZoneY = this.ship.y + 28;
        this.catchZoneBottom = this.ship.y + 48;

        // ---------------------------------------------------------------------
        // Spawn timers
        // ---------------------------------------------------------------------
        this.spawnTimer = null;
        this.extraSpawnTimer = null;

        // ---------------------------------------------------------------------
        // Wave spawn memory
        // ---------------------------------------------------------------------
        this.spawnLanes = [52, 92, 132, 180, 228, 268, 308];
        this.lastSpawnLane = null;
        this.lastTomatoLane = null;
        this.lastSpawnType = null;

        // ---------------------------------------------------------------------
        // First tomato trigger flag
        // ---------------------------------------------------------------------
        this.firstTomatoTriggered = false;

        // ---------------------------------------------------------------------
        // Music mode
        // ---------------------------------------------------------------------
        this.activeMusicMode = 'home';

        // ---------------------------------------------------------------------
        // Dynamic pacing state
        // ---------------------------------------------------------------------
        this.baseWaveSize = 2;
        this.lastWaveSpawnAt = 0;
        this.lastRefillSpawnAt = 0;

        // ---------------------------------------------------------------------
        // Chaos mode state
        // ---------------------------------------------------------------------
        this.chaosThreshold = 300;
        this.chaosModeTriggered = false;
        this.chaosModeActive = false;
        this.chaosText = null;
        this.chaosBlinkTween = null;
        this.chaosFloodTimer = null;
        this.chaosEndTimer = null;

        // ---------------------------------------------------------------------
        // Pointer input
        // ---------------------------------------------------------------------
        this.input.on('pointerdown', (pointer) => {
            this.retryActiveMusic();

            if (this.isGameOver) return;
            if (this.introGateActive) return;

            if (!this.gameStarted && !this.gameCountdownActive) {
                this.ship.x = Phaser.Math.Clamp(pointer.x, 30, 330);
                this.setHomeMoveVisualActive();
                return;
            }

            if (this.gameStarted) {
                this.ship.x = Phaser.Math.Clamp(pointer.x, 30, 330);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isGameOver) return;
            if (this.introGateActive) return;

            if (!this.gameStarted && !this.gameCountdownActive) {
                if (pointer.isDown) {
                    this.ship.x = Phaser.Math.Clamp(pointer.x, 30, 330);
                    this.setHomeMoveVisualActive();
                }
                return;
            }

            if (pointer.isDown && this.gameStarted) {
                this.ship.x = Phaser.Math.Clamp(pointer.x, 30, 330);
            }
        });

        this.input.on('pointerup', () => {
            if (this.introGateActive) return;

            if (!this.gameStarted && !this.gameCountdownActive) {
                this.scheduleHomeIdleRestore();
            }
        });

        // ---------------------------------------------------------------------
        // Audio fallback + intro
        // ---------------------------------------------------------------------
        this.installBrowserAudioFallbacks();
        this.tryStartHomeMusic();
        this.createStartScreen();
        this.createIntroGate();
        this.showIntroGate();
    }

    // =========================================================================
    // BASE SHIP TEXTURE
    // =========================================================================
    getBaseShipTexture() {
        if (this.legendaryShown) {
            return 'LuvaGirlstar';
        }
        return 'LuvaGirl';
    }

    // =========================================================================
    // INTRO GATE
    // =========================================================================
    createIntroGate() {
        this.introGateElements = [];

        this.introGateOverlay = this.add.rectangle(180, 320, 360, 640, 0x000000, 0.18).setAlpha(0);

        this.introGateTitle = this.add.text(180, 230, 'Coco Jones\nLuva Girl', {
            fontSize: '36px',
            align: 'center',
            color: '#ffd6f2',
            stroke: '#ff69b4',
            strokeThickness: 5,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 18, fill: true }
        }).setOrigin(0.5).setAlpha(0).setScale(0.9);

        this.introGateButtonBg = this.add.ellipse(180, 342, 198, 82, 0xff8fcf, 1)
            .setStrokeStyle(5, 0xff69b4)
            .setAlpha(0)
            .setInteractive({ useHandCursor: true });

        this.introGateButtonInner = this.add.ellipse(180, 342, 176, 64, 0xffb7e3, 1)
            .setStrokeStyle(3, 0xd94f9d)
            .setAlpha(0);

        this.introGateButton = this.add.text(180, 342, 'TAP HERE!', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        this.introGateSub = this.add.text(180, 404, 'to play!!', {
            fontSize: '18px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        this.introGateElements.push(
            this.introGateOverlay,
            this.introGateTitle,
            this.introGateButtonBg,
            this.introGateButtonInner,
            this.introGateButton,
            this.introGateSub
        );

        this.introGateButtonBg.on('pointerdown', () => {
            this.pressIntroGateButton();
        });

        this.introGateButtonBg.on('pointerover', () => {
            if (this.isUnlockingIntroGate) return;
            this.introGateButtonBg.setFillStyle(0xff9fd8, 1);
            this.introGateButtonInner.setFillStyle(0xffc7ea, 1);
            this.introGateButton.setScale(1.03);
        });

        this.introGateButtonBg.on('pointerout', () => {
            if (this.isUnlockingIntroGate) return;
            this.introGateButtonBg.setFillStyle(0xff8fcf, 1);
            this.introGateButtonInner.setFillStyle(0xffb7e3, 1);
            this.introGateButtonBg.setScale(1);
            this.introGateButtonInner.setScale(1);
            this.introGateButton.setScale(1);
        });

        this.introGatePulseTween = this.tweens.add({
            targets: [this.introGateButtonBg, this.introGateButtonInner, this.introGateButton],
            scale: { from: 1, to: 1.04 },
            duration: 650,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            paused: true
        });
    }

    showIntroGate() {
        this.cameras.main.fadeIn(320, 0, 0, 0);

        this.tweens.add({
            targets: [
                this.introGateOverlay,
                this.introGateButtonBg,
                this.introGateButtonInner,
                this.introGateButton,
                this.introGateSub
            ],
            alpha: 1,
            duration: 360,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: this.introGateTitle,
            alpha: 1,
            scale: 1,
            duration: 460,
            ease: 'Back.easeOut',
            onComplete: () => {
                if (this.introGatePulseTween) {
                    this.introGatePulseTween.resume();
                }
            }
        });
    }

    pressIntroGateButton() {
        if (!this.introGateActive || this.isGameOver || this.isUnlockingIntroGate) return;

        this.isUnlockingIntroGate = true;
        this.tryStartHomeMusic();

        if (this.introGatePulseTween) {
            this.introGatePulseTween.stop();
            this.introGatePulseTween = null;
        }

        this.introGateButtonBg.setFillStyle(0xe25aa8, 1);
        this.introGateButtonInner.setFillStyle(0xf07fc0, 1);

        this.tweens.add({
            targets: [this.introGateButtonBg, this.introGateButtonInner, this.introGateButton],
            scale: 0.93,
            duration: 90,
            ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(220, () => {
                    this.unlockIntroGate();
                });
            }
        });
    }

    unlockIntroGate() {
        if (!this.introGateActive || this.isGameOver) return;

        this.tryStartHomeMusic();
        this.introGateActive = false;

        this.tweens.add({
            targets: this.introGateElements,
            alpha: 0,
            duration: 260,
            ease: 'Power2',
            onComplete: () => {
                this.destroyIntroGate();
                this.enterHomeScreen();
            }
        });
    }

    destroyIntroGate() {
        if (!this.introGateElements) return;

        this.introGateElements.forEach((el) => {
            if (el && el.active) {
                el.destroy();
            }
        });

        this.introGateElements = [];
        this.introGateOverlay = null;
        this.introGateTitle = null;
        this.introGateButtonBg = null;
        this.introGateButtonInner = null;
        this.introGateButton = null;
        this.introGateSub = null;
        this.isUnlockingIntroGate = false;
    }

    // =========================================================================
    // HOME SCREEN
    // =========================================================================
    enterHomeScreen() {
        this.homeScreenActive = true;
        this.playHomeScreenIntro();
    }

    createStartScreen() {
        this.startScreenElements = [];

        this.introTitle = this.add.text(180, 240, 'Coco Jones\nLuva Girl', {
            fontSize: '34px',
            align: 'center',
            color: '#ffd6f2',
            stroke: '#ff69b4',
            strokeThickness: 5,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 16, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        this.startTitle = this.add.text(180, 86, 'Coco Jones\nLuva Girl', {
            fontSize: '30px',
            align: 'center',
            color: '#ffd6f2',
            stroke: '#ff69b4',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 14, fill: true }
        }).setOrigin(0.5);

        this.howToTitle = this.add.text(180, 146, 'HOW TO PLAY', {
            fontSize: '18px',
            align: 'center',
            color: '#6d3bb8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.howToLine1 = this.add.text(180, 184, '♥ Catch hearts', {
            fontSize: '16px',
            align: 'center',
            color: '#6d3bb8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.howToLine2 = this.add.text(180, 216, '♥ Avoid tomatoes!', {
            fontSize: '16px',
            align: 'center',
            color: '#6d3bb8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.howToLine3 = this.add.text(180, 248, '♥ Bonus items = bonus points', {
            fontSize: '15px',
            align: 'center',
            color: '#6d3bb8',
            fontStyle: 'bold',
            wordWrap: { width: 250, useAdvancedWrap: true }
        }).setOrigin(0.5);

        this.practiceLeftArrow = this.add.text(74, 269, '↘', {
            fontSize: '28px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 3
        }).setOrigin(0.5).setAngle(8);

        this.practiceRightArrow = this.add.text(286, 269, '↙', {
            fontSize: '28px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 3
        }).setOrigin(0.5).setAngle(-8);

        this.practiceText = this.add.text(180, 292, 'PRACTICE SLIDING MINI\nCOCO BEFORE PLAYING!', {
            fontSize: '14px',
            align: 'center',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.madeByStart = this.add.text(180, 400, 'Made by Source', {
            fontSize: '12px',
            color: '#ffffff',
            shadow: { offsetX: 0, offsetY: 0, color: '#6d3bb8', blur: 8, fill: true }
        }).setOrigin(0.5);

        this.presaveButton = this.add.text(180, 320, 'Presave Luva Girl', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffd6f2',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.addButtonFeedback(this.presaveButton, () => {
            window.open('https://link.fans/luvagirl', '_blank');
        }, '#ffd6f2', '#c8a2ff');

        this.presaveArrow = this.add.text(52, 320, '▶', {
            fontSize: '26px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 10, fill: true }
        }).setOrigin(0.5);

        this.startButton = this.add.text(180, 360, 'Start Game', {
            fontSize: '22px',
            backgroundColor: '#333',
            padding: { left: 15, right: 15, top: 10, bottom: 10 },
            color: '#ffff00',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 10, fill: true }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.addButtonFeedback(this.startButton, () => {
            this.startGame();
        }, '#ffff00', '#ff69b4');

        this.startScreenElements.push(
            this.startTitle,
            this.howToTitle,
            this.howToLine1,
            this.howToLine2,
            this.howToLine3,
            this.practiceLeftArrow,
            this.practiceText,
            this.practiceRightArrow,
            this.madeByStart,
            this.presaveButton,
            this.presaveArrow,
            this.startButton
        );

        this.startScreenElements.forEach((el) => {
            el.setAlpha(0);
        });

        this.tweens.add({
            targets: this.presaveArrow,
            angle: { from: -10, to: 10 },
            x: { from: 48, to: 58 },
            duration: 550,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: [this.practiceLeftArrow, this.practiceRightArrow],
            y: '+=6',
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    playHomeScreenIntro() {
        this.ship.setAlpha(0);

        this.tweens.add({
            targets: this.introTitle,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.88, to: 1 },
            duration: 420,
            ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(520, () => {
                    this.tweens.add({
                        targets: this.introTitle,
                        alpha: 0,
                        scale: 1.06,
                        duration: 320,
                        ease: 'Power2',
                        onComplete: () => {
                            this.tweens.add({
                                targets: [this.ship, ...this.startScreenElements],
                                alpha: { from: 0, to: 1 },
                                duration: 360,
                                ease: 'Power2',
                                onComplete: () => {
                                    this.tryStartHomeMusic();

                                    this.time.delayedCall(220, () => {
                                        this.tryStartHomeMusic();
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    }

    addButtonFeedback(button, onPress, baseColor, hoverColor = '#ff69b4') {
        const baseScale = 1;

        button.on('pointerdown', () => {
            button.setColor(hoverColor);
            button.setScale(baseScale * 0.96);
            onPress();
        });

        button.on('pointerup', () => {
            button.setScale(baseScale);
        });

        button.on('pointerout', () => {
            button.setColor(baseColor);
            button.setScale(baseScale);
        });

        button.on('pointerover', () => {
            button.setColor(hoverColor);
        });
    }

    // =========================================================================
    // AUDIO FALLBACKS
    // =========================================================================
    installBrowserAudioFallbacks() {
        const retry = () => {
            this.retryActiveMusic();
        };

        this._browserAudioRetry = retry;

        if (typeof window !== 'undefined') {
            window.addEventListener('pointerdown', retry);
            window.addEventListener('touchstart', retry, { passive: true });
            window.addEventListener('click', retry);

            this._visibilityHandler = () => {
                if (!document.hidden) {
                    this.retryActiveMusic();
                }
            };

            document.addEventListener('visibilitychange', this._visibilityHandler);
        }
    }

    cleanupBrowserAudioFallbacks() {
        if (typeof window === 'undefined') return;

        if (this._browserAudioRetry) {
            window.removeEventListener('pointerdown', this._browserAudioRetry);
            window.removeEventListener('touchstart', this._browserAudioRetry);
            window.removeEventListener('click', this._browserAudioRetry);
            this._browserAudioRetry = null;
        }

        if (this._visibilityHandler) {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
            this._visibilityHandler = null;
        }
    }

    // =========================================================================
    // HOME IDLE / DRAG VISUALS
    // =========================================================================
    setHomeMoveVisualActive() {
        if (this.gameStarted || this.isGameOver || this.gameCountdownActive || this.introGateActive) return;
        if (this.reactionTimer) return;

        this.homePointerMoving = true;

        if (this.ship.texture.key !== 'Luvagirldrag') {
            this.ship.setTexture('Luvagirldrag');
            this.ship.setScale(0.22);
        }

        if (this.homeMoveVisualTimer) {
            this.homeMoveVisualTimer.remove(false);
            this.homeMoveVisualTimer = null;
        }

        this.homeMoveVisualTimer = this.time.addEvent({
            delay: this.homeMoveVisualDelay,
            callback: () => {
                this.homePointerMoving = false;
                this.restoreHomeIdleIfNeeded();
            }
        });
    }

    scheduleHomeIdleRestore() {
        if (this.gameStarted || this.isGameOver || this.gameCountdownActive || this.introGateActive) return;

        if (this.homeMoveVisualTimer) {
            this.homeMoveVisualTimer.remove(false);
        }

        this.homeMoveVisualTimer = this.time.addEvent({
            delay: this.homeMoveVisualDelay,
            callback: () => {
                this.homePointerMoving = false;
                this.restoreHomeIdleIfNeeded();
            }
        });
    }

    restoreHomeIdleIfNeeded() {
        if (this.gameStarted || this.isGameOver || this.gameCountdownActive || this.introGateActive) return;
        if (this.homePointerMoving) return;
        if (this.reactionTimer) return;

        if (this.ship && this.ship.active && this.ship.texture.key !== 'LuvaGirl') {
            this.ship.setTexture('LuvaGirl');
            this.ship.setScale(0.22);
            this.ship.angle = 0;
            this.ship.y = this.shipBaseY;
        }
    }

    // =========================================================================
    // MUSIC
    // =========================================================================
    tryStartHomeMusic() {
        if (this.isGameOver || this.gameStarted || this.gameCountdownActive) return;
        if (!this.sound || !this.cache.audio.exists('arcadeMusic')) return;

        this.activeMusicMode = 'home';

        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        if (!this.arcadeMusic) {
            this.arcadeMusic = this.sound.add('arcadeMusic', { loop: true, volume: 0.55 });
        }

        if (!this.arcadeMusic.isPlaying) {
            try {
                this.arcadeMusic.play();
            } catch (e) {}
        }
    }

    stopHomeMusic() {
        if (this.arcadeMusic && this.arcadeMusic.isPlaying) {
            this.arcadeMusic.stop();
        }
    }

    tryStartGameplayMusic() {
        if (this.isGameOver || !this.sound || !this.cache.audio.exists('bgMusic')) return;

        this.activeMusicMode = 'game';

        if (this.arcadeMusic && this.arcadeMusic.isPlaying) {
            this.arcadeMusic.stop();
        }

        if (!this.bgMusic) {
            this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.55 });
        }

        if (!this.bgMusic.isPlaying) {
            try {
                this.bgMusic.play();
            } catch (e) {}
        }
    }

    retryActiveMusic() {
        if (this.isGameOver) return;

        if (this.activeMusicMode === 'home' && !this.gameStarted && !this.gameCountdownActive) {
            this.tryStartHomeMusic();
            return;
        }

        if (this.activeMusicMode === 'game') {
            this.tryStartGameplayMusic();
        }
    }

    // =========================================================================
    // GAME START FLOW
    // =========================================================================
    startGame() {
        if (this.gameStarted || this.gameCountdownActive || this.isGameOver || this.introGateActive) return;

        this.gameCountdownActive = true;
        this.activeMusicMode = 'game';

        if (this.homeMoveVisualTimer) {
            this.homeMoveVisualTimer.remove(false);
            this.homeMoveVisualTimer = null;
        }

        this.homePointerMoving = false;
        this.ship.setTexture(this.getBaseShipTexture());
        this.ship.setScale(0.22);

        this.stopHomeMusic();
        this.destroyStartScreen();
        this.showPreCountdownHomeScreen();
    }

    destroyStartScreen() {
        const startElements = [
            this.introTitle,
            this.startTitle,
            this.howToTitle,
            this.howToLine1,
            this.howToLine2,
            this.howToLine3,
            this.practiceLeftArrow,
            this.practiceText,
            this.practiceRightArrow,
            this.madeByStart,
            this.startButton,
            this.presaveButton,
            this.presaveArrow
        ];

        startElements.forEach((el) => {
            if (el && el.active) {
                el.destroy();
            }
        });
    }

    showPreCountdownHomeScreen() {
        this.preCountdownOverlay = this.add.rectangle(180, 320, 360, 640, 0x000000, 0.22).setAlpha(0);

        this.preCountdownTitle = this.add.text(180, 250, 'Coco Jones\nLuva Girl', {
            fontSize: '34px',
            align: 'center',
            color: '#ffd6f2',
            stroke: '#ff69b4',
            strokeThickness: 5,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 16, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: [this.preCountdownOverlay, this.preCountdownTitle],
            alpha: 1,
            duration: 220,
            onComplete: () => {
                this.time.delayedCall(700, () => {
                    this.tweens.add({
                        targets: [this.preCountdownOverlay, this.preCountdownTitle],
                        alpha: 0,
                        duration: 220,
                        onComplete: () => {
                            if (this.preCountdownOverlay) this.preCountdownOverlay.destroy();
                            if (this.preCountdownTitle) this.preCountdownTitle.destroy();
                            this.runCountdown();
                        }
                    });
                });
            }
        });
    }

    runCountdown() {
        const countdownText = this.add.text(180, 320, '3', {
            fontSize: '58px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 5,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 18, fill: true }
        }).setOrigin(0.5);

        const numbers = ['3', '2', '1'];
        let index = 0;

        const showNext = () => {
            if (index >= numbers.length) {
                countdownText.destroy();
                this.beginGameplay();
                return;
            }

            countdownText.setText(numbers[index]);
            countdownText.setScale(0.72);
            countdownText.setAlpha(1);

            this.tweens.add({
                targets: countdownText,
                scale: 1.05,
                alpha: 1,
                duration: 180,
                ease: 'Power2'
            });

            index += 1;
            this.time.delayedCall(360, showNext);
        };

        showNext();
    }

    // =========================================================================
    // GAMEPLAY BOOT
    // =========================================================================
    beginGameplay() {
        this.gameCountdownActive = false;
        this.gameStarted = true;

        this.setupHUD();
        this.tryStartGameplayMusic();

        // Initial wave is intentionally small.
        this.spawnWave(this.baseWaveSize);

        // Fast polling timer, but actual spawn allowed depends on score pacing.
        this.spawnTimer = this.time.addEvent({
            delay: 180,
            callback: () => {
                this.maybeRunMainWave();
            },
            callbackScope: this,
            loop: true
        });

        // Refill timer is score-aware and much lighter before 20 hearts.
        this.extraSpawnTimer = this.time.addEvent({
            delay: 220,
            callback: () => {
                this.maybeRunRefillWave();
            },
            callbackScope: this,
            loop: true
        });
    }

    maybeRunMainWave() {
        if (this.isGameOver || !this.gameStarted || this.chaosModeActive) return;

        const now = this.time.now;
        const neededDelay = this.getWaveDelayByHearts();

        if (now - this.lastWaveSpawnAt < neededDelay) {
            return;
        }

        this.lastWaveSpawnAt = now;
        this.spawnWave(this.baseWaveSize);
    }

    maybeRunRefillWave() {
        if (this.isGameOver || !this.gameStarted || this.chaosModeActive) return;

        const targetActive = this.getTargetActiveItemsByHearts();
        const currentActive = this.countActiveFallingItems();

        if (currentActive >= targetActive) {
            return;
        }

        const now = this.time.now;
        const refillDelay = this.getRefillDelayByHearts();

        if (now - this.lastRefillSpawnAt < refillDelay) {
            return;
        }

        this.lastRefillSpawnAt = now;

        const deficit = targetActive - currentActive;
        const refillCount = Phaser.Math.Clamp(deficit, 1, this.baseWaveSize);

        this.spawnWave(refillCount);
    }

    countActiveFallingItems() {
        let total = 0;

        this.items.children.iterate((item) => {
            if (!item || !item.active) return;
            if (item.y < this.catchZoneY - 40) {
                total += 1;
            }
        });

        return total;
    }

    getWaveDelayByHearts() {
        // 0–4: very slow learning phase
        if (this.heartsCaught < 5) {
            return 1150;
        }

        // 5–19: still light
        if (this.heartsCaught < 20) {
            return 900;
        }

        // 20–59: fuller, but controlled
        if (this.heartsCaught < 60) {
            return 700;
        }

        // 60–99: ICON and readable pressure
        if (this.heartsCaught < 100) {
            return 620;
        }

        // 100–199: harder
        if (this.heartsCaught < 200) {
            return 560;
        }

        // 200–299: high pressure, still not nonsense
        return 520;
    }

    getRefillDelayByHearts() {
        if (this.heartsCaught < 5) {
            return 1400;
        }

        if (this.heartsCaught < 20) {
            return 1100;
        }

        if (this.heartsCaught < 60) {
            return 850;
        }

        if (this.heartsCaught < 100) {
            return 700;
        }

        if (this.heartsCaught < 200) {
            return 620;
        }

        return 580;
    }

    getTargetActiveItemsByHearts() {
        // Deliberately light early.
        if (this.heartsCaught < 5) {
            return 1;
        }

        if (this.heartsCaught < 20) {
            return 2;
        }

        if (this.heartsCaught < 60) {
            return 3;
        }

        if (this.heartsCaught < 100) {
            return 4;
        }

        if (this.heartsCaught < 200) {
            return 4;
        }

        return 5;
    }

    // =========================================================================
    // GRAMMY EVENT
    // =========================================================================
    triggerGrammyEvent() {
        if (this.isGameOver || this.grammySpawned || this.grammyCaught || this.chaosModeActive) return;

        if (this.spawnTimer) this.spawnTimer.paused = true;
        if (this.extraSpawnTimer) this.extraSpawnTimer.paused = true;

        const dim = this.add.rectangle(180, 320, 360, 640, 0x000000, 0.35);

        this.items.children.iterate((item) => {
            if (!item) return;
            if (item.y < 200) {
                if (item.glowSprite && item.glowSprite.active) {
                    item.glowSprite.destroy();
                }
                item.destroy();
            }
        });

        const grammy = this.add.image(180, -60, 'grammy').setScale(0.32);

        grammy.itemKind = 'bonus';
        grammy.itemValue = 10;
        grammy.itemType = 'grammy';
        grammy.speed = Math.max(2, this.currentFallSpeed * 0.55);
        grammy.catchWidth = 42;
        grammy.catchHeight = 42;
        grammy.angleSpeed = 0.25;
        grammy.baseScale = 0.32;
        grammy.pulseSpeed = 0.2;
        grammy.pulseAmount = 0.03;
        grammy.pulseTime = 0;
        grammy.safePassed = false;

        this.grammySpawned = true;

        if (grammy.preFX) {
            grammy.preFX.addGlow(0xffe066, 12, 0, false, 0.15, 16);
        }

        this.items.add(grammy);

        for (let i = 0; i < 10; i++) {
            const sparkle = this.add.text(
                180 + Phaser.Math.Between(-40, 40),
                Phaser.Math.Between(40, 120),
                '✨',
                { fontSize: '18px' }
            ).setOrigin(0.5);

            this.tweens.add({
                targets: sparkle,
                y: sparkle.y + Phaser.Math.Between(80, 140),
                x: sparkle.x + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: 900,
                onComplete: () => sparkle.destroy()
            });
        }

        this.time.delayedCall(1800, () => {
            this.tweens.add({
                targets: dim,
                alpha: 0,
                duration: 300,
                onComplete: () => dim.destroy()
            });

            if (this.spawnTimer) this.spawnTimer.paused = false;
            if (this.extraSpawnTimer) this.extraSpawnTimer.paused = false;
        });
    }

    // =========================================================================
    // HUD
    // =========================================================================
    setupHUD() {
        this.add.text(10, 8, 'Coco Jones', { fontSize: '12px', color: '#ffffff' });
        this.add.text(10, 22, 'Luva Girl', { fontSize: '12px', color: '#ffffff' });

        this.heartsLabelText = this.add.text(180, 8, 'Hearts', {
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 8, fill: true }
        }).setOrigin(0.5, 0);

        this.heartsNumberText = this.add.text(180, 24, '0', {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 8, fill: true }
        }).setOrigin(0.5, 0);

        this.createLifeIcons();

        this.endGameButton = this.add.text(332, 48, 'End', {
            fontSize: '12px',
            color: '#ffff00',
            backgroundColor: '#333',
            padding: { left: 6, right: 6, top: 4, bottom: 4 },
            stroke: '#ff69b4',
            strokeThickness: 1,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 8, fill: true }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

        this.endGameButton.on('pointerdown', () => {
            this.endGame();
        });

        this.endGameButton.on('pointerover', () => {
            this.endGameButton.setColor('#ff69b4');
        });

        this.endGameButton.on('pointerout', () => {
            this.endGameButton.setColor('#ffff00');
        });
    }

    createLifeIcons() {
        this.lifeIcons = [];
        const startX = 290;
        const y = 20;
        const spacing = 28;

        for (let i = 0; i < 3; i++) {
            const icon = this.add.image(startX + (i * spacing), y, 'lifeFull')
                .setScale(0.2)
                .setOrigin(0.5, 0.5);
            this.lifeIcons.push(icon);
        }
    }

    updateLivesDisplay() {
        for (let i = 0; i < this.lifeIcons.length; i++) {
            if (i < this.lives) {
                this.lifeIcons[i].setTexture('lifeFull');
            } else {
                this.lifeIcons[i].setTexture('lifeLost');
            }
        }
    }

    // =========================================================================
    // UPDATE LOOP
    // =========================================================================
    update() {
        if (this.isGameOver) return;

        let movedThisFrame = false;

        if (!this.introGateActive) {
            if (this.cursors.left.isDown) {
                this.ship.x -= 5;
                movedThisFrame = true;
            }

            if (this.cursors.right.isDown) {
                this.ship.x += 5;
                movedThisFrame = true;
            }

            if (this.ship.x < 30) this.ship.x = 30;
            if (this.ship.x > 330) this.ship.x = 330;
        }

        if (!this.gameStarted) {
            if (!this.gameCountdownActive && !this.introGateActive) {
                if (movedThisFrame) {
                    this.setHomeMoveVisualActive();
                } else {
                    this.restoreHomeIdleIfNeeded();
                }
            }
            return;
        }

        this.items.children.iterate((item) => {
            if (!item || !item.active) return;

            item.y += item.speed;

            if (item.angleSpeed) {
                item.angle += item.angleSpeed;
            }

            if (item.pulseSpeed) {
                item.pulseTime += item.pulseSpeed;
                const scaleOffset = Math.sin(item.pulseTime) * item.pulseAmount;
                item.setScale(item.baseScale + scaleOffset);
            }

            if (item.glowSprite && item.glowSprite.active) {
                item.glowSprite.x = item.x;
                item.glowSprite.y = item.y;
                item.glowSprite.angle = item.angle;
                item.glowSprite.setScale(item.scale * 1.35);
            }

            if (item.y > this.catchZoneBottom) {
                item.safePassed = true;
            }

            if (item.y > this.gameHeight + 70) {
                if (item.itemType === 'grammy') {
                    this.grammySpawned = true;
                }
                if (item.glowSprite && item.glowSprite.active) {
                    item.glowSprite.destroy();
                }
                item.destroy();
                return;
            }

            if (item.safePassed) {
                return;
            }

            const catchX = this.ship.x;
            const catchY = this.catchZoneY;
            const dx = Math.abs(item.x - catchX);
            const dy = Math.abs(item.y - catchY);

            if (dx < item.catchWidth && dy < item.catchHeight) {
                this.handleCaughtItem(item);
            }
        });

        this.checkLevelProgress();
    }

    // =========================================================================
    // SAFE LANES
    // =========================================================================
    getSafeLaneIndexes() {
        // One protected lane only.
        const laneCount = this.spawnLanes.length;
        const safeLane = Phaser.Math.Between(0, laneCount - 1);
        return [safeLane];
    }

    // =========================================================================
    // SPAWN LANE PICKING
    // =========================================================================
    getSpawnX(type, usedLaneIndexes = [], blockedLaneIndexes = []) {
        let availableLaneIndexes = this.spawnLanes
            .map((_, index) => index)
            .filter((index) => !usedLaneIndexes.includes(index));

        if (type === 'tomato') {
            availableLaneIndexes = availableLaneIndexes.filter((index) => !blockedLaneIndexes.includes(index));

            if (this.lastTomatoLane !== null) {
                const filteredByDistance = availableLaneIndexes.filter((index) => Math.abs(index - this.lastTomatoLane) >= 2);
                if (filteredByDistance.length > 0) {
                    availableLaneIndexes = filteredByDistance;
                }
            }
        } else {
            if (this.lastSpawnLane !== null) {
                const filteredNoRepeat = availableLaneIndexes.filter((index) => index !== this.lastSpawnLane);
                if (filteredNoRepeat.length > 0) {
                    availableLaneIndexes = filteredNoRepeat;
                }
            }
        }

        if (availableLaneIndexes.length === 0) {
            availableLaneIndexes = this.spawnLanes
                .map((_, index) => index)
                .filter((index) => !usedLaneIndexes.includes(index));

            if (type === 'tomato') {
                const relaxedSafeFilter = availableLaneIndexes.filter((index) => !blockedLaneIndexes.includes(index));
                if (relaxedSafeFilter.length > 0) {
                    availableLaneIndexes = relaxedSafeFilter;
                }
            }
        }

        if (availableLaneIndexes.length === 0) {
            availableLaneIndexes = this.spawnLanes.map((_, index) => index);
        }

        const laneIndex = Phaser.Utils.Array.GetRandom(availableLaneIndexes);
        const x = this.spawnLanes[laneIndex];

        this.lastSpawnLane = laneIndex;

        if (type === 'tomato') {
            this.lastTomatoLane = laneIndex;
        } else if (type !== 'grammy') {
            this.lastTomatoLane = null;
        }

        return { x, laneIndex };
    }

    // =========================================================================
    // WAVE TOMATO LIMITS
    // =========================================================================
    getMaxTomatoesPerWave() {
        // Keep early game readable.
        if (this.heartsCaught < 20) {
            return 1;
        }

        // Mid game still moderate.
        if (this.heartsCaught < 60) {
            return 1;
        }

        // ICON+ can allow 2 tomatoes in a 2-item wave.
        return 2;
    }

    // =========================================================================
    // WAVE SPAWNING
    // =========================================================================
    spawnWave(count = 2) {
        if (this.isGameOver || !this.gameStarted) return;
        if (this.chaosModeActive) return;

        const usedLaneIndexes = [];
        const safeLaneIndexes = this.getSafeLaneIndexes();
        const spawnCount = Math.max(1, count);

        const maxTomatoesThisWave = this.getMaxTomatoesPerWave();
        let tomatoCountThisWave = 0;

        if (this.grammyForcedSpawnPending && this.grammyUnlocked && !this.grammySpawned && !this.grammyCaught) {
            const forcedGrammy = this.spawnSpecificItem('grammy', usedLaneIndexes, safeLaneIndexes);
            if (forcedGrammy && typeof forcedGrammy.laneIndex === 'number') {
                usedLaneIndexes.push(forcedGrammy.laneIndex);
            }
            this.grammyForcedSpawnPending = false;
        }

        for (let i = usedLaneIndexes.length; i < spawnCount; i++) {
            let type = this.chooseItemType();

            if (type === 'tomato' && tomatoCountThisWave >= maxTomatoesThisWave) {
                // Convert extra tomato rolls to hearts after the limit.
                type = 'heart';
            }

            const created = this.spawnSpecificItem(type, usedLaneIndexes, safeLaneIndexes);

            if (created && type === 'tomato') {
                tomatoCountThisWave += 1;
            }

            if (created && typeof created.laneIndex === 'number') {
                usedLaneIndexes.push(created.laneIndex);
            }
        }
    }

    // =========================================================================
    // GLOW EFFECTS
    // =========================================================================
    addPurpleGlow(item) {
        if (!item) return;

        if (item.preFX) {
            item.preFX.addGlow(0xb14dff, 8, 0, false, 0.12, 12);
            return;
        }

        if (item.postFX) {
            item.postFX.addGlow(0xb14dff, 0.45, 0, false, 0.12, 12);
            return;
        }

        const glow = this.add.image(item.x, item.y, item.texture.key)
            .setScale(item.scale * 1.35)
            .setAlpha(0.22)
            .setTint(0xb14dff);

        glow.setDepth(item.depth - 1);
        item.glowSprite = glow;
    }

    // =========================================================================
    // ITEM CREATION
    // =========================================================================
    spawnSpecificItem(type, usedLaneIndexes = [], safeLaneIndexes = []) {
        if (this.isGameOver) return null;

        if (type === 'grammy' && (!this.grammyUnlocked || this.grammySpawned || this.grammyCaught)) {
            return null;
        }

        const blockedLaneIndexes = type === 'tomato' ? safeLaneIndexes : [];
        const spawnData = this.getSpawnX(type, usedLaneIndexes, blockedLaneIndexes);
        const x = spawnData.x;

        let item = null;

        if (type === 'heart') {
            const randomHeart = Phaser.Utils.Array.GetRandom(this.heartKeys);
            item = this.add.image(x, -34, randomHeart).setScale(0.24);
            item.itemKind = 'good';
            item.itemValue = 1;
            item.itemType = 'heart';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 38;
            item.catchHeight = 34;
            item.angleSpeed = 0.12;
            item.baseScale = 0.24;
            item.safePassed = false;
        }

        if (type === 'tomato') {
            item = this.add.image(x, -34, 'tomato').setScale(0.23);
            item.itemKind = 'bad';
            item.itemValue = 1;
            item.itemType = 'tomato';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 30;
            item.catchHeight = 30;
            item.angleSpeed = -0.18;
            item.baseScale = 0.23;
            item.safePassed = false;
        }

        if (type === 'ramen') {
            item = this.add.image(x, -34, 'ramenItem').setScale(0.22);
            item.itemKind = 'good';
            item.itemValue = 2;
            item.itemType = 'ramen';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 36;
            item.catchHeight = 34;
            item.angleSpeed = 0.18;
            item.baseScale = 0.22;
            item.safePassed = false;
            this.addPurpleGlow(item);
        }

        if (type === 'music') {
            item = this.add.image(x, -34, 'noteItem').setScale(0.22);
            item.itemKind = 'good';
            item.itemValue = 2;
            item.itemType = 'music';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 36;
            item.catchHeight = 34;
            item.angleSpeed = 0.18;
            item.baseScale = 0.22;
            item.safePassed = false;
            this.addPurpleGlow(item);
        }

        if (type === 'grammy') {
            item = this.add.image(x, -38, 'grammy').setScale(0.3);
            item.itemKind = 'bonus';
            item.itemValue = 10;
            item.itemType = 'grammy';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 40;
            item.catchHeight = 40;
            item.angleSpeed = 0.35;
            item.baseScale = 0.3;
            item.pulseSpeed = 0.18;
            item.pulseAmount = 0.02;
            item.pulseTime = 0;
            item.safePassed = false;
            this.grammySpawned = true;

            if (item.preFX) {
                item.preFX.addGlow(0x8fdcff, 10, 0, false, 0.15, 16);
            }
        }

        if (!item) return null;

        this.lastSpawnType = type;
        this.items.add(item);

        return {
            item,
            laneIndex: spawnData.laneIndex
        };
    }

    // =========================================================================
    // SCORE / LEVEL SPAWN RATIOS
    // =========================================================================
    getSpawnWeights() {
        // ---------------------------------------------------------------------
        // 0–4 hearts
        // ---------------------------------------------------------------------
        if (this.heartsCaught < 5) {
            return {
                heart: 100,
                tomato: 0,
                ramen: 0,
                music: 0,
                grammy: 0
            };
        }

        // ---------------------------------------------------------------------
        // 5–14 hearts
        // Light danger phase.
        // ---------------------------------------------------------------------
        if (this.heartsCaught < 15) {
            return {
                heart: 78,
                tomato: 22,
                ramen: 0,
                music: 0,
                grammy: 0
            };
        }

        // ---------------------------------------------------------------------
        // 15–29 hearts (Star)
        // ---------------------------------------------------------------------
        if (this.heartsCaught < 30) {
            return {
                heart: 68,
                tomato: 28,
                ramen: 2,
                music: 2,
                grammy: 0
            };
        }

        // ---------------------------------------------------------------------
        // 30–59 hearts (Super Star)
        // ---------------------------------------------------------------------
        if (this.heartsCaught < 60) {
            return {
                heart: 57,
                tomato: 37,
                ramen: 3,
                music: 3,
                grammy: 0
            };
        }

        // ---------------------------------------------------------------------
        // 60–99 hearts (ICON)
        // Tomatoes are 3% more common than hearts.
        // heart 43 / tomato 46
        // ---------------------------------------------------------------------
        if (this.heartsCaught < 100) {
            return {
                heart: 43,
                tomato: 46,
                ramen: 5,
                music: 4,
                grammy: 2
            };
        }

        // ---------------------------------------------------------------------
        // 100–199 hearts (Legendary range)
        // Hard, but controlled.
        // ---------------------------------------------------------------------
        if (this.heartsCaught < 200) {
            return {
                heart: 40,
                tomato: 48,
                ramen: 5,
                music: 5,
                grammy: 2
            };
        }

        // ---------------------------------------------------------------------
        // 200–299 hearts
        // Slightly harsher, still readable.
        // ---------------------------------------------------------------------
        return {
            heart: 38,
            tomato: 50,
            ramen: 5,
            music: 5,
            grammy: 2
        };
    }

    chooseItemType() {
        if (this.chaosModeActive) {
            return 'tomato';
        }

        const weights = this.getSpawnWeights();

        // Grammy gated by unlock/caught/spawn state.
        if (!this.grammyUnlocked || this.grammySpawned || this.grammyCaught) {
            weights.grammy = 0;
        }

        // Ramen/music are capped globally.
        if (this.ramenSpawnCount >= this.maxRamenSpawns) {
            weights.ramen = 0;
        }

        if (this.musicSpawnCount >= this.maxMusicSpawns) {
            weights.music = 0;
        }

        const total =
            weights.heart +
            weights.tomato +
            weights.ramen +
            weights.music +
            weights.grammy;

        if (total <= 0) {
            return 'heart';
        }

        let roll = Phaser.Math.Between(1, total);

        if (roll <= weights.heart) {
            return 'heart';
        }
        roll -= weights.heart;

        if (roll <= weights.tomato) {
            return 'tomato';
        }
        roll -= weights.tomato;

        if (roll <= weights.ramen) {
            this.ramenSpawnCount += 1;
            return 'ramen';
        }
        roll -= weights.ramen;

        if (roll <= weights.music) {
            this.musicSpawnCount += 1;
            return 'music';
        }

        return 'grammy';
    }

    // =========================================================================
    // ITEM HANDLING
    // =========================================================================
    handleCaughtItem(item) {
        if (this.isGameOver) return;

        const kind = item.itemKind;
        const value = item.itemValue;
        const x = item.x;
        const y = item.y;
        const itemType = item.itemType;

        if (item.glowSprite && item.glowSprite.active) {
            item.glowSprite.destroy();
        }

        item.destroy();

        if (kind === 'good') {
            this.heartsCaught += value;

            if (this.heartsNumberText) {
                this.heartsNumberText.setText(String(this.heartsCaught));
            }

            if (itemType === 'ramen' || itemType === 'music') {
                this.showPlayerReaction('bonus');
                this.triggerVibration([35, 25, 45]);
            }

            if (this.heartsCaught >= 5 && !this.firstTomatoTriggered) {
                this.firstTomatoTriggered = true;
                // One early tomato introduction, but still fair.
                this.spawnSpecificItem('tomato', [], this.getSafeLaneIndexes());
            }

            if (value === 2) {
                this.showFloatingScore('+2');
            } else {
                this.showFloatingScore('+1');
            }

            // Chaos trigger check immediately after scoring.
            if (this.heartsCaught >= this.chaosThreshold && !this.chaosModeTriggered) {
                this.startChaosMode();
            }

            return;
        }

        if (kind === 'bonus') {
            this.heartsCaught += value;

            if (this.heartsNumberText) {
                this.heartsNumberText.setText(String(this.heartsCaught));
            }

            this.grammyCaught = true;
            this.showCenteredFloatingScore('Grammy Bonus +10');
            this.showGrammySparkles(x, y);
            this.showPlayerReaction('bonus');
            this.triggerVibration([80, 40, 120]);

            if (this.heartsCaught >= this.chaosThreshold && !this.chaosModeTriggered) {
                this.startChaosMode();
            }

            return;
        }

        if (kind === 'bad') {
            this.lives -= 1;
            this.updateLivesDisplay();
            this.showPlayerReaction('bad');
            this.showBadPenalty();
            this.triggerVibration(140);

            if (this.lives <= 0) {
                this.endGame();
            }
        }
    }

    // =========================================================================
    // PLAYER REACTIONS
    // =========================================================================
    showPlayerReaction(type) {
        if (!this.ship || !this.ship.active || this.isGameOver) return;

        if (this.reactionTimer) {
            this.reactionTimer.remove(false);
            this.reactionTimer = null;
        }

        this.tweens.killTweensOf(this.ship);
        this.ship.angle = 0;
        this.ship.y = this.shipBaseY;

        if (type === 'bad') {
            this.ship.setTexture('LuvaGirlBad');
            this.ship.setScale(0.22);

            this.tweens.add({
                targets: this.ship,
                angle: { from: -6, to: 6 },
                duration: 90,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    if (this.ship && this.ship.active && !this.isGameOver) {
                        this.ship.angle = 0;
                    }
                }
            });
        }

        if (type === 'bonus') {
            this.ship.setTexture('LuvaGirlBonus');
            this.ship.setScale(0.23);
            this.ship.y = this.shipBaseY - 2;

            this.tweens.add({
                targets: this.ship,
                y: this.shipBaseY - 12,
                duration: 120,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    if (this.ship && this.ship.active && !this.isGameOver) {
                        this.ship.y = this.shipBaseY;
                    }
                }
            });
        }

        this.reactionTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                this.reactionTimer = null;

                if (this.ship && this.ship.active && !this.isGameOver) {
                    this.ship.setTexture(this.getBaseShipTexture());
                    this.ship.setScale(0.22);
                    this.ship.angle = 0;
                    this.ship.y = this.shipBaseY;
                }
            }
        });
    }

    // =========================================================================
    // GRAMMY SPARKLES
    // =========================================================================
    showGrammySparkles(x, y) {
        for (let i = 0; i < 6; i++) {
            const sparkle = this.add.text(
                x + Phaser.Math.Between(-20, 20),
                y + Phaser.Math.Between(-20, 20),
                '✨',
                { fontSize: '20px' }
            ).setOrigin(0.5);

            this.tweens.add({
                targets: sparkle,
                x: sparkle.x + Phaser.Math.Between(-25, 25),
                y: sparkle.y + Phaser.Math.Between(-35, 10),
                alpha: 0,
                scale: 1.3,
                duration: 700,
                onComplete: () => sparkle.destroy()
            });
        }
    }

    // =========================================================================
    // SPEED / LEVEL PROGRESSION
    // =========================================================================
    updateFallSpeedByHearts() {
        if (this.heartsCaught >= 200) {
            this.currentFallSpeed = 9;
            return;
        }

        if (this.heartsCaught >= 100) {
            this.currentFallSpeed = 8;
            return;
        }

        if (this.heartsCaught >= 60) {
            this.currentFallSpeed = 7;
            return;
        }

        if (this.heartsCaught >= 30) {
            this.currentFallSpeed = 6;
            return;
        }

        if (this.heartsCaught >= 20) {
            this.currentFallSpeed = 5;
            return;
        }

        if (this.heartsCaught >= 5) {
            this.currentFallSpeed = 4;
            return;
        }

        this.currentFallSpeed = 2;
    }

    checkLevelProgress() {
        if (this.chaosModeTriggered) {
            return;
        }

        this.updateFallSpeedByHearts();

        if (this.heartsCaught >= this.chaosThreshold && !this.chaosModeTriggered) {
            this.startChaosMode();
            return;
        }

        if (this.heartsCaught >= 100 && !this.legendaryShown) {
            this.legendaryShown = true;
            this.currentLevelName = 'Legendary Level';

            if (!this.reactionTimer && this.ship && this.ship.active) {
                this.ship.setTexture('LuvaGirlstar');
                this.ship.setScale(0.22);
            }

            this.showLevelMessage('Legendary Level Reached');
            return;
        }

        if (this.heartsCaught >= 60 && !this.iconLevelShown) {
            this.iconLevelShown = true;
            this.currentLevelName = 'ICON Level';
            this.background.setTexture('backgroundgames2');

            // Grammy now unlocks at ICON.
            this.grammyUnlocked = true;
            this.grammyForcedSpawnPending = true;

            this.showLevelMessage('ICON Level Reached');

            if (this.gameStarted && !this.isGameOver && !this.grammySpawned && !this.grammyCaught) {
                this.triggerGrammyEvent();
            }
            return;
        }

        if (this.heartsCaught >= 30 && !this.superStarShown) {
            this.superStarShown = true;
            this.currentLevelName = 'Super Star Level';
            this.showLevelMessage('Super Star Level Reached');
            return;
        }

        if (this.heartsCaught >= 15 && !this.starLevelShown) {
            this.starLevelShown = true;
            this.currentLevelName = 'Star Level';
            this.showLevelMessage('Star Level Reached');
            return;
        }
    }

    // =========================================================================
    // CHAOS MODE
    // =========================================================================
    startChaosMode() {
        if (this.chaosModeTriggered || this.isGameOver) return;

        this.chaosModeTriggered = true;
        this.chaosModeActive = true;
        this.chaosLevelShown = true;
        this.currentLevelName = 'Chaos Level.. Oops';

        if (this.spawnTimer) this.spawnTimer.paused = true;
        if (this.extraSpawnTimer) this.extraSpawnTimer.paused = true;

        // Clear hearts/bonus near the top so the chaos read is cleaner.
        this.items.children.iterate((item) => {
            if (!item || !item.active) return;

            if (item.itemType !== 'tomato' && item.y < 240) {
                if (item.glowSprite && item.glowSprite.active) {
                    item.glowSprite.destroy();
                }
                item.destroy();
            }
        });

        this.chaosText = this.add.text(180, 240, 'SOURCE\nCHAOS MODE\nACTIVATED', {
            fontSize: '26px',
            align: 'center',
            color: '#ff6666',
            stroke: '#4b0000',
            strokeThickness: 5,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff3333', blur: 16, fill: true }
        }).setOrigin(0.5).setDepth(999);

        this.chaosBlinkTween = this.tweens.add({
            targets: this.chaosText,
            alpha: { from: 1, to: 0.2 },
            duration: 160,
            yoyo: true,
            repeat: -1
        });

        // Flood tomatoes for a brief dramatic finish.
        this.chaosFloodTimer = this.time.addEvent({
            delay: 110,
            callback: () => {
                this.spawnChaosTomatoes();
            },
            callbackScope: this,
            loop: true
        });

        this.chaosEndTimer = this.time.delayedCall(1900, () => {
            if (this.chaosFloodTimer) {
                this.chaosFloodTimer.remove(false);
                this.chaosFloodTimer = null;
            }

            if (this.chaosBlinkTween) {
                this.chaosBlinkTween.stop();
                this.chaosBlinkTween = null;
            }

            if (this.chaosText && this.chaosText.active) {
                this.chaosText.destroy();
                this.chaosText = null;
            }

            this.endGame();
        });
    }

    spawnChaosTomatoes() {
        if (this.isGameOver) return;

        const used = [];

        for (let i = 0; i < 2; i++) {
            const data = this.getSpawnX('tomato', used, []);
            used.push(data.laneIndex);

            const tomato = this.add.image(data.x, -34, 'tomato').setScale(0.23);
            tomato.itemKind = 'bad';
            tomato.itemValue = 1;
            tomato.itemType = 'tomato';
            tomato.speed = Math.max(this.currentFallSpeed + 2, 9);
            tomato.catchWidth = 30;
            tomato.catchHeight = 30;
            tomato.angleSpeed = -0.25;
            tomato.baseScale = 0.23;
            tomato.safePassed = false;

            this.items.add(tomato);
        }
    }

    // =========================================================================
    // FLOATING MESSAGES
    // =========================================================================
    showLevelMessage(text) {
        const levelText = this.add.text(180, 245, text, {
            fontSize: '24px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 16, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: levelText,
            alpha: 0,
            scale: 1.08,
            delay: 1000,
            duration: 900,
            onComplete: () => {
                levelText.destroy();
            }
        });
    }

    showFloatingScore(text) {
        const msg = this.add.text(this.ship.x, this.ship.y - 95, text, {
            fontSize: '22px',
            color: '#ffff66',
            stroke: '#000',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 0, color: '#ffff66', blur: 12, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            y: msg.y - 55,
            alpha: 0,
            duration: 1200,
            onComplete: () => {
                msg.destroy();
            }
        });
    }

    showCenteredFloatingScore(text) {
        const msg = this.add.text(180, this.ship.y - 95, text, {
            fontSize: '22px',
            color: '#ffff66',
            stroke: '#000',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 0, color: '#ffff66', blur: 12, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            y: msg.y - 55,
            alpha: 0,
            duration: 1200,
            onComplete: () => {
                msg.destroy();
            }
        });
    }

    showBadPenalty() {
        const msg = this.add.text(this.ship.x, this.ship.y - 100, '-1 Eeyuck', {
            fontSize: '22px',
            color: '#ff4d4d',
            stroke: '#4b0000',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff4d4d', blur: 10, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            y: msg.y - 45,
            alpha: 0,
            duration: 1100,
            onComplete: () => {
                msg.destroy();
            }
        });
    }

    // =========================================================================
    // VIBRATION
    // =========================================================================
    triggerVibration(pattern) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // =========================================================================
    // END GAME
    // =========================================================================
    endGame() {
        if (this.isGameOver) return;

        this.isGameOver = true;
        this.gameStarted = false;
        this.gameCountdownActive = false;
        this.introGateActive = false;
        this.activeMusicMode = 'none';

        if (this.spawnTimer) {
            this.spawnTimer.remove(false);
            this.spawnTimer = null;
        }

        if (this.extraSpawnTimer) {
            this.extraSpawnTimer.remove(false);
            this.extraSpawnTimer = null;
        }

        if (this.chaosFloodTimer) {
            this.chaosFloodTimer.remove(false);
            this.chaosFloodTimer = null;
        }

        if (this.chaosEndTimer) {
            this.chaosEndTimer.remove(false);
            this.chaosEndTimer = null;
        }

        if (this.reactionTimer) {
            this.reactionTimer.remove(false);
            this.reactionTimer = null;
        }

        if (this.homeMoveVisualTimer) {
            this.homeMoveVisualTimer.remove(false);
            this.homeMoveVisualTimer = null;
        }

        if (this.gameOverBlinkTimer) {
            this.gameOverBlinkTimer.remove(false);
            this.gameOverBlinkTimer = null;
        }

        if (this.introGatePulseTween) {
            this.introGatePulseTween.stop();
            this.introGatePulseTween = null;
        }

        if (this.chaosBlinkTween) {
            this.chaosBlinkTween.stop();
            this.chaosBlinkTween = null;
        }

        if (this.chaosText && this.chaosText.active) {
            this.chaosText.destroy();
            this.chaosText = null;
        }

        this.items.children.iterate((item) => {
            if (item && item.glowSprite && item.glowSprite.active) {
                item.glowSprite.destroy();
            }
            if (item) {
                item.destroy();
            }
        });

        if (this.endGameButton) {
            this.endGameButton.destroy();
        }

        this.stopHomeMusic();

        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        if (this.sound && this.cache.audio.exists('gameOverSound')) {
            this.sound.play('gameOverSound');
        }

        const levelText = this.getFinalLevelName();

        this.add.rectangle(180, 320, 300, 420, 0x000000, 0.9);

        this.gameOverHead = this.add.image(180, 150, 'openover').setScale(0.32);

        this.tweens.add({
            targets: this.gameOverHead,
            angle: { from: -4, to: 4 },
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.gameOverBlinkTimer = this.time.addEvent({
            delay: 650,
            loop: true,
            callback: () => {
                if (!this.gameOverHead || !this.gameOverHead.active) return;

                const currentTexture = this.gameOverHead.texture.key;
                if (currentTexture === 'openover') {
                    this.gameOverHead.setTexture('closeover');
                } else {
                    this.gameOverHead.setTexture('openover');
                }
            }
        });

        this.add.text(180, 220, 'Heartbroken\nGame Over', {
            fontSize: '24px',
            color: '#ff9db2',
            align: 'center',
            stroke: '#4b1e6d',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 16, fill: true }
        }).setOrigin(0.5);

        this.add.text(180, 295, 'Hearts Collected', {
            fontSize: '18px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 10, fill: true }
        }).setOrigin(0.5);

        this.add.text(180, 330, String(this.heartsCaught), {
            fontSize: '34px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5);

        this.add.text(180, 370, levelText, {
            fontSize: '18px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5);

        const endPresaveArrow = this.add.text(52, 420, '▶', {
            fontSize: '24px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 10, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: endPresaveArrow,
            angle: { from: -10, to: 10 },
            x: { from: 48, to: 58 },
            duration: 550,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(180, 420, 'Presave Luva Girl', {
            fontSize: '18px',
            color: '#ffff00',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                window.open('https://link.fans/luvagirl', '_blank');
            })
            .on('pointerover', function () {
                this.setColor('#ff69b4');
            })
            .on('pointerout', function () {
                this.setColor('#ffff00');
            });

        this.add.text(180, 448, 'Made by Source', {
            fontSize: '14px',
            color: '#fff'
        }).setOrigin(0.5);

        const playAgain = this.add.text(180, 500, 'Play Again', {
            fontSize: '18px',
            backgroundColor: '#555',
            padding: { left: 10, right: 10, top: 6, bottom: 6 },
            color: '#ffff00',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playAgain.on('pointerdown', () => {
            this.cleanupBrowserAudioFallbacks();
            this.scene.restart();
        });

        playAgain.on('pointerover', () => {
            playAgain.setColor('#ff69b4');
        });

        playAgain.on('pointerout', () => {
            playAgain.setColor('#ffff00');
        });
    }

    // =========================================================================
    // FINAL LEVEL TEXT
    // =========================================================================
    getFinalLevelName() {
        if (this.chaosLevelShown || this.chaosModeTriggered || this.heartsCaught >= this.chaosThreshold) {
            return 'Chaos Level.. Oops';
        }

        if (this.heartsCaught >= 100) return 'Legendary Level';
        if (this.heartsCaught >= 60) return 'ICON Level';
        if (this.heartsCaught >= 30) return 'Super Star Level';
        if (this.heartsCaught >= 15) return 'Star Level';
        return 'Luva Girl';
    }
}
