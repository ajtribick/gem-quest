import 'phaser'
import {SceneNames, AssetNames, createStartData, GameSummary, FlashColors} from './gamedata'

export class WinScene extends Phaser.Scene {
    private summary!: GameSummary;
    private title!: Phaser.GameObjects.BitmapText;
    private color = 0;

    constructor() {
        super(SceneNames.win);
    }

    init(data: GameSummary): void {
        this.summary = data;
    }

    create(): void {
        this.title = this.add.bitmapText(64, 64, AssetNames.font, "CONGRATULATIONS!");
        this.add.bitmapText(64, 80, AssetNames.font, "A winner is you!");
        const scoreText = "You scored " + this.summary.finalScore.toString();
        this.add.bitmapText(128 - scoreText.length * 4, 96, AssetNames.font, scoreText);
        const text = this.add.bitmapText(76, 128, AssetNames.font, "[Start again]").setInteractive();
        text.on('pointerover', () => { text.setTint(0x00ff00); });
        text.on('pointerdown', () => { text.setTint(0xffff00); });
        text.on('pointerup', () => { this.scene.start(SceneNames.main, createStartData()); });
        text.on('pointerout', () => { text.setTint(); });
        this.sound.play(AssetNames.winSound);

        this.time.addEvent({
            delay: 400,
            callback: this.changeColor,
            callbackScope: this,
            loop: true
        });
    }

    private changeColor(): void {
        ++this.color;
        if (this.color >= FlashColors.length) {
            this.color = 0;
        }

        this.title.setTint(FlashColors[this.color]);
    }
}
