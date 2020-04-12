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
        this.load.image(AssetNames.font, require('./assets/font.png'));

    }

    create(): void {
        var fontConfig: Phaser.Types.GameObjects.BitmapText.RetroFontConfig = {
            image: AssetNames.font,
            width: 8,
            height: 8,
            chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,?!:/[]() ',
            "offset.x": 0,
            "offset.y": 0,
            "spacing.x": 0,
            "spacing.y": 0,
            lineSpacing: 0,
            charsPerRow: 72
        };
        this.cache.bitmapFont.add(AssetNames.font, Phaser.GameObjects.RetroFont.Parse(this, fontConfig));

        var gameStart: GameData = {
            startX: 16,
            startY: 160,
            onLadder: false,
            level: 11,
            openDoors: new Set<number>(),
            remainingGems: new Map<number, Set<number>>()
        };

        this.scene.start(SceneNames.menu, gameStart);
    }
};
