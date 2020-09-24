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
        const objX = obj.x ?? 0;
        const objY = obj.y ?? 0;
        this.spider = group.create(objX + mapX, objY + mapY, key, 'spider1').setOrigin(0.5, 0.5);

        this.path = new Phaser.Curves.Path();
        let yoyo = false;
        (obj.polygon ?? obj.polyline)?.forEach((coords, index) => {
            const coordsX = coords.x ?? 0;
            const coordsY = coords.y ?? 0;
            if (index === 0) {
                this.path.moveTo(coordsX + objX + mapX, coordsY + objY + mapY);
            } else {
                this.path.lineTo(coordsX + objX + mapX, coordsY + objY + mapY);
            }
        });

        if (obj.polyline) { yoyo = true; }

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

    static createAnimation(scene: Phaser.Scene, key: string): void {
        scene.anims.create({
            key: Animation,
            frames: scene.anims.generateFrameNames(key, { prefix: 'spider', start: 1, end: 2 }),
            frameRate: 5,
            repeat: -1
        });
    }

    update(): void {
        const t = this.spider.z;
        this.path.getPoint(t, this.vector);
        this.spider.setPosition(this.vector.x, this.vector.y);
    }
}
