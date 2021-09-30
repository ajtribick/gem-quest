import 'phaser';
import {SceneNames, AssetNames, Levels} from './gamedata';
import atlas from './assets/atlas.json';

const images = {
    font: require('url:./assets/font.png'),
    tiles: require('url:./assets/tiles.png')
};

const sounds = {
    die: require('url:./assets/die.mp3'),
    gem: require('url:./assets/gem.mp3'),
    jump: require('url:./assets/jump.mp3'),
    key: require('url:./assets/key.mp3'),
    land: require('url:./assets/land.mp3'),
    win: require('url:./assets/win.mp3')
};

const jsons = {
    atlas: atlas
};

export class LoadScene extends Phaser.Scene {
    constructor() {
        super('myScene');
    }

    preload(): void {
        this.load.atlas(AssetNames.tiles, images.tiles, jsons.atlas);
        Levels.forEach(level => {
            this.load.tilemapTiledJSON(level[0], level[1]);
        });
        this.load.image(AssetNames.font, images.font);

        this.load.audio(AssetNames.gemSound, sounds.gem);
        this.load.audio(AssetNames.keySound, sounds.key);
        this.load.audio(AssetNames.dieSound, sounds.die);
        this.load.audio(AssetNames.jumpSound, sounds.jump);
        this.load.audio(AssetNames.landSound, sounds.land);
        this.load.audio(AssetNames.winSound, sounds.win);
    }

    create(): void {
        const fontConfig: Phaser.Types.GameObjects.BitmapText.RetroFontConfig = {
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
}
