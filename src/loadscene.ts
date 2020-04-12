import 'phaser';
import {SceneNames, AssetNames, Levels, GameData} from './gamedata';

export class LoadScene extends Phaser.Scene {
    constructor() {
        super('myScene');
    }

    preload(): void {
        this.load.atlas(AssetNames.tiles, require('./assets/tiles.png'), require('./assets/atlas.json'));
        Levels.forEach(level => {
            this.load.tilemapTiledJSON(level[0], level[1]);
        });
    }

    create(): void {
        var gameStart: GameData = {
            playerX: 16,
            playerY: 160,
            level: 11,
            openDoors: new Set<number>(),
            remainingGems: new Map<number, Set<number>>()
        };

        this.scene.start(SceneNames.main, gameStart);
    }
};
