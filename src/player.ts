import 'phaser'

const Animations = {
    playerL: 'playerL',
    playerR: 'playerR',
    playerUD: 'playerUD',
    playerDead: 'playerDead',
};

const AnimationRate = 10;
const WalkSpeed = 40;
const JumpSpeed = 60;
const JumpCount = 12;

export class Player {
    sprite: Phaser.Physics.Arcade.Sprite;
    dead = false;

    private platforms: Phaser.Tilemaps.StaticTilemapLayer;
    private platformsCollider: Phaser.Physics.Arcade.Collider;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private onLadder = false;
    private jumpCount = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, platforms: Phaser.Tilemaps.StaticTilemapLayer) {
        this.platforms = platforms;

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
            frameRate: AnimationRate / 2,
            repeat: 0
        });

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.sprite = scene.physics.add.sprite(x!, y!, key, 'playerR1').setOrigin(0, 0);
        this.platformsCollider = scene.physics.add.collider(this.sprite, platforms);
    }

    update(canEnterLadder: boolean) {
        if (this.dead) { return; }

        var playerBody = this.sprite.body as Phaser.Physics.Arcade.Body;
        if (playerBody.onFloor()) {
            this.jumpCount = JumpCount;
        } else if (this.jumpCount > 0) {
            --this.jumpCount;
        }

        if (!this.onLadder) {
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
                if (canEnterLadder && vx === 0) {
                    this.setOnLadder();
                } else if (this.jumpCount > 0) {
                    playerBody.setVelocityY(-JumpSpeed);
                }
            }
            if (this.cursors.down?.isDown && canEnterLadder && vx === 0) {
                this.setOnLadder();
            }
        } else {
            var vy = 0;
            if ((this.cursors.left?.isDown || this.cursors.right?.isDown) &&
                    this.platforms.getTilesWithinShape(this.sprite.getBounds(), { isColliding: true, isNotEmpty: true }).length === 0) {
                this.clearOnLadder();
            } else {
                if (this.cursors.up?.isDown) {
                    vy -= WalkSpeed;
                }
                if (this.cursors.down?.isDown) {
                    vy += WalkSpeed;
                }
                if (vy !== 0) {
                    this.sprite.anims.play(Animations.playerUD, true);
                } else {
                    this.sprite.anims.stop();
                }
            }

            playerBody.setVelocityY(vy);
        }
    }

    private setOnLadder() {
        this.onLadder = true;
        (this.sprite.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        this.platformsCollider.active = false;
    }

    private clearOnLadder() {
        this.onLadder = false;
        this.jumpCount = 0;
        (this.sprite.body as Phaser.Physics.Arcade.Body).allowGravity = true;
        this.platformsCollider.active = true;
    }

    die() {
        if (!this.dead) {
            this.dead = true;
            this.sprite.anims.play(Animations.playerDead);
            this.sprite.setDragX(40);
            this.sprite.setBounce(0.3);
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}
