export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('backgroundgames1', 'assets/BG1.png');
        this.load.image('backgroundgames2', 'assets/BG2.png');
        this.load.image('backgroundgames3', 'assets/BG3.png');
        this.load.image('backgroundgames4', 'assets/BG4.png');

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
        this.load.image('laysItem', 'assets/Lays.png');

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

        this.currentLevelName = 'Luva Girl';

        this.risingStarShown = false;
        this.starLevelShown = false;
        this.superStarShown = false;
        this.iconLevelShown = false;
        this.legendaryShown = false;
        this.flowStateShown = false;
        this.chaosShown = false;

        this.flowStateActive = false;
        this.chaosModeActive = false;

        this.grammyUnlocked = false;
        this.grammySpawned = false;
        this.grammyCaught = false;
        this.grammyEventStarted = false;

        this.laysThresholds = [45, 250, 400, 650, 1200];
        this.laysSpawnedAt = {};
        this.laysEventActive = false;

        this.musicSpawnCount = 0;
        this.ramenSpawnCount = 0;

        this.heartKeys = ['heartBlue', 'heartGreen', 'heartPink', 'heartYellow'];

        this.bgMusic = null;
        this.arcadeMusic = null;

        this.lifeIcons = [];
        this.heartsLabelText = null;
        this.heartsNumberText = null;
        this.highScoreText = null;
        this.endGameButton = null;

        this.highScore = Number(localStorage.getItem('luvaGirlHighScore')) || 0;

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

        this.luvBombActive = false;
        this.luvBombTimer = null;
        this.luvBombShownAt = { 150: false, 600: false };
        this.luvBombDuration = 10000;
        this.luvBombRainbowTimer = null;
        this.luvBombMessageText = null;
        this.luvBombMessageTween = null;
        this.luvBombSparkleTimer = null;

        this.activeCenterMessage = null;
        this.activeLevelMessage = null;
        this.activeLevelSubMessage = null;
        this.pendingAnnouncements = [];
        this.announcementActive = false;

        this.lastLaysTime = 0;
        this.lastLuvBombScore = 0;
        this.bonusDelayUntil = 0;

        this.flowEdgeRects = [];
        this.flowEdgeTween = null;
        this.flowEdgeColorTimer = null;
        this.flowEdgeColors = [
            0xff8cf5,
            0xffc36b,
            0xfff77c,
            0x9dff8c,
            0x7df9ff,
            0x9d8cff
        ];

        this.chaosEdgeRects = [];
        this.chaosEdgeTween = null;
        this.chaosEdgeColorTimer = null;
        this.chaosEdgeColors = [
            0xff2a2a,
            0xff6a00,
            0xffb300,
            0x8a0000
        ];

        this.rainbowCycleColors = [
            0xff4d6d,
            0xffa94d,
            0xfff06a,
            0x7dff7d,
            0x7df9ff,
            0x9d8cff,
            0xff8cf5
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
        if (this.luvBombActive) return 'Luvagirldrag';
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

        this.ship.setTexture(this.getBaseShipTexture());
        this.ship.setScale(this.luvBombActive ? 0.23 : 0.22);
        this.ship.angle = 0;
        this.ship.y = this.shipBaseY;

        if (!this.luvBombActive) {
            this.ship.clearTint();
        }
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

        if (now - this.lastWaveSpawnAt < neededDelay) return;

        this.lastWaveSpawnAt = now;
        this.spawnWave(this.baseWaveSize);
    }

    maybeRunRefillWave() {
        if (this.isGameOver || !this.gameStarted) return;

        const targetActive = this.getTargetActiveItemsByHearts();
        const currentActive = this.countActiveFallingItems();

        if (currentActive >= targetActive) return;

        const now = this.time.now;
        const refillDelay = this.getRefillDelayByHearts();

        if (now - this.lastRefillSpawnAt < refillDelay) return;

        this.lastRefillSpawnAt = now;

        const deficit = targetActive - currentActive;
        const refillCount = Phaser.Math.Clamp(deficit, 1, this.baseWaveSize + (this.luvBombActive ? 1 : 0));

        this.spawnWave(refillCount);
    }

    countActiveFallingItems() {
        let total = 0;

        this.items.children.iterate((item) => {
            if (!item || !item.active) return;
            if (item.y < this.catchZoneY - 40) total += 1;
        });

        return total;
    }

    getWaveDelayByHearts() {
        let delay;

        if (this.heartsCaught < 5) delay = 1150;
        else if (this.heartsCaught < 20) delay = 900;
        else if (this.heartsCaught < 60) delay = 700;
        else if (this.heartsCaught < 100) delay = 620;
        else if (this.heartsCaught < 200) delay = 560;
        else delay = 520;

        if (this.luvBombActive) delay -= 260;

        return Phaser.Math.Clamp(delay, 180, 1500);
    }

    getRefillDelayByHearts() {
        let delay;

        if (this.heartsCaught < 5) delay = 1400;
        else if (this.heartsCaught < 20) delay = 1100;
        else if (this.heartsCaught < 60) delay = 850;
        else if (this.heartsCaught < 100) delay = 700;
        else if (this.heartsCaught < 200) delay = 620;
        else delay = 580;

        if (this.luvBombActive) delay -= 240;

        return Phaser.Math.Clamp(delay, 180, 1600);
    }

    getTargetActiveItemsByHearts() {
        let total;

        if (this.heartsCaught < 5) total = 1;
        else if (this.heartsCaught < 20) total = 2;
        else if (this.heartsCaught < 60) total = 3;
        else if (this.heartsCaught < 100) total = 4;
        else if (this.heartsCaught < 200) total = 4;
        else total = 5;

        if (this.luvBombActive) total += 4;

        return Phaser.Math.Clamp(total, 1, 10);
    }

    pauseSpawnTimers() {
        if (this.spawnTimer) this.spawnTimer.paused = true;
        if (this.extraSpawnTimer) this.extraSpawnTimer.paused = true;
    }

    resumeSpawnTimers() {
        if (this.spawnTimer) this.spawnTimer.paused = false;
        if (this.extraSpawnTimer) this.extraSpawnTimer.paused = false;
    }

    playNextAnnouncement() {
        if (this.announcementActive) return;
        if (!this.pendingAnnouncements.length) return;

        const next = this.pendingAnnouncements.shift();
        this.announcementActive = true;

        if (next.type === 'level') {
            this.showLevelMessage(next.text, next.shouldPulse, next.isFlowState);
        } else if (next.type === 'boost') {
            this.showTopLifeMessage(next.title, next.subtext);
        } else if (next.type === 'luvBomb') {
            this.showLuvBombMessage();
        }
    }

    queueOrShowLevelMessage(text, shouldPulse = false, isFlowState = false) {
        this.pendingAnnouncements = this.pendingAnnouncements.filter((item) => item.type !== 'level');

        this.pendingAnnouncements.push({
            type: 'level',
            text,
            shouldPulse,
            isFlowState
        });

        this.playNextAnnouncement();
    }

    queueLuvBombMessage() {
        this.pendingAnnouncements.push({ type: 'luvBomb' });
        this.playNextAnnouncement();
    }

    triggerGrammyEvent() {
        if (this.isGameOver || this.grammyEventStarted || this.grammyCaught || this.luvBombActive || this.laysEventActive) return;

        this.grammyEventStarted = true;
        this.bonusDelayUntil = this.time.now + 10000;
        this.pauseSpawnTimers();

        const dim = this.add.rectangle(180, 320, 360, 640, 0x000000, 0.35).setDepth(2200);

        this.items.children.iterate((item) => {
            if (!item) return;
            if (item.y < 200) {
                if (item.glowSprite && item.glowSprite.active) item.glowSprite.destroy();
                item.destroy();
            }
        });

        const grammy = this.add.image(180, -60, 'grammy').setScale(0.32).setDepth(2300);

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
            ).setOrigin(0.5).setDepth(2300);

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

            this.resumeSpawnTimers();
        });
    }

    triggerLaysEvent(threshold) {
        if (this.time.now < this.bonusDelayUntil) return;
        if (this.lastLaysTime && this.time.now < this.lastLaysTime + 120000) return;
        if (this.isGameOver || this.laysEventActive || this.luvBombActive) return;

        this.laysEventActive = true;
        this.laysSpawnedAt[threshold] = true;
        this.lastLaysTime = this.time.now;
        this.pauseSpawnTimers();

        const dim = this.add.rectangle(180, 320, 360, 640, 0x000000, 0.33).setAlpha(0.95).setDepth(2200);

        this.items.children.iterate((item) => {
            if (!item || !item.active) return;
            if (item.y < 200) {
                if (item.glowSprite && item.glowSprite.active) item.glowSprite.destroy();
                item.destroy();
            }
        });

        const item = this.add.image(180, -60, 'laysItem').setScale(0.70).setDepth(2300);
        item.itemKind = 'life';
        item.itemValue = 1;
        item.itemType = 'lays';
        item.speed = Math.max(2, this.currentFallSpeed * 0.55);
        item.catchWidth = 42;
        item.catchHeight = 42;
        item.angleSpeed = 0.25;
        item.baseScale = 0.70;
        item.pulseSpeed = 0.12;
        item.pulseAmount = 0.015;
        item.pulseTime = 0;
        item.safePassed = false;

        this.addSoftLifeGlow(item);
        this.items.add(item);

        for (let i = 0; i < 10; i++) {
            const sparkle = this.add.text(
                180 + Phaser.Math.Between(-40, 40),
                Phaser.Math.Between(40, 120),
                '💖',
                { fontSize: '18px' }
            ).setOrigin(0.5).setDepth(2300);

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

            this.resumeSpawnTimers();
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

        this.highScoreText = this.add.text(180, 46, `Best: ${this.highScore}`, {
            fontSize: '12px',
            color: '#4b1e6d',
            stroke: '#d8b4ff',
            strokeThickness: 2
        }).setOrigin(0.5, 0);

        this.createLifeIcons();

        this.endGameButton = this.add.text(10, 40, 'End', {
            fontSize: '11px',
            color: '#ffff00',
            backgroundColor: '#222',
            padding: { left: 6, right: 6, top: 4, bottom: 4 },
            stroke: '#ff69b4',
            strokeThickness: 1,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 8, fill: true }
        }).setOrigin(0, 0).setAlpha(0.88).setInteractive({ useHandCursor: true });

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

    getLifeIconPosition(index) {
        const startX = 290;
        const startY = 20;
        const colSpacing = 18;
        const rowSpacing = 18;
        const maxCols = 4;

        const col = index % maxCols;
        const row = Math.floor(index / maxCols);

        return {
            x: startX + (col * colSpacing),
            y: startY + (row * rowSpacing)
        };
    }

    createLifeIcons() {
        this.lifeIcons = [];
        const totalSlots = Math.max(3, this.lives);

        for (let i = 0; i < totalSlots; i++) {
            const pos = this.getLifeIconPosition(i);
            const texture = i < this.lives ? 'lifeFull' : 'lifeLost';
            const icon = this.add.image(pos.x, pos.y, texture)
                .setScale(0.18)
                .setOrigin(0.5, 0.5);

            this.lifeIcons.push(icon);
        }
    }

    updateLivesDisplay() {
        const totalSlots = Math.max(3, this.lives);

        while (this.lifeIcons.length < totalSlots) {
            const pos = this.getLifeIconPosition(this.lifeIcons.length);
            const icon = this.add.image(pos.x, pos.y, 'lifeFull')
                .setScale(0.08)
                .setOrigin(0.5, 0.5);

            this.lifeIcons.push(icon);

            this.tweens.add({
                targets: icon,
                scale: { from: 0.08, to: 0.18 },
                duration: 180,
                ease: 'Back.Out'
            });
        }

        while (this.lifeIcons.length > totalSlots) {
            const icon = this.lifeIcons.pop();

            this.tweens.add({
                targets: icon,
                scale: 0,
                alpha: 0,
                duration: 140,
                ease: 'Power2',
                onComplete: () => {
                    if (icon && icon.active) icon.destroy();
                }
            });
        }

        for (let i = 0; i < this.lifeIcons.length; i++) {
            const pos = this.getLifeIconPosition(i);
            this.lifeIcons[i].setPosition(pos.x, pos.y);
            this.lifeIcons[i].setTexture(i < this.lives ? 'lifeFull' : 'lifeLost');
            this.lifeIcons[i].setScale(0.18);
            this.lifeIcons[i].setAlpha(1);
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
                if (item.itemType === 'grammy') this.grammySpawned = true;
                if (item.itemType === 'lays') this.laysEventActive = false;

                if (item.glowSprite && item.glowSprite.active) item.glowSprite.destroy();
                item.destroy();
                return;
            }

            if (item.safePassed) return;

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
        } else if (type !== 'grammy' && type !== 'lays') {
            this.lastTomatoLane = null;
        }

        return { x, laneIndex };
    }

    getMaxTomatoesPerWave() {
        if (this.luvBombActive) return 0;
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

    addSoftLifeGlow(item) {
        if (!item) return;

        if (item.preFX) {
            item.preFX.addGlow(0xffffff, 10, 0, false, 0.14, 14);
            return;
        }

        if (item.postFX) {
            item.postFX.addGlow(0xffffff, 0.55, 0, false, 0.14, 14);
            return;
        }

        const glow = this.add.image(item.x, item.y, item.texture.key)
            .setScale(item.scale * 1.35)
            .setAlpha(0.24)
            .setTint(0xfff9c8);

        glow.setDepth(item.depth - 1);
        item.glowSprite = glow;
    }

    spawnSpecificItem(type, usedLaneIndexes = [], safeLaneIndexes = []) {
        if (this.isGameOver) return null;
        if (type === 'grammy' || type === 'lays') return null;

        const blockedLaneIndexes = type === 'tomato' ? safeLaneIndexes : [];
        const spawnData = this.getSpawnX(type, usedLaneIndexes, blockedLaneIndexes);
        const x = spawnData.x;

        let item = null;

        if (type === 'heart') {
            const randomHeart = Phaser.Utils.Array.GetRandom(this.heartKeys);
            item = this.add.image(x, -34, randomHeart).setScale(0.24);
            item.itemKind = 'good';
            item.itemValue = this.luvBombActive ? 2 : 1;
            item.itemType = 'heart';
            item.speed = this.luvBombActive ? this.currentFallSpeed + 1.5 : this.currentFallSpeed;
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

        if (!item) return null;

        this.lastSpawnType = type;
        this.items.add(item);

        return {
            item,
            laneIndex: spawnData.laneIndex
        };
    }

    getSpawnWeights() {
        if (this.luvBombActive) {
            return { heart: 100, tomato: 0, ramen: 0, music: 0 };
        }

        if (this.flowStateActive || this.chaosModeActive) {
            if (this.heartsCaught < 950) {
                return { heart: 46, tomato: 54, ramen: 0, music: 0 };
            }
            return { heart: 42, tomato: 58, ramen: 0, music: 0 };
        }

        if (this.heartsCaught < 5) {
            return { heart: 100, tomato: 0, ramen: 0, music: 0 };
        }

        if (this.heartsCaught < 15) {
            return { heart: 80, tomato: 20, ramen: 0, music: 0 };
        }

        if (this.heartsCaught < 30) {
            return { heart: 70, tomato: 24, ramen: 3, music: 3 };
        }

        if (this.heartsCaught < 60) {
            return { heart: 58, tomato: 34, ramen: 4, music: 4 };
        }

        if (this.heartsCaught < 100) {
            return { heart: 43, tomato: 48, ramen: 5, music: 4 };
        }

        if (this.heartsCaught < 200) {
            return { heart: 40, tomato: 50, ramen: 5, music: 5 };
        }

        return { heart: 38, tomato: 52, ramen: 5, music: 5 };
    }

    chooseItemType() {
        const weights = this.getSpawnWeights();
        const total = weights.heart + weights.tomato + weights.ramen + weights.music;

        if (total <= 0) return 'heart';

        let roll = Phaser.Math.Between(1, total);

        if (roll <= weights.heart) return 'heart';
        roll -= weights.heart;

        if (roll <= weights.tomato) return 'tomato';
        roll -= weights.tomato;

        if (roll <= weights.ramen) return 'ramen';

        return 'music';
    }

    maybeTriggerLays() {
        if (this.luvBombActive || this.laysEventActive) return;
        if (this.time.now < this.bonusDelayUntil) return;

        for (let i = 0; i < this.laysThresholds.length; i++) {
            const threshold = this.laysThresholds[i];
            if (this.heartsCaught >= threshold && !this.laysSpawnedAt[threshold]) {
                this.triggerLaysEvent(threshold);
                return;
            }
        }
    }

    maybeTriggerLuvBomb() {
        const triggers = [150, 600];

        if (this.lastLuvBombScore && this.heartsCaught < this.lastLuvBombScore + 200) {
            return;
        }

        for (let i = 0; i < triggers.length; i++) {
            const threshold = triggers[i];
            if (
                this.heartsCaught >= threshold &&
                !this.luvBombShownAt[threshold] &&
                !this.laysEventActive
            ) {
                this.luvBombShownAt[threshold] = true;
                this.lastLuvBombScore = this.heartsCaught;
                this.activateLuvBomb();
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

        if (item.glowSprite && item.glowSprite.active) {
            item.glowSprite.destroy();
        }

        item.destroy();

        if (kind === 'good') {
            this.heartsCaught += value;

            if (this.heartsNumberText) {
                this.heartsNumberText.setText(String(this.heartsCaught));
            }

            this.updateHighScore();

            if (itemType === 'ramen' || itemType === 'music') {
                this.showPlayerReaction('bonus');
                this.triggerVibration([35, 25, 45]);
            }

            if (itemType === 'heart') {
                this.showHeartCatchBurst(x, y);
            }

            if (this.heartsCaught >= 5 && !this.firstTomatoTriggered) {
                this.firstTomatoTriggered = true;
                this.spawnSpecificItem('tomato', [], this.getSafeLaneIndexes());
            }

            if (value === 4) {
                this.showFloatingScore('+4');
            } else if (value === 2) {
                this.showFloatingScore('+2');
            } else {
                this.showFloatingScore('+1');
            }

            if (!this.luvBombActive) {
                this.maybeTriggerLays();
                this.maybeTriggerLuvBomb();
            }

            return;
        }

        if (kind === 'bonus') {
            this.heartsCaught += value;

            if (this.heartsNumberText) {
                this.heartsNumberText.setText(String(this.heartsCaught));
            }

            this.updateHighScore();

            this.grammyCaught = true;
            this.showCenteredFloatingScore('Grammy Bonus +10');
            this.showGrammySparkles(x, y);
            this.showPlayerReaction('bonus');
            this.triggerVibration([80, 40, 120]);

            this.maybeTriggerLuvBomb();
            this.maybeTriggerLays();
            return;
        }

        if (kind === 'life') {
            const hadMissingLife = this.lives < 3;

            this.lives += value;
            this.updateLivesDisplay();
            this.showGrammySparkles(x, y);

            this.pendingAnnouncements.push({
                type: 'boost',
                title: hadMissingLife ? 'Heart Healed!' : 'Love Boost!',
                subtext: hadMissingLife ? 'One Life Restored' : 'One Extra Life Gained'
            });
            this.playNextAnnouncement();

            this.showPlayerReaction('bonus');
            this.triggerVibration([60, 30, 60]);

            this.laysEventActive = false;
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

    activateLuvBomb() {
        if (this.isGameOver || this.luvBombActive) return;

        if (this.luvBombTimer) {
            this.luvBombTimer.remove(false);
            this.luvBombTimer = null;
        }

        this.luvBombActive = true;

        this.pauseSpawnTimers();
        this.clearAllFallingItems();

        this.applyCurrentBaseShipTexture();
        this.startLuvBombRainbowEffect();
        this.queueLuvBombMessage();

        this.time.delayedCall(180, () => {
            if (!this.isGameOver && this.luvBombActive) {
                this.resumeSpawnTimers();
            }
        });

        this.luvBombTimer = this.time.delayedCall(this.luvBombDuration, () => {
            this.endLuvBomb();
        });
    }

    endLuvBomb() {
        if (!this.luvBombActive) return;

        this.luvBombActive = false;

        if (this.luvBombTimer) {
            this.luvBombTimer.remove(false);
            this.luvBombTimer = null;
        }

        this.pauseSpawnTimers();

        this.burstRemainingHeartsIntoSparkles();
        this.clearAllFallingItems();
        this.stopLuvBombRainbowEffect();
        this.stopLuvBombTextSparkles();

        if (this.luvBombMessageTween) {
            this.luvBombMessageTween.stop();
            this.luvBombMessageTween = null;
        }

        if (this.luvBombMessageText && this.luvBombMessageText.active) {
            this.luvBombMessageText.destroy();
            this.luvBombMessageText = null;
        }

        if (this.ship && this.ship.active) {
            this.applyCurrentBaseShipTexture();
        }

        this.time.delayedCall(420, () => {
            if (!this.isGameOver) {
                this.resumeSpawnTimers();
            }
        });
    }

    clearAllFallingItems() {
        this.items.children.iterate((item) => {
            if (!item || !item.active) return;

            if (item.glowSprite && item.glowSprite.active) {
                item.glowSprite.destroy();
            }

            item.destroy();
        });
    }

    burstRemainingHeartsIntoSparkles() {
        this.items.children.iterate((item) => {
            if (!item || !item.active) return;
            if (item.itemType !== 'heart') return;

            for (let i = 0; i < 10; i++) {
                const heartKey = Phaser.Utils.Array.GetRandom(this.heartKeys);
                const burst = this.add.image(
                    item.x + Phaser.Math.Between(-18, 18),
                    item.y + Phaser.Math.Between(-18, 18),
                    heartKey
                ).setScale(0.2).setDepth(2600);

                this.tweens.add({
                    targets: burst,
                    x: burst.x + Phaser.Math.Between(-42, 42),
                    y: burst.y + Phaser.Math.Between(-46, 28),
                    alpha: 0,
                    angle: Phaser.Math.Between(-50, 50),
                    duration: 520,
                    onComplete: () => burst.destroy()
                });
            }
        });
    }

    startLuvBombRainbowEffect() {
        if (this.luvBombRainbowTimer) {
            this.luvBombRainbowTimer.remove(false);
            this.luvBombRainbowTimer = null;
        }

        if (!this.ship || !this.ship.active) return;

        let colorIndex = 0;

        this.luvBombRainbowTimer = this.time.addEvent({
            delay: 90,
            loop: true,
            callback: () => {
                if (!this.ship || !this.ship.active || !this.luvBombActive) return;
                this.ship.setTint(this.rainbowCycleColors[colorIndex]);
                colorIndex = (colorIndex + 1) % this.rainbowCycleColors.length;
            }
        });
    }

    stopLuvBombRainbowEffect() {
        if (this.luvBombRainbowTimer) {
            this.luvBombRainbowTimer.remove(false);
            this.luvBombRainbowTimer = null;
        }

        if (this.ship && this.ship.active) {
            this.ship.clearTint();
        }
    }

    showHeartCatchBurst(x, y) {
        const count = this.luvBombActive ? 10 : 4;
        const scale = this.luvBombActive ? 0.17 : 0.11;
        const drift = this.luvBombActive ? 34 : 22;

        for (let i = 0; i < count; i++) {
            const heartKey = Phaser.Utils.Array.GetRandom(this.heartKeys);
            const burst = this.add.image(
                x + Phaser.Math.Between(-10, 10),
                y + Phaser.Math.Between(-10, 10),
                heartKey
            ).setScale(scale).setDepth(2400);

            this.tweens.add({
                targets: burst,
                x: burst.x + Phaser.Math.Between(-drift, drift),
                y: burst.y + Phaser.Math.Between(-drift - 6, 10),
                alpha: 0,
                angle: Phaser.Math.Between(-28, 28),
                duration: this.luvBombActive ? 560 : 420,
                onComplete: () => burst.destroy()
            });
        }
    }

    showLuvBombMessage() {
        if (this.luvBombMessageTween) {
            this.luvBombMessageTween.stop();
            this.luvBombMessageTween = null;
        }

        if (this.luvBombMessageText && this.luvBombMessageText.active) {
            this.luvBombMessageText.destroy();
        }

        this.luvBombMessageText = this.add.text(180, 220, 'LUV BOMB\nATTACK!!!', {
            fontFamily: '"Arial Black", "Comic Sans MS", cursive',
            fontSize: '30px',
            fontStyle: 'bold',
            color: '#ff7ecf',
            stroke: '#6d3bb8',
            strokeThickness: 6,
            shadow: { offsetX: 0, offsetY: 0, color: '#ffffff', blur: 3, fill: true }
        }).setOrigin(0.5).setDepth(2600).setScale(0.9);

        this.tweens.add({
            targets: this.luvBombMessageText,
            scale: 1.04,
            duration: 110,
            yoyo: true,
            repeat: 4,
            ease: 'Back.Out'
        });

        this.startLuvBombTextSparkles();

        this.luvBombMessageTween = this.tweens.add({
            targets: this.luvBombMessageText,
            alpha: 0,
            duration: this.luvBombDuration,
            ease: 'Linear',
            onComplete: () => {
                this.stopLuvBombTextSparkles();

                if (this.luvBombMessageText && this.luvBombMessageText.active) {
                    this.luvBombMessageText.destroy();
                }

                this.luvBombMessageText = null;
                this.luvBombMessageTween = null;
                this.announcementActive = false;
                this.playNextAnnouncement();
            }
        });
    }

    startLuvBombTextSparkles() {
        this.stopLuvBombTextSparkles();

        this.luvBombSparkleTimer = this.time.addEvent({
            delay: 170,
            loop: true,
            callback: () => {
                if (!this.luvBombMessageText || !this.luvBombMessageText.active || !this.luvBombActive) return;

                const sparkle = this.add.text(
                    180 + Phaser.Math.Between(-115, 115),
                    220 + Phaser.Math.Between(-26, 26),
                    Phaser.Math.Between(0, 1) === 0 ? '✨' : '💖',
                    { fontSize: `${Phaser.Math.Between(14, 20)}px` }
                ).setOrigin(0.5).setDepth(2601);

                this.tweens.add({
                    targets: sparkle,
                    y: sparkle.y - Phaser.Math.Between(10, 26),
                    x: sparkle.x + Phaser.Math.Between(-10, 10),
                    alpha: 0,
                    duration: 520,
                    onComplete: () => sparkle.destroy()
                });
            }
        });
    }

    stopLuvBombTextSparkles() {
        if (this.luvBombSparkleTimer) {
            this.luvBombSparkleTimer.remove(false);
            this.luvBombSparkleTimer = null;
        }
    }

    showTopLifeMessage(title, subtext) {
        const titleText = this.add.text(180, 180, title, {
            fontFamily: '"Arial Black", "Comic Sans MS", cursive',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ff8fd8',
            stroke: '#6d3bb8',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 0, color: '#ffffff', blur: 2, fill: true }
        }).setOrigin(0.5).setDepth(2600);

        const subText = this.add.text(180, 210, subtext, {
            fontSize: '14px',
            align: 'center',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2600);

        this.activeLevelMessage = titleText;
        this.activeLevelSubMessage = subText;
        this.activeCenterMessage = titleText;

        this.tweens.add({
            targets: [titleText, subText],
            alpha: 0,
            delay: 3200,
            duration: 700,
            onComplete: () => {
                if (this.activeCenterMessage === titleText) {
                    this.activeCenterMessage = null;
                }
                if (this.activeLevelMessage === titleText) {
                    this.activeLevelMessage = null;
                }
                if (this.activeLevelSubMessage === subText) {
                    this.activeLevelSubMessage = null;
                }

                titleText.destroy();
                subText.destroy();

                this.announcementActive = false;
                this.playNextAnnouncement();
            }
        });
    }

    showLevelMessage(text, shouldPulse = false, isFlowState = false) {
        const levelText = this.add.text(180, 96, text, {
            fontFamily: isFlowState ? '"Arial Black", "Comic Sans MS", cursive' : 'Arial',
            fontSize: isFlowState ? '26px' : '23px',
            fontStyle: 'bold',
            align: 'center',
            color: isFlowState ? '#ff8cf5' : '#ffff66',
            stroke: '#6d3bb8',
            strokeThickness: isFlowState ? 12 : 10,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: isFlowState ? '#ffffff' : '#ff69b4',
                blur: isFlowState ? 22 : 16,
                fill: true
            }
        }).setOrigin(0.5).setDepth(2600);

        this.activeLevelMessage = levelText;

        if (shouldPulse || isFlowState) {
            this.tweens.add({
                targets: levelText,
                scale: { from: 1, to: isFlowState ? 1.12 : 1.08 },
                duration: isFlowState ? 220 : 320,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        let rainbowTimer = null;

        if (isFlowState) {
            let colorIndex = 0;
            const flowTextColors = ['#ff8cf5', '#ffd36b', '#fff77c', '#9dff8c', '#7df9ff', '#9d8cff', '#ffffff'];

            rainbowTimer = this.time.addEvent({
                delay: 90,
                loop: true,
                callback: () => {
                    if (!levelText || !levelText.active) return;
                    levelText.setColor(flowTextColors[colorIndex]);
                    colorIndex = (colorIndex + 1) % flowTextColors.length;
                }
            });
        }

        this.tweens.add({
            targets: levelText,
            alpha: 0,
            delay: shouldPulse ? 5000 : 3000,
            duration: 700,
            onComplete: () => {
                if (rainbowTimer) {
                    rainbowTimer.remove(false);
                }
                if (levelText && levelText.active) {
                    levelText.destroy();
                }
                if (this.activeLevelMessage === levelText) {
                    this.activeLevelMessage = null;
                }

                this.announcementActive = false;
                this.playNextAnnouncement();
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

        this.activeCenterMessage = msg;

        this.tweens.add({
            targets: msg,
            y: msg.y - 55,
            alpha: 0,
            duration: 1200,
            onComplete: () => {
                if (this.activeCenterMessage === msg) {
                    this.activeCenterMessage = null;
                }
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
            if (this.luvBombActive) {
                this.ship.setTexture('Luvagirldrag');
                this.ship.setScale(0.23);
            } else {
                this.ship.setTexture(this.getBonusShipTexture());
                this.ship.setScale(0.23);
            }

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

    startFlowStateEdgeTrace() {
        this.stopFlowStateEdgeTrace();

        const depth = 2800;

        const top = this.add.rectangle(180, 7, 360, 10, 0xff8cf5, 0.58).setDepth(depth);
        const bottom = this.add.rectangle(180, 633, 360, 10, 0xff8cf5, 0.58).setDepth(depth);
        const left = this.add.rectangle(7, 320, 10, 640, 0xff8cf5, 0.58).setDepth(depth);
        const right = this.add.rectangle(353, 320, 10, 640, 0xff8cf5, 0.58).setDepth(depth);

        this.flowEdgeRects = [top, bottom, left, right];

        this.flowEdgeTween = this.tweens.add({
            targets: this.flowEdgeRects,
            alpha: { from: 0.28, to: 0.88 },
            duration: 170,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        let colorIndex = 0;
        this.flowEdgeColorTimer = this.time.addEvent({
            delay: 120,
            loop: true,
            callback: () => {
                if (!this.flowEdgeRects.length) return;

                const next = this.flowEdgeColors[colorIndex];
                this.flowEdgeRects.forEach((rect) => {
                    rect.setFillStyle(next, rect.alpha);
                });

                colorIndex = (colorIndex + 1) % this.flowEdgeColors.length;

                const side = Phaser.Math.Between(0, 3);
                let x = 180;
                let y = 320;

                if (side === 0) {
                    x = Phaser.Math.Between(20, 340);
                    y = 10;
                } else if (side === 1) {
                    x = Phaser.Math.Between(20, 340);
                    y = 630;
                } else if (side === 2) {
                    x = 10;
                    y = Phaser.Math.Between(20, 620);
                } else {
                    x = 350;
                    y = Phaser.Math.Between(20, 620);
                }

                const spark = this.add.text(x, y, '⚡', {
                    fontSize: '14px',
                    color: '#ffffff',
                    stroke: '#6d3bb8',
                    strokeThickness: 3
                }).setOrigin(0.5).setDepth(depth + 2);

                this.tweens.add({
                    targets: spark,
                    alpha: 0,
                    scale: 1.35,
                    duration: 220,
                    onComplete: () => spark.destroy()
                });
            }
        });
    }

    stopFlowStateEdgeTrace() {
        if (this.flowEdgeTween) {
            this.flowEdgeTween.stop();
            this.flowEdgeTween = null;
        }

        if (this.flowEdgeColorTimer) {
            this.flowEdgeColorTimer.remove(false);
            this.flowEdgeColorTimer = null;
        }

        this.flowEdgeRects.forEach((rect) => {
            if (rect && rect.active) rect.destroy();
        });

        this.flowEdgeRects = [];
    }

    startChaosModeEdgeTrace() {
        this.stopChaosModeEdgeTrace();

        const depth = 2850;

        const top = this.add.rectangle(180, 7, 360, 12, 0xff3b1f, 0.72).setDepth(depth);
        const bottom = this.add.rectangle(180, 633, 360, 12, 0xff3b1f, 0.72).setDepth(depth);
        const left = this.add.rectangle(7, 320, 12, 640, 0xff3b1f, 0.72).setDepth(depth);
        const right = this.add.rectangle(353, 320, 12, 640, 0xff3b1f, 0.72).setDepth(depth);

        this.chaosEdgeRects = [top, bottom, left, right];

        this.chaosEdgeTween = this.tweens.add({
            targets: this.chaosEdgeRects,
            alpha: { from: 0.32, to: 0.95 },
            duration: 130,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        let colorIndex = 0;
        this.chaosEdgeColorTimer = this.time.addEvent({
            delay: 110,
            loop: true,
            callback: () => {
                if (!this.chaosEdgeRects.length) return;

                const next = this.chaosEdgeColors[colorIndex];
                this.chaosEdgeRects.forEach((rect) => {
                    rect.setFillStyle(next, rect.alpha);
                });

                colorIndex = (colorIndex + 1) % this.chaosEdgeColors.length;

                const side = Phaser.Math.Between(0, 3);
                let x = 180;
                let y = 320;

                if (side === 0) {
                    x = Phaser.Math.Between(20, 340);
                    y = 10;
                } else if (side === 1) {
                    x = Phaser.Math.Between(20, 340);
                    y = 630;
                } else if (side === 2) {
                    x = 10;
                    y = Phaser.Math.Between(20, 620);
                } else {
                    x = 350;
                    y = Phaser.Math.Between(20, 620);
                }

                const spark = this.add.text(
                    x,
                    y,
                    Phaser.Math.Between(0, 1) === 0 ? '🔥' : '✦',
                    {
                        fontSize: '14px',
                        color: '#ffd27a',
                        stroke: '#5c0000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(depth + 2);

                this.tweens.add({
                    targets: spark,
                    alpha: 0,
                    scale: 1.3,
                    duration: 220,
                    onComplete: () => spark.destroy()
                });
            }
        });
    }

    stopChaosModeEdgeTrace() {
        if (this.chaosEdgeTween) {
            this.chaosEdgeTween.stop();
            this.chaosEdgeTween = null;
        }

        if (this.chaosEdgeColorTimer) {
            this.chaosEdgeColorTimer.remove(false);
            this.chaosEdgeColorTimer = null;
        }

        this.chaosEdgeRects.forEach((rect) => {
            if (rect && rect.active) rect.destroy();
        });

        this.chaosEdgeRects = [];
    }

    updateFallSpeedByHearts() {
        if (this.chaosModeActive) {
            this.currentFallSpeed = 10;
            return;
        }

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

        if (this.heartsCaught >= 950 && !this.chaosShown) {
            this.chaosShown = true;
            this.chaosModeActive = true;
            this.flowStateActive = false;
            this.currentLevelName = 'Chaos Mode';
            this.background.setTexture('backgroundgames4');
            this.stopFlowStateEdgeTrace();
            this.startChaosModeEdgeTrace();
            this.queueOrShowLevelMessage('Chaos Mode\nLevel Reached!', false);
            return;
        }

        if (this.heartsCaught >= 500 && !this.flowStateShown) {
            this.flowStateShown = true;
            this.flowStateActive = true;
            this.currentLevelName = 'Flow State';
            this.background.setTexture('backgroundgames3');
            this.startFlowStateEdgeTrace();
            this.queueOrShowLevelMessage('Flow State\nLevel Reached!', true, true);
            return;
        }

        if (this.heartsCaught >= 350 && !this.legendaryShown) {
            this.legendaryShown = true;
            this.currentLevelName = 'Legendary';
            this.queueOrShowLevelMessage('Legendary\nLevel Reached!', false);
            return;
        }

        if (this.heartsCaught >= 100 && !this.iconLevelShown) {
            this.iconLevelShown = true;
            this.currentLevelName = 'ICON';
            this.grammyUnlocked = true;
            this.queueOrShowLevelMessage('ICON\nLevel Reached!', false);

            if (this.gameStarted && !this.isGameOver && !this.grammyEventStarted) {
                this.triggerGrammyEvent();
            }
            return;
        }

        if (this.heartsCaught >= 60 && !this.superStarShown) {
            this.superStarShown = true;
            this.currentLevelName = 'Super Star';
            this.background.setTexture('backgroundgames2');
            this.queueOrShowLevelMessage('Super Star\nLevel Reached!', false);
            return;
        }

        if (this.heartsCaught >= 30 && !this.starLevelShown) {
            this.starLevelShown = true;
            this.currentLevelName = 'Star';
            this.queueOrShowLevelMessage('Star Level Reached!', false);
            return;
        }

        if (this.heartsCaught >= 15 && !this.risingStarShown) {
            this.risingStarShown = true;
            this.currentLevelName = 'Rising Star';
            this.queueOrShowLevelMessage('Rising Star\nLevel Reached!', false);
            return;
        }

        this.maybeTriggerLays();
        this.maybeTriggerLuvBomb();
    }

    updateHighScore() {
        if (this.heartsCaught > this.highScore) {
            this.highScore = this.heartsCaught;
            localStorage.setItem('luvaGirlHighScore', String(this.highScore));

            if (this.highScoreText) {
                this.highScoreText.setText(`Best: ${this.highScore}`);
            }
        }
    }

    getGameOverLevelStyle(levelName) {
        switch (levelName) {
            case 'Rising Star':
                return { color: '#d0b3ff', stroke: '#39205f', size: '22px' };
            case 'Star':
                return { color: '#fff47a', stroke: '#7d6700', size: '22px' };
            case 'Super Star':
                return { color: '#ffd700', stroke: '#6c5200', size: '23px' };
            case 'ICON':
                return { color: '#ff7ac7', stroke: '#5a143d', size: '23px' };
            case 'Legendary':
                return { color: '#b98aff', stroke: '#341362', size: '24px' };
            case 'Flow State':
                return { color: '#7df9ff', stroke: '#114f57', size: '24px' };
            case 'Chaos Mode':
                return { color: '#ff6868', stroke: '#5c0000', size: '25px' };
            default:
                return { color: '#ffffff', stroke: '#ff69b4', size: '21px' };
        }
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

        this.endLuvBomb();
        this.stopFlowStateEdgeTrace();
        this.stopChaosModeEdgeTrace();

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
        const levelStyle = this.getGameOverLevelStyle(levelText);

        this.add.rectangle(180, 320, 300, 430, 0x000000, 0.9).setDepth(4000);

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

        this.add.text(180, 290, 'Hearts Collected', {
            fontSize: '18px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 10, fill: true }
        }).setOrigin(0.5).setDepth(4001);

        this.add.text(180, 323, String(this.heartsCaught), {
            fontSize: '34px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: '#ff69b4', blur: 12, fill: true }
        }).setOrigin(0.5).setDepth(4001);

        this.add.text(180, 352, `Best Score: ${this.highScore}`, {
            fontSize: '17px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(4001);

        const finalLevelText = this.add.text(180, 382, levelText, {
            fontSize: levelStyle.size,
            color: levelStyle.color,
            stroke: levelStyle.stroke,
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 0, color: levelStyle.color, blur: 14, fill: true }
        }).setOrigin(0.5).setDepth(4001);

        this.tweens.add({
            targets: finalLevelText,
            scale: { from: 1, to: 1.05 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const endPresaveArrow = this.add.text(52, 428, '▶', {
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

        this.add.text(180, 428, 'Presave Luva Girl', {
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

        this.add.text(180, 456, 'Made by Source', {
            fontSize: '14px',
            color: '#fff'
        }).setOrigin(0.5).setDepth(4001);

        const playAgain = this.add.text(180, 510, 'Play Again', {
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
        if (this.heartsCaught >= 950) return 'Chaos Mode';
        if (this.heartsCaught >= 500) return 'Flow State';
        if (this.heartsCaught >= 350) return 'Legendary';
        if (this.heartsCaught >= 100) return 'ICON';
        if (this.heartsCaught >= 60) return 'Super Star';
        if (this.heartsCaught >= 30) return 'Star';
        if (this.heartsCaught >= 15) return 'Rising Star';
        return 'Luva Girl';
    }
}
