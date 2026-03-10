export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('backgroundgames1', 'assets/BG1.png');
        this.load.image('backgroundgames2', 'assets/BG2.png');

        this.load.image('openover', 'assets/Tomatoend1.PNG');
        this.load.image('closeover', 'assets/Tomatoend2.PNG');

        this.load.image('LuvaGirl', 'assets/LuvaGirl.png');
        this.load.image('Luvagirldrag', 'assets/Luvagirldrag.png');
        this.load.image('LuvaGirlBad', 'assets/LuvaGirlbad.png');
        this.load.image('LuvaGirlBonus', 'assets/LuvaGirlbonus.png');

        this.load.image('Onelife', 'assets/Onelife.png');
        this.load.image('OnelifeBad', 'assets/Onelifebad.png');
        this.load.image('OnelifeBonus', 'assets/Onelifebonus.png');

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
        this.load.image('starItem', 'assets/Star.png');

        this.load.audio('gameOverSound', 'assets/GameOver.mp3');
        this.load.audio('bgMusic', 'assets/BGmusic.mp3');
        this.load.audio('arcadeMusic', 'assets/Arcade.mp3');
    }

    create() {
        this.gameWidth = 360;
        this.gameHeight = 640;

        this.background = this.add.tileSprite(180, 320, 360, 640, 'backgroundgames1');

        this.gameStarted = false;
        this.gameCountdownActive = false;
        this.isGameOver = false;
        this.reactionTimer = null;
        this.introGateActive = true;
        this.homeScreenActive = false;
        this.isUnlockingIntroGate = false;

        this.ship = this.add.image(180, 550, 'LuvaGirl').setScale(0.22);
        this.shipBaseY = 550;
        this.ship.setAlpha(0);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.homePointerMoving = false;
        this.homeMoveVisualTimer = null;
        this.homeMoveVisualDelay = 120;

        this.items = this.add.group();

        this.heartsCaught = 0;
        this.lives = 3;
        this.currentFallSpeed = 2;

        this.starLevelShown = false;
        this.superStarShown = false;
        this.iconLevelShown = false;
        this.legendaryShown = false;

        this.currentLevelName = 'Luva Girl';

        this.grammyUnlocked = false;
        this.grammySpawned = false;
        this.grammyCaught = false;
        this.grammyForcedSpawnPending = false;

        this.musicSpawnCount = 0;
        this.ramenSpawnCount = 0;

        this.heartKeys = ['heartBlue', 'heartGreen', 'heartPink', 'heartYellow'];

        this.bgMusic = null;
        this.arcadeMusic = null;

        this.lifeIcons = [];
        this.heartsLabelText = null;
        this.heartsNumberText = null;
        this.endGameButton = null;

        this.catchZoneY = this.ship.y + 28;
        this.catchZoneBottom = this.ship.y + 48;

        this.spawnTimer = null;
        this.extraSpawnTimer = null;

        this.spawnLanes = [52, 92, 132, 180, 228, 268, 308];
        this.lastSpawnLane = null;
        this.lastTomatoLane = null;
        this.lastSpawnType = null;

        this.firstTomatoTriggered = false;

        this.activeMusicMode = 'home';

        this.baseWaveSize = 2;
        this.lastWaveSpawnAt = 0;
        this.lastRefillSpawnAt = 0;

        this.starPowerThresholds = [100, 200, 350, 500];
        this.starPowerSpawnedAt = {};
        this.starPowerCaughtAt = {};
        this.starForcedSpawnPending = false;
        this.pendingStarThreshold = null;

        this.invincibleActive = false;
        this.invincibleVisibleActive = false;
        this.invincibleDuration = 10000;
        this.invincibleGraceDuration = 1000;
        this.invincibleTimer = null;
        this.invincibleGraceTimer = null;
        this.invincibleColorTimer = null;
        this.invincibleHeartTimer = null;
        this.invinciblePulseTween = null;
        this.invincibleGlowFx = null;

        this.powerMessageText = null;
        this.powerSubText = null;
        this.powerMessageTween = null;
        this.powerMessageColorTimer = null;

        this.edgeGlowRects = [];
        this.edgeGlowTween = null;

        this.starAuraColors = [
            0xff6ad5,
            0xffff66,
            0x7df9ff,
            0xff9df2,
            0xffffff,
            0xb8ff6a
        ];

        this.messageFillColors = [
            '#a82d67',
            '#d95a3f',
            '#e0b72d',
            '#56b35c',
            '#4aa6d9',
            '#9a63d9'
        ];

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

        this.installBrowserAudioFallbacks();
        this.tryStartHomeMusic();
        this.createStartScreen();
        this.createIntroGate();
        this.showIntroGate();
    }

    getBaseShipTexture() {
        return this.lives <= 1 ? 'Onelife' : 'LuvaGirl';
    }

    getBadShipTexture() {
        return this.lives <= 1 ? 'OnelifeBad' : 'LuvaGirlBad';
    }

    getBonusShipTexture() {
        return this.lives <= 1 ? 'OnelifeBonus' : 'LuvaGirlBonus';
    }

    applyCurrentBaseShipTexture() {
        if (!this.ship || !this.ship.active) return;

        if (this.invincibleVisibleActive) {
            this.ship.setTexture(this.getBonusShipTexture());
            this.ship.setScale(0.23);
        } else {
            this.ship.setTexture(this.getBaseShipTexture());
            this.ship.setScale(0.22);
        }

        this.ship.angle = 0;
        this.ship.y = this.shipBaseY;
    }

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
                                    this.applyCurrentBaseShipTexture();
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
        if (this.invincibleVisibleActive) return;

        if (this.ship && this.ship.active && this.ship.texture.key !== this.getBaseShipTexture()) {
            this.applyCurrentBaseShipTexture();
        }
    }

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

    startGame() {
        if (this.gameStarted || this.gameCountdownActive || this.isGameOver || this.introGateActive) return;

        this.gameCountdownActive = true;
        this.activeMusicMode = 'game';

        if (this.homeMoveVisualTimer) {
            this.homeMoveVisualTimer.remove(false);
            this.homeMoveVisualTimer = null;
        }

        this.homePointerMoving = false;
        this.applyCurrentBaseShipTexture();

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

    beginGameplay() {
        this.gameCountdownActive = false;
        this.gameStarted = true;

        this.setupHUD();
        this.tryStartGameplayMusic();

        this.spawnWave(this.baseWaveSize);

        this.spawnTimer = this.time.addEvent({
            delay: 180,
            callback: () => {
                this.maybeRunMainWave();
            },
            callbackScope: this,
            loop: true
        });

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
        if (this.isGameOver || !this.gameStarted) return;

        const now = this.time.now;
        const neededDelay = this.getWaveDelayByHearts();

        if (now - this.lastWaveSpawnAt < neededDelay) {
            return;
        }

        this.lastWaveSpawnAt = now;
        this.spawnWave(this.baseWaveSize);
    }

    maybeRunRefillWave() {
        if (this.isGameOver || !this.gameStarted) return;

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
        if (this.heartsCaught < 5) return 1150;
        if (this.heartsCaught < 20) return 900;
        if (this.heartsCaught < 60) return 700;
        if (this.heartsCaught < 100) return 620;
        if (this.heartsCaught < 200) return 560;
        return 520;
    }

    getRefillDelayByHearts() {
        if (this.heartsCaught < 5) return 1400;
        if (this.heartsCaught < 20) return 1100;
        if (this.heartsCaught < 60) return 850;
        if (this.heartsCaught < 100) return 700;
        if (this.heartsCaught < 200) return 620;
        return 580;
    }

    getTargetActiveItemsByHearts() {
        if (this.heartsCaught < 5) return 1;
        if (this.heartsCaught < 20) return 2;
        if (this.heartsCaught < 60) return 3;
        if (this.heartsCaught < 100) return 4;
        if (this.heartsCaught < 200) return 4;
        return 5;
    }

    triggerGrammyEvent() {
        if (this.isGameOver || this.grammySpawned || this.grammyCaught) return;

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

        if (!this.reactionTimer && this.ship && this.ship.active && !this.isGameOver) {
            this.applyCurrentBaseShipTexture();
        }
    }

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
                if (item.itemType === 'star' && typeof item.starThreshold === 'number') {
                    this.starPowerSpawnedAt[item.starThreshold] = true;
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

    getSafeLaneIndexes() {
        const laneCount = this.spawnLanes.length;
        const safeLane = Phaser.Math.Between(0, laneCount - 1);
        return [safeLane];
    }

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
        } else if (type !== 'grammy' && type !== 'star') {
            this.lastTomatoLane = null;
        }

        return { x, laneIndex };
    }

    getMaxTomatoesPerWave() {
        if (this.heartsCaught < 20) return 1;
        if (this.heartsCaught < 60) return 1;
        return 2;
    }

    spawnWave(count = 2) {
        if (this.isGameOver || !this.gameStarted) return;

        const usedLaneIndexes = [];
        const safeLaneIndexes = this.getSafeLaneIndexes();
        const spawnCount = Math.max(1, count);

        const maxTomatoesThisWave = this.getMaxTomatoesPerWave();
        let tomatoCountThisWave = 0;

        if (
            this.starForcedSpawnPending &&
            this.pendingStarThreshold !== null &&
            !this.starPowerSpawnedAt[this.pendingStarThreshold] &&
            !this.starPowerCaughtAt[this.pendingStarThreshold]
        ) {
            const forcedStar = this.spawnSpecificItem('star', usedLaneIndexes, safeLaneIndexes, this.pendingStarThreshold);
            if (forcedStar && typeof forcedStar.laneIndex === 'number') {
                usedLaneIndexes.push(forcedStar.laneIndex);
                this.starForcedSpawnPending = false;
                this.starPowerSpawnedAt[this.pendingStarThreshold] = true;
                this.pendingStarThreshold = null;
            }
        }

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

    addPurpleGlow(item) {
        if (!item) return;

        if (item.preFX) {
            item.preFX.addGlow(0xe1bbff, 11, 0, false, 0.22, 20);
            return;
        }

        if (item.postFX) {
            item.postFX.addGlow(0xe1bbff, 0.7, 0, false, 0.22, 20);
            return;
        }

        const glow = this.add.image(item.x, item.y, item.texture.key)
            .setScale(item.scale * 1.42)
            .setAlpha(0.32)
            .setTint(0xe9cbff);

        glow.setDepth(item.depth - 1);
        item.glowSprite = glow;
    }

    addGoldenGlow(item) {
        if (!item) return;

        if (item.preFX) {
            item.preFX.addGlow(0xfff27a, 14, 0, false, 0.22, 22);
            return;
        }

        if (item.postFX) {
            item.postFX.addGlow(0xfff27a, 0.9, 0, false, 0.22, 22);
            return;
        }

        const glow = this.add.image(item.x, item.y, item.texture.key)
            .setScale(item.scale * 1.6)
            .setAlpha(0.38)
            .setTint(0xfff4a3);

        glow.setDepth(item.depth - 1);
        item.glowSprite = glow;
    }

    spawnSpecificItem(type, usedLaneIndexes = [], safeLaneIndexes = [], starThreshold = null) {
        if (this.isGameOver) return null;

        if (type === 'grammy' && (!this.grammyUnlocked || this.grammySpawned || this.grammyCaught)) {
            return null;
        }

        if (type === 'star') {
            if (starThreshold === null) return null;
            if (this.starPowerCaughtAt[starThreshold]) return null;
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
            item.itemValue = 4;
            item.itemType = 'ramen';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 36;
            item.catchHeight = 34;
            item.angleSpeed = 0.18;
            item.baseScale = 0.22;
            item.safePassed = false;
            this.ramenSpawnCount += 1;
            this.addPurpleGlow(item);
        }

        if (type === 'music') {
            item = this.add.image(x, -34, 'noteItem').setScale(0.22);
            item.itemKind = 'good';
            item.itemValue = 4;
            item.itemType = 'music';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 36;
            item.catchHeight = 34;
            item.angleSpeed = 0.18;
            item.baseScale = 0.22;
            item.safePassed = false;
            this.musicSpawnCount += 1;
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

        if (type === 'star') {
            item = this.add.image(x, -40, 'starItem').setScale(0.22);
            item.itemKind = 'power';
            item.itemValue = 0;
            item.itemType = 'star';
            item.starThreshold = starThreshold;
            item.speed = 2
            item.catchWidth = 38;
            item.catchHeight = 38;
            item.angleSpeed = 2.8;
            item.baseScale = 0.22;
            item.pulseSpeed = 0.24;
            item.pulseAmount = 0.04;
            item.pulseTime = Phaser.Math.FloatBetween(0, Math.PI * 2);
            item.safePassed = false;
            this.addGoldenGlow(item);
        }

        if (!item) return null;

        this.lastSpawnType = type;
        this.items.add(item);

        return {
            item,
            laneIndex: spawnData.laneIndex
        };
    }

    getSpawnWeights() {
        if (this.heartsCaught < 5) {
            return { heart: 100, tomato: 0, ramen: 0, music: 0, grammy: 0 };
        }

        if (this.heartsCaught < 15) {
            return { heart: 80, tomato: 20, ramen: 0, music: 0, grammy: 0 };
        }

        if (this.heartsCaught < 30) {
            return { heart: 70, tomato: 24, ramen: 3, music: 3, grammy: 0 };
        }

        if (this.heartsCaught < 60) {
            return { heart: 58, tomato: 34, ramen: 4, music: 4, grammy: 0 };
        }

        if (this.heartsCaught < 100) {
            return { heart: 43, tomato: 46, ramen: 5, music: 4, grammy: 2 };
        }

        if (this.heartsCaught < 200) {
            return { heart: 40, tomato: 48, ramen: 5, music: 5, grammy: 2 };
        }

        return { heart: 38, tomato: 50, ramen: 5, music: 5, grammy: 2 };
    }

    chooseItemType() {
        const weights = this.getSpawnWeights();

        if (!this.grammyUnlocked || this.grammySpawned || this.grammyCaught) {
            weights.grammy = 0;
        }

        const total = weights.heart + weights.tomato + weights.ramen + weights.music + weights.grammy;

        if (total <= 0) {
            return 'heart';
        }

        let roll = Phaser.Math.Between(1, total);

        if (roll <= weights.heart) return 'heart';
        roll -= weights.heart;

        if (roll <= weights.tomato) return 'tomato';
        roll -= weights.tomato;

        if (roll <= weights.ramen) return 'ramen';
        roll -= weights.ramen;

        if (roll <= weights.music) return 'music';

        return 'grammy';
    }

    maybeQueueStarPowerup() {
        for (let i = 0; i < this.starPowerThresholds.length; i++) {
            const threshold = this.starPowerThresholds[i];

            if (
                this.heartsCaught >= threshold &&
                !this.starPowerSpawnedAt[threshold] &&
                !this.starPowerCaughtAt[threshold] &&
                !this.starForcedSpawnPending
            ) {
                this.starForcedSpawnPending = true;
                this.pendingStarThreshold = threshold;
                return;
            }
        }
    }

    handleCaughtItem(item) {
        if (this.isGameOver) return;

        const kind = item.itemKind;
        const value = item.itemValue;
        const x = item.x;
        const y = item.y;
        const itemType = item.itemType;
        const starThreshold = item.starThreshold;

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
                this.spawnSpecificItem('tomato', [], this.getSafeLaneIndexes());
            }

            if (value === 4) {
                this.showFloatingScore('+4');
            } else {
                this.showFloatingScore('+1');
            }

            this.maybeQueueStarPowerup();
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

            this.maybeQueueStarPowerup();
            return;
        }

        if (kind === 'power' && itemType === 'star') {
            if (typeof starThreshold === 'number') {
                this.starPowerCaughtAt[starThreshold] = true;
                this.starPowerSpawnedAt[starThreshold] = true;
            }

            this.activateLuvaGirlPower();
            this.showGrammySparkles(x, y);
            this.triggerVibration([90, 40, 90, 40, 120]);
            return;
        }

        if (kind === 'bad') {
            if (this.invincibleActive) {
                this.showInvincibleTomatoBurst(x, y);
                this.triggerVibration(25);
                return;
            }

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

    activateLuvaGirlPower() {
        if (this.isGameOver) return;

        this.invincibleActive = true;
        this.invincibleVisibleActive = true;

        if (this.reactionTimer) {
            this.reactionTimer.remove(false);
            this.reactionTimer = null;
        }

        if (this.invincibleGraceTimer) {
            this.invincibleGraceTimer.remove(false);
            this.invincibleGraceTimer = null;
        }

        this.tweens.killTweensOf(this.ship);
        this.ship.angle = 0;
        this.ship.y = this.shipBaseY;
        this.ship.setTexture(this.getBonusShipTexture());
        this.ship.setScale(0.23);

        this.startInvincibleShipGlow();
        this.startInvincibleColorCycle();
        this.startInvincibleHeartBurst();
        this.showPowerActivatedText();
        this.showEdgeGlow();

        if (this.invincibleTimer) {
            this.invincibleTimer.remove(false);
        }

        this.invincibleTimer = this.time.delayedCall(this.invincibleDuration, () => {
            this.beginInvincibleGraceSecond();
        });
    }

    beginInvincibleGraceSecond() {
        this.invincibleVisibleActive = false;

        if (this.invincibleColorTimer) {
            this.invincibleColorTimer.remove(false);
            this.invincibleColorTimer = null;
        }

        if (this.invincibleHeartTimer) {
            this.invincibleHeartTimer.remove(false);
            this.invincibleHeartTimer = null;
        }

        if (this.invinciblePulseTween) {
            this.invinciblePulseTween.stop();
            this.invinciblePulseTween = null;
        }

        if (this.invincibleGlowFx && this.invincibleGlowFx.destroy) {
            this.invincibleGlowFx.destroy();
            this.invincibleGlowFx = null;
        }

        if (this.powerMessageTween) {
            this.powerMessageTween.stop();
            this.powerMessageTween = null;
        }

        if (this.powerMessageColorTimer) {
            this.powerMessageColorTimer.remove(false);
            this.powerMessageColorTimer = null;
        }

        if (this.powerMessageText && this.powerMessageText.active) {
            this.powerMessageText.destroy();
            this.powerMessageText = null;
        }

        if (this.powerSubText && this.powerSubText.active) {
            this.powerSubText.destroy();
            this.powerSubText = null;
        }

        if (this.ship && this.ship.active) {
            this.ship.clearTint();
            this.applyCurrentBaseShipTexture();
        }

        this.clearEdgeGlow();

        if (this.invincibleGraceTimer) {
            this.invincibleGraceTimer.remove(false);
        }

        this.invincibleGraceTimer = this.time.delayedCall(this.invincibleGraceDuration, () => {
            this.endLuvaGirlPower();
        });
    }

    startInvincibleShipGlow() {
        if (!this.ship || !this.ship.active) return;

        if (this.invincibleGlowFx && this.invincibleGlowFx.destroy) {
            this.invincibleGlowFx.destroy();
            this.invincibleGlowFx = null;
        }

        if (this.ship.preFX) {
            this.invincibleGlowFx = this.ship.preFX.addGlow(0xffffff, 10, 0, false, 0.18, 18);
        } else if (this.ship.postFX) {
            this.invincibleGlowFx = this.ship.postFX.addGlow(0xffffff, 0.8, 0, false, 0.18, 18);
        }

        if (this.invinciblePulseTween) {
            this.invinciblePulseTween.stop();
            this.invinciblePulseTween = null;
        }

        this.invinciblePulseTween = this.tweens.add({
            targets: this.ship,
            scale: { from: 0.225, to: 0.245 },
            duration: 260,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    startInvincibleColorCycle() {
        if (this.invincibleColorTimer) {
            this.invincibleColorTimer.remove(false);
        }

        this.invincibleColorTimer = this.time.addEvent({
            delay: 110,
            loop: true,
            callback: () => {
                if (!this.ship || !this.ship.active || !this.invincibleVisibleActive) return;
                const color = Phaser.Utils.Array.GetRandom(this.starAuraColors);
                this.ship.setTint(color);
            }
        });
    }

    startInvincibleHeartBurst() {
        if (this.invincibleHeartTimer) {
            this.invincibleHeartTimer.remove(false);
        }

        this.invincibleHeartTimer = this.time.addEvent({
            delay: 180,
            loop: true,
            callback: () => {
                if (!this.ship || !this.ship.active || !this.invincibleVisibleActive || this.isGameOver) return;
                this.spawnMiniHeartAroundShip();
            }
        });
    }

    spawnMiniHeartAroundShip() {
        const heartKey = Phaser.Utils.Array.GetRandom(this.heartKeys);
        const miniHeart = this.add.image(
            this.ship.x + Phaser.Math.Between(-22, 22),
            this.ship.y + Phaser.Math.Between(-18, 18),
            heartKey
        ).setScale(0.11).setDepth(2500);

        this.tweens.add({
            targets: miniHeart,
            x: miniHeart.x + Phaser.Math.Between(-16, 16),
            y: miniHeart.y - Phaser.Math.Between(26, 44),
            alpha: 0,
            angle: Phaser.Math.Between(-18, 18),
            duration: 700,
            onComplete: () => {
                miniHeart.destroy();
            }
        });
    }

    showInvincibleTomatoBurst(x, y) {
        for (let i = 0; i < 4; i++) {
            const heartKey = Phaser.Utils.Array.GetRandom(this.heartKeys);
            const burst = this.add.image(
                x + Phaser.Math.Between(-10, 10),
                y + Phaser.Math.Between(-10, 10),
                heartKey
            ).setScale(0.1).setDepth(2400);

            this.tweens.add({
                targets: burst,
                x: burst.x + Phaser.Math.Between(-20, 20),
                y: burst.y - Phaser.Math.Between(12, 30),
                alpha: 0,
                duration: 420,
                onComplete: () => burst.destroy()
            });
        }
    }

    showPowerActivatedText() {
        if (this.powerMessageTween) {
            this.powerMessageTween.stop();
            this.powerMessageTween = null;
        }

        if (this.powerMessageColorTimer) {
            this.powerMessageColorTimer.remove(false);
            this.powerMessageColorTimer = null;
        }

        if (this.powerMessageText && this.powerMessageText.active) {
            this.powerMessageText.destroy();
        }

        if (this.powerSubText && this.powerSubText.active) {
            this.powerSubText.destroy();
        }

        this.powerMessageText = this.add.text(180, 300, 'Luva Girl Activated', {
            fontSize: '26px',
            align: 'center',
            color: '#8d2d5f',
            stroke: '#3e0f25',
            strokeThickness: 6,
            shadow: { offsetX: 0, offsetY: 0, color: '#000000', blur: 10, fill: true }
        }).setOrigin(0.5).setDepth(3000).setAlpha(1);

        this.powerSubText = this.add.text(180, 330, 'Immune to Tomatoes', {
            fontSize: '16px',
            align: 'center',
            color: '#ffffff',
            stroke: '##3e0f25',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 0, color: '#000000', blur: 6, fill: true }
        }).setOrigin(0.5).setDepth(3000).setAlpha(1);

        this.powerMessageColorTimer = this.time.addEvent({
            delay: 130,
            loop: true,
            callback: () => {
                if (!this.powerMessageText || !this.powerMessageText.active || !this.invincibleVisibleActive) return;
                const nextColor = Phaser.Utils.Array.GetRandom(this.messageFillColors);
                this.powerMessageText.setColor(nextColor);
            }
        });

        this.powerMessageTween = this.tweens.add({
            targets: [this.powerMessageText, this.powerSubText],
            alpha: 0,
            duration: this.invincibleDuration,
            ease: 'Linear',
            onComplete: () => {
                if (this.powerMessageColorTimer) {
                    this.powerMessageColorTimer.remove(false);
                    this.powerMessageColorTimer = null;
                }

                if (this.powerMessageText && this.powerMessageText.active) {
                    this.powerMessageText.destroy();
                }

                if (this.powerSubText && this.powerSubText.active) {
                    this.powerSubText.destroy();
                }

                this.powerMessageText = null;
                this.powerSubText = null;
                this.powerMessageTween = null;
            }
        });
    }

    showEdgeGlow() {
        this.clearEdgeGlow();

        const depth = 2800;
        const glowColor = 0xe2b7ff;

        const top = this.add.rectangle(180, 7, 360, 14, glowColor, 0.26).setDepth(depth);
        const bottom = this.add.rectangle(180, 633, 360, 14, glowColor, 0.26).setDepth(depth);
        const left = this.add.rectangle(7, 320, 14, 640, glowColor, 0.26).setDepth(depth);
        const right = this.add.rectangle(353, 320, 14, 640, glowColor, 0.26).setDepth(depth);

        this.edgeGlowRects = [top, bottom, left, right];

        this.edgeGlowTween = this.tweens.add({
            targets: this.edgeGlowRects,
            alpha: { from: 0.18, to: 0.5 },
            duration: 260,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    clearEdgeGlow() {
        if (this.edgeGlowTween) {
            this.edgeGlowTween.stop();
            this.edgeGlowTween = null;
        }

        this.edgeGlowRects.forEach((rect) => {
            if (rect && rect.active) {
                rect.destroy();
            }
        });

        this.edgeGlowRects = [];
    }

    endLuvaGirlPower() {
        this.invincibleActive = false;
        this.invincibleVisibleActive = false;

        if (this.invincibleTimer) {
            this.invincibleTimer.remove(false);
            this.invincibleTimer = null;
        }

        if (this.invincibleGraceTimer) {
            this.invincibleGraceTimer.remove(false);
            this.invincibleGraceTimer = null;
        }

        if (this.invincibleColorTimer) {
            this.invincibleColorTimer.remove(false);
            this.invincibleColorTimer = null;
        }

        if (this.invincibleHeartTimer) {
            this.invincibleHeartTimer.remove(false);
            this.invincibleHeartTimer = null;
        }

        if (this.invinciblePulseTween) {
            this.invinciblePulseTween.stop();
            this.invinciblePulseTween = null;
        }

        if (this.invincibleGlowFx && this.invincibleGlowFx.destroy) {
            this.invincibleGlowFx.destroy();
            this.invincibleGlowFx = null;
        }

        if (this.powerMessageTween) {
            this.powerMessageTween.stop();
            this.powerMessageTween = null;
        }

        if (this.powerMessageColorTimer) {
            this.powerMessageColorTimer.remove(false);
            this.powerMessageColorTimer = null;
        }

        if (this.powerMessageText && this.powerMessageText.active) {
            this.powerMessageText.destroy();
            this.powerMessageText = null;
        }

        if (this.powerSubText && this.powerSubText.active) {
            this.powerSubText.destroy();
            this.powerSubText = null;
        }

        if (this.ship && this.ship.active) {
            this.ship.clearTint();
            this.applyCurrentBaseShipTexture();
        }

        this.clearEdgeGlow();
    }

    showPlayerReaction(type) {
        if (!this.ship || !this.ship.active || this.isGameOver) return;
        if (this.invincibleVisibleActive) return;

        if (this.reactionTimer) {
            this.reactionTimer.remove(false);
            this.reactionTimer = null;
        }

        this.tweens.killTweensOf(this.ship);
        this.ship.angle = 0;
        this.ship.y = this.shipBaseY;

        if (type === 'bad') {
            this.ship.setTexture(this.getBadShipTexture());
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
            this.ship.setTexture(this.getBonusShipTexture());
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
                    this.applyCurrentBaseShipTexture();
                }
            }
        });
    }

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
        this.updateFallSpeedByHearts();
        this.maybeQueueStarPowerup();

        if (this.heartsCaught >= 100 && !this.legendaryShown) {
            this.legendaryShown = true;
            this.currentLevelName = 'Legendary Level';
            this.showLevelMessage('Legendary Level Reached');
            return;
        }

        if (this.heartsCaught >= 60 && !this.iconLevelShown) {
            this.iconLevelShown = true;
            this.currentLevelName = 'ICON Level';
            this.background.setTexture('backgroundgames2');

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

    triggerVibration(pattern) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

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

        this.endLuvaGirlPower();

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

        this.add.rectangle(180, 320, 300, 420, 0x000000, 0.9).setDepth(4000);

        this.gameOverHead = this.add.image(180, 150, 'openover').setScale(0.32).setDepth(4001);

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
        }).setOrigin(0.5).setDepth(4001);

        this.add.text(180, 295, 'Hearts Collected', {
            fontSize: '18px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 10, fill: true }
        }).setOrigin(0.5).setDepth(4001);

        this.add.text(180, 330, String(this.heartsCaught), {
            fontSize: '34px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setDepth(4001);

        this.add.text(180, 370, levelText, {
            fontSize: '18px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setDepth(4001);

        const endPresaveArrow = this.add.text(52, 420, '▶', {
            fontSize: '24px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 10, fill: true }
        }).setOrigin(0.5).setDepth(4001);

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
        }).setOrigin(0.5).setDepth(4001).setInteractive({ useHandCursor: true })
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
        }).setOrigin(0.5).setDepth(4001);

        const playAgain = this.add.text(180, 500, 'Play Again', {
            fontSize: '18px',
            backgroundColor: '#555',
            padding: { left: 10, right: 10, top: 6, bottom: 6 },
            color: '#ffff00',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setDepth(4001).setInteractive({ useHandCursor: true });

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

    getFinalLevelName() {
        if (this.heartsCaught >= 100) return 'Legendary Level';
        if (this.heartsCaught >= 60) return 'ICON Level';
        if (this.heartsCaught >= 30) return 'Super Star Level';
        if (this.heartsCaught >= 15) return 'Star Level';
        return 'Luva Girl';
    }
}
