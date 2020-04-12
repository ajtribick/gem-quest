import 'phaser'
import {SceneNames, AssetNames, GameData, createStartData, GameSummary} from './gamedata';

export class GameOverScene extends Phaser.Scene {
    private summary!: GameSummary;

    constructor() {
        super(SceneNames.gameOver);
    }

    init(data: any): void {
        this.summary = data as GameSummary;
    }

    create(): void {
        this.add.bitmapText(92, 64, AssetNames.font, "GAME OVER");
        var scoreText = "You scored " + this.summary.finalScore.toString();
        this.add.bitmapText(128 - scoreText.length * 4, 80, AssetNames.font, scoreText);
        var text = this.add.bitmapText(76, 128, AssetNames.font, "[Start again]").setInteractive();
        text.on('pointerover', () => { text.setTint(0x00ff00); });
        text.on('pointerdown', () => { text.setTint(0xffff00); });
        text.on('pointerup', () => { this.scene.start(SceneNames.main, createStartData()); });
        text.on('pointerout', () => { text.setTint(); });
        this.sound.play(AssetNames.dieSound);
    }
}
