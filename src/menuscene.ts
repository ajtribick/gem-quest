import 'phaser';
import {AssetNames, SceneNames, GameData} from './gamedata';

const Colors = [
    0xff0000,
    0x00ff00,
    0xffff00,
    0x0000ff,
    0xff00ff,
    0x00ffff,
    0xffffff
];

export class MenuScene extends Phaser.Scene {
    private title!: Phaser.GameObjects.BitmapText;
    private color = 0;

    constructor() {
        super(SceneNames.menu);
    }

    create(): void {
        this.title = this.add.bitmapText(92, 64, AssetNames.font, "GEM QUEST");
        var text = this.add.bitmapText(100, 128, AssetNames.font, "[Start]").setInteractive();
        text.on('pointerover', () => { text.setTint(0x00ff00); });
        text.on('pointerdown', () => { text.setTint(0xffff00); });
        text.on('pointerup', () => {
            var gameStart: GameData = {
                startX: 16,
                startY: 160,
                onLadder: false,
                level: 11,
                openDoors: new Set<number>(),
                remainingGems: new Map<number, Set<number>>()
            };

            this.scene.start(SceneNames.main, gameStart);
        });
        text.on('pointerout', () => { text.setTint(); });

        this.time.addEvent({
            delay: 400,
            callback: this.changeColor,
            callbackScope: this,
            loop: true
        });
    }

    private changeColor(): void {
        ++this.color;
        if (this.color >= Colors.length) {
            this.color = 0;
        }

        this.title.setTint(Colors[this.color]);
    }
}
