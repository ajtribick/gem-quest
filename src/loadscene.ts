import 'phaser';
import {SceneNames, AssetNames} from './consts';
import {GameData} from './gamedata';

export class LoadScene extends Phaser.Scene {
    constructor() {
        super('myScene');
    }

    preload() {
        this.load.atlas(AssetNames.tiles, require('./assets/tiles.png'), require('./assets/atlas.json'));
        this.load.tilemapTiledJSON(AssetNames.level1, require('./assets/map.json'));
    }

    create() {
        let gameStart: GameData = { playerX: 16, playerY: 160 };
        this.scene.start(SceneNames.main, gameStart);
    }
};
