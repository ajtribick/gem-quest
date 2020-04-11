import 'phaser'

const Animations = {
    playerL: 'playerL',
    playerR: 'playerR',
    playerUD: 'playerUD',
    playerDead: 'playerDead',
};

const AnimationRate = 10;
const WalkSpeed = 40;
const JumpSpeed = 50;

export class Player {
    sprite: Phaser.Physics.Arcade.Sprite;

    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string) {
        scene.anims.create({
            key: Animations.playerR,
            frames: scene.anims.generateFrameNames(key, { prefix: 'playerR', frames: [1, 2, 3, 2] }),
            frameRate: AnimationRate,
            repeat: -1
        });

        scene.anims.create({
            key: Animations.playerL,
            frames: scene.anims.generateFrameNames(key, { prefix: 'playerL', frames: [1, 2, 3, 2] }),
            frameRate: AnimationRate,
            repeat: -1
        });

        scene.anims.create({
            key: Animations.playerUD,
            frames: scene.anims.generateFrameNames(key, { prefix: 'playerUD', start: 1, end: 2 }),
            frameRate: AnimationRate,
            repeat: -1
        });

        scene.anims.create({
            key: Animations.playerDead,
            frames: scene.anims.generateFrameNames(key, { prefix: 'playerDead', start: 1, end: 4 }),
            frameRate: AnimationRate,
            repeat: 0
        });

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.sprite = scene.physics.add.sprite(x!, y!, key, 'playerR1').setOrigin(0, 0);
    }

    update() {
        var playerBody = this.sprite.body as Phaser.Physics.Arcade.Body;
        var vx = 0;
        if (this.cursors.left?.isDown) {
            vx -= WalkSpeed;
        }
        if (this.cursors.right?.isDown) {
            vx += WalkSpeed;
        }
        if (vx < 0) {
            this.sprite.anims.play(Animations.playerL, true);
        } else if (vx > 0) {
            this.sprite.anims.play(Animations.playerR, true);
        } else {
            this.sprite.anims.stop();
        }

        playerBody.setVelocityX(vx);
        if (this.cursors.up?.isDown) {
            playerBody.setVelocityY(-JumpSpeed);
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}
