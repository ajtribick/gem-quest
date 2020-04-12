import 'phaser';
import {AssetNames, SceneNames, GameData} from './gamedata';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super(SceneNames.menu);
    }

    create(): void {
        var text = this.add.bitmapText(100, 128, AssetNames.font, "[Start]").setInteractive();
        text.on('pointerover', () => { text.setTint(0xffff00); });
        text.on('pointerdown', () => { text.setTint(0xff0000); });
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
    }
}
