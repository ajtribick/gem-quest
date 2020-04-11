import 'phaser';
import {SceneNames, AssetNames} from './consts';

const LayerNames = {
    platforms: 'Platforms',
    ladders: 'Ladders',
    deadly: 'Deadly',
    water: 'Water',
    objects: 'Objects',
    spiders: 'Spiders'
};

const LocalAssets = {
    tiles: 'tiles'
};

const SpiderData = {
    vector: 'vector',
    path: 'path'
};

const Animations = {
    playerL: 'playerL',
    playerR: 'playerR',
    playerUD: 'playerUD',
    playerDead: 'playerDead',
    gem: 'gem',
    spider: 'spider'
};

export class MainScene extends Phaser.Scene {
    private map!: Phaser.Tilemaps.Tilemap;
    private waterLayer!: Phaser.Tilemaps.DynamicTilemapLayer;
    private waterFrames: integer = 10;

    private gemsGroup!: Phaser.GameObjects.Group;
    private spidersGroup!: Phaser.GameObjects.Group;

    private player!: Phaser.GameObjects.Sprite;

    constructor() {
        super(SceneNames.main);
    }

    create() {
        this.createMap();
        this.createObjects();
        this.createSpiders();
    }

    private createMap() {
        this.map = this.add.tilemap(AssetNames.level1);
        var platformTiles = this.map.addTilesetImage(LocalAssets.tiles, AssetNames.tiles);
        this.map.createStaticLayer(LayerNames.platforms, platformTiles, 0, 8);
        this.map.createStaticLayer(LayerNames.ladders, platformTiles, 0, 8);
        this.map.createStaticLayer(LayerNames.deadly, platformTiles, 0, 8);
        this.waterLayer = this.map.createDynamicLayer(LayerNames.water, platformTiles, 0, 8);
    }

    private createObjects() {
        this.gemsGroup = this.add.group();

        this.anims.create({
            key: Animations.gem,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'gem', start: 1, end: 4 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: Animations.playerR,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'playerR', frames: [1, 2, 3, 2] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: Animations.playerL,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'playerL', frames: [1, 2, 3, 2] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: Animations.playerUD,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'playerUD', start: 1, end: 2 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: Animations.playerDead,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'playerDead', start: 1, end: 4 }),
            frameRate: 5,
            repeat: 0
        });

        var objsLayer = this.map.getObjectLayer(LayerNames.objects);
        objsLayer.objects.forEach((obj) => {
            switch (obj.type) {
                case 'gem':
                    var gem = (this.gemsGroup.create(obj.x!, obj.y! + 8, LocalAssets.tiles, 'gem1') as Phaser.GameObjects.Sprite).setOrigin(0, 1);
                    gem.anims.play(Animations.gem);
                    this.gemsGroup.add(gem);
                    break;
                case 'key':
                    this.add.sprite(obj.x!, obj.y! + 8, LocalAssets.tiles, obj.name).setOrigin(0, 1);
                    break;
                case 'door':
                    this.add.sprite(obj.x!, obj.y! + 8, LocalAssets.tiles, obj.name).setOrigin(0, 0);
                    break;
                case 'player':
                    if (!this.player) {
                        this.player = this.add.sprite(obj.x!, obj.y! + 8, LocalAssets.tiles, 'playerR1').setOrigin(0, 0);
                    } else {
                        console.log("Attempted to add player twice");
                    }
                    break;
            }
        });
    }

    private createSpiders() {
        this.anims.create({
            key: Animations.spider,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'spider', start: 1, end: 2 }),
            frameRate: 5,
            repeat: -1
        });

        this.spidersGroup = this.add.group();
        var spiderLayer = this.map.getObjectLayer(LayerNames.spiders);
        spiderLayer.objects.forEach((obj) => {
            var spider = this.spidersGroup.create(obj.x!, obj.y! + 8, LocalAssets.tiles, 'spider1').setOrigin(0.5, 0.5);

            var path = new Phaser.Curves.Path();
            var yoyo = false;
            if (obj.polygon) {
                obj.polygon.forEach((coords, index) => {
                    if (index === 0) {
                        path.moveTo(coords.x! + obj.x!, coords.y! + obj.y! + 8);
                    } else {
                        path.lineTo(coords.x! + obj.x!, coords.y! + obj.y! + 8);
                    }
                });
            } else if (obj.polyline) {
                obj.polyline.forEach((coords, index) => {
                    if (index === 0) {
                        path.moveTo(coords.x! + obj.x!, coords.y! + obj.y! + 8);
                    } else {
                        path.lineTo(coords.x! + obj.x!, coords.y! + obj.y! + 8);
                    }
                });
                yoyo = true;
            } else {
                console.log("Spider path is missing");
                return;
            }

            spider.setData(SpiderData.vector, new Phaser.Math.Vector2());
            spider.setData(SpiderData.path, path);
            spider.anims.play(Animations.spider);

            this.tweens.add({
                targets: spider,
                z: 1,
                ease: 'Linear',
                duration: path.getLength() * 24,
                repeat: -1,
                delay: 0,
                yoyo: yoyo
            });
        });
    }

    update() {
        if (--this.waterFrames === 0) {
            this.waterLayer.forEachTile(tile => {
                if (tile.index === 17) {
                    tile.index = 18;
                } else if (tile.index === 18) {
                    tile.index = 17;
                }
            });
            this.waterFrames = 10;
        }

        (this.spidersGroup.getChildren() as Phaser.GameObjects.Sprite[]).forEach((spider) => {
            var t = spider.z;
            var vec = spider.getData(SpiderData.vector) as Phaser.Math.Vector2;
            var path = spider.getData(SpiderData.path) as Phaser.Curves.Path;

            path.getPoint(t, vec);
            spider.setPosition(vec.x, vec.y);
        });
    }
};
