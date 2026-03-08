import { Start } from './scenes/Start.js';

const config = {
    type: Phaser.AUTO,
    title: 'Luva Girl Heart Catch',
    description: '',
    parent: 'game-container',
    width: 360,
    height: 640,
    backgroundColor: '#000000',
    pixelArt: true,
    scene: [
        Start
    ],
    physics: {
    default: 'arcade',
    arcade: {
        debug: false
    }
},
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            