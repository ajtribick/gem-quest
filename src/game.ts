import 'phaser';
import {LoadScene} from './loadscene';
import {MenuScene} from './menuscene';
import {MainScene} from './mainscene';
import {GameOverScene} from './gameoverscene';
import {WinScene} from './winscene';


const config: Phaser.Types.Core.GameConfig = {
    scene: [LoadScene, MenuScene, MainScene, GameOverScene, WinScene],
    scale: {
        width: 256,
        height: 192,
        parent: 'game-host',
        mode: Phaser.Scale.NONE,
        zoom: Phaser.Scale.MAX_ZOOM
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 250 },
            tileBias: 8,
            debug: false
        }
    }
};

new Phaser.Game(config);
