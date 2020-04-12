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

        this.load.audio(AssetNames.gemSound, require('./assets/gem.mp3'));
        this.load.audio(AssetNames.keySound, require('./assets/key.mp3'));
        this.load.audio(AssetNames.dieSound, require('./assets/die.mp3'));
        this.load.audio(AssetNames.jumpSound, require('./assets/jump.mp3'));
        this.load.audio(AssetNames.landSound, require('./assets/land.mp3'));
        this.load.audio(AssetNames.winSound, require('./assets/win.mp3'));
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

        this.scene.start(SceneNames.menu);
    }
};
