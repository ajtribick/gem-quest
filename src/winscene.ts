import 'phaser'
import {SceneNames, AssetNames, GameData} from './gamedata'

export class WinScene extends Phaser.Scene {
    constructor() {
        super(SceneNames.win);
    }

    create(): void {
        this.add.bitmapText(64, 64, AssetNames.font, "CONGRATULATIONS!");
        this.add.bitmapText(64, 80, AssetNames.font, "A winner is you!");
        var text = this.add.bitmapText(76, 128, AssetNames.font, "[Start again]").setInteractive();
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
