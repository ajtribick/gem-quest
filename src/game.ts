import 'phaser';
import {LoadScene} from './loadscene';
import {MainScene} from './mainscene';

const config: Phaser.Types.Core.GameConfig = {
    scene: [LoadScene, MainScene],
    scale: {
        width: 256,
        height: 192,
        parent: 'game-host',
        mode: Phaser.Scale.NONE,
        zoom: Phaser.Scale.MAX_ZOOM
    },
    physics: {
        default: 'arcade'
    }
};

const game = new Phaser.Game(config);
