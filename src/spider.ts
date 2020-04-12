import 'phaser';

const Animation = "spider";

export class Spider {
    spider: Phaser.Physics.Arcade.Sprite;
    private vector: Phaser.Math.Vector2;
    private path: Phaser.Curves.Path;

    constructor(scene: Phaser.Scene,
                obj: Phaser.Types.Tilemaps.TiledObject,
                group: Phaser.Physics.Arcade.Group,
                mapX: number, mapY: number, key: string) {
        this.spider = group.create(obj.x! + mapX, obj.y! + mapY, key, 'spider1').setOrigin(0.5, 0.5);

        this.path = new Phaser.Curves.Path();
        var yoyo = false;
        if (obj.polygon) {
            obj.polygon.forEach((coords, index) => {
                if (index === 0) {
                    this.path.moveTo(coords.x! + obj.x! + mapX, coords.y! + obj.y! + mapY);
                } else {
                    this.path.lineTo(coords.x! + obj.x! + mapX, coords.y! + obj.y! + mapY);
                }
            });
        } else if (obj.polyline) {
            obj.polyline.forEach((coords, index) => {
                if (index === 0) {
                    this.path.moveTo(coords.x! + obj.x! + mapX, coords.y! + obj.y! + mapY);
                } else {
                    this.path.lineTo(coords.x! + obj.x! + mapX, coords.y! + obj.y! + mapY);
                }
            });
            yoyo = true;
        }

        this.vector = new Phaser.Math.Vector2();
        this.spider.anims.play(Animation);

        scene.tweens.add({
            targets: this.spider,
            z: 1,
            ease: 'Linear',
            duration: this.path.getLength() * 24,
            repeat: -1,
            delay: 0,
            yoyo: yoyo
        });
    }

    static createAnimation(scene: Phaser.Scene, key: string) {
        scene.anims.create({
            key: Animation,
            frames: scene.anims.generateFrameNames(key, { prefix: 'spider', start: 1, end: 2 }),
            frameRate: 5,
            repeat: -1
        });
    }

    update() {
        var t = this.spider.z;
        this.path.getPoint(t, this.vector);
        this.spider.setPosition(this.vector.x, this.vector.y);
    }
}
