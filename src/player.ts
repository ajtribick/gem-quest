import 'phaser'
import { AssetNames } from './gamedata';

const Animations = {
    playerL: 'playerL',
    playerR: 'playerR',
    playerUD: 'playerUD',
    playerDead: 'playerDead',
};

const AnimationRate = 10;
const WalkSpeed = 40;
const AccelerationFactor = 4;
const JumpSpeed = 60;
const JumpCount = 12;

export class Player {
    sprite: Phaser.Physics.Arcade.Sprite;
    onLadder = false;
    dead = false;

    private scene: Phaser.Scene;
    private platforms: Phaser.Tilemaps.TilemapLayer;
    private ladders: Phaser.Physics.Arcade.StaticGroup;
    private platformsCollider: Phaser.Physics.Arcade.Collider;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private hasFriction = true;
    private ladderLeft = 0;
    private ladderTop = 0;
    private ladderBottom = 0;
    private jumpCount = 0;
    private wasOnFloor = true;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string,
                platforms: Phaser.Tilemaps.TilemapLayer,
                ladders: Phaser.Physics.Arcade.StaticGroup,
                cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        this.scene = scene;
        this.platforms = platforms;
        this.ladders = ladders;
        this.cursors = cursors;

        this.sprite = scene.physics.add.sprite(x, y, key, 'playerR1').setName('player').setOrigin(0, 0).setCollideWorldBounds(true);
        const body = (this.sprite.body as Phaser.Physics.Arcade.Body)
            .setSize(8, 15)
            .setOffset(0, 1);
        body.onWorldBounds = true;
        platforms.setTileIndexCallback([1, 2, 3, 4], () => { this.hasFriction = true; }, this);
        this.platformsCollider = scene.physics.add.collider(this.sprite, platforms);
    }

    static createAnimations(scene: Phaser.Scene, key: string): void {
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
    }

    update(): void {
        if (this.dead) { return; }

        const playerBody = this.sprite.body as Phaser.Physics.Arcade.Body;

        const hasFriction = this.hasFriction;
        this.hasFriction = false;
        const onFloor = playerBody.onFloor();
        if (onFloor) {
            if (!this.wasOnFloor && this.jumpCount < 8) {
                this.scene.sound.play(AssetNames.landSound);
            }
            this.jumpCount = JumpCount;
        } else if (this.jumpCount > 0) {
            --this.jumpCount;
        }

        this.wasOnFloor = onFloor;

        const leftDown = this.cursors.left?.isDown;
        const rightDown = this.cursors.right?.isDown;

        if (!this.onLadder) {
            let vx: number;
            if (hasFriction) {
                vx = 0;
                if (leftDown) {
                    vx -= WalkSpeed;
                }
                if (rightDown) {
                    vx += WalkSpeed;
                }
                if (vx < 0) {
                    this.sprite.anims.play(Animations.playerL, true);
                } else if (vx > 0) {
                    this.sprite.anims.play(Animations.playerR, true);
                } else {
                    this.sprite.anims.stop();
                }
            } else {
                vx = playerBody.velocity.x;
                if (leftDown && vx > -WalkSpeed) {
                    vx -= AccelerationFactor;
                }
                if (rightDown && vx < WalkSpeed) {
                    vx += AccelerationFactor;
                }
                this.sprite.anims.stop()
                if (vx < 0) {
                    this.sprite.setFrame('playerL1');
                } else if (vx > 0) {
                    this.sprite.setFrame('playerR1');
                }
            }

            playerBody.setVelocityX(vx);

            const ladder = this.getLadder();

            if (this.cursors.up?.isDown) {
                if (ladder && !(leftDown || rightDown)) {
                    this.setOnLadder(ladder);
                } else if (this.jumpCount > 0) {
                    playerBody.setVelocityY(-JumpSpeed);
                    if (this.jumpCount == JumpCount) {
                        this.scene.sound.play(AssetNames.jumpSound);
                    }
                }
            }
            if (this.cursors.down?.isDown && ladder && !(leftDown || rightDown)) {
                this.setOnLadder(ladder);
            }
        } else {
            let vy = 0;
            this.sprite.setX(this.ladderLeft);
            const bounds = new Phaser.Geom.Rectangle(playerBody.left + (leftDown ? -1 : 0) + (rightDown ? 1 : 0),
                                                     playerBody.top,
                                                     playerBody.width,
                                                     playerBody.height);
            if ((leftDown || rightDown) &&
                    this.platforms.getTilesWithinShape(bounds, { isColliding: true, isNotEmpty: true }).length === 0) {
                this.clearOnLadder();
            } else {
                if (playerBody.top < this.ladderTop) {
                    this.sprite.setY(this.ladderTop);
                } else if (playerBody.bottom > this.ladderBottom) {
                    this.sprite.setY(this.ladderBottom - this.sprite.height);
                }
                if (this.cursors.up?.isDown && playerBody.top > this.ladderTop) {
                    vy -= WalkSpeed;
                }
                if (this.cursors.down?.isDown && playerBody.bottom < this.ladderBottom) {
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

    public getLadder(): Phaser.Physics.Arcade.Sprite | null {
        let ladder: Phaser.Physics.Arcade.Sprite | null = null;
        this.scene.physics.overlap(this.sprite, this.ladders, (_p, l) => { ladder = l as Phaser.Physics.Arcade.Sprite; }, undefined, this);
        return ladder;
    }

    public setOnLadder(ladder: Phaser.Physics.Arcade.Sprite): void {
        const ladderBody = ladder.body as Phaser.Physics.Arcade.Body;
        this.onLadder = true;
        this.ladderTop = ladderBody.top - 8;
        this.ladderBottom = ladderBody.bottom;
        this.ladderLeft = ladder.x - 4;
        this.sprite.setFrame('playerUD1');
        this.sprite.setX(this.ladderLeft);
        this.sprite.setVelocityX(0);
        (this.sprite.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        this.platformsCollider.active = false;
    }

    private clearOnLadder(): void {
        this.onLadder = false;
        this.jumpCount = JumpCount;
        (this.sprite.body as Phaser.Physics.Arcade.Body).allowGravity = true;
        this.platformsCollider.active = true;
    }

    die(diedCallback: () => void): void {
        if (!this.dead) {
            this.dead = true;
            this.clearOnLadder();
            this.sprite.anims.stop();
            this.sprite.on('animationcomplete', () => {
                this.scene.time.delayedCall(500, () => {
                    diedCallback();
                })
            }, this);

            this.sprite.anims.play(Animations.playerDead);
            this.sprite.setDragX(40);
            this.sprite.setBounce(0.3);
        }
    }

    destroy(): void {
        this.sprite.destroy();
    }
}
