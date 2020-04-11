import 'phaser';
import {SceneNames, AssetNames, Levels} from './consts';
import {GameData} from './gamedata';

export class LoadScene extends Phaser.Scene {
    constructor() {
        super('myScene');
    }

    preload() {
        this.load.atlas(AssetNames.tiles, require('./assets/tiles.png'), require('./assets/atlas.json'));
        Levels.forEach(level => {
            this.load.tilemapTiledJSON(level[0], level[1]);
        });
    }

    create() {
        var gameStart: GameData = {
            playerX: 16,
            playerY: 160,
            levelX: 0,
            levelY: 0,
            openDoors: new Set<number>()
        }

        this.scene.start(SceneNames.main, gameStart);
    }
};
