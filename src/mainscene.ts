import 'phaser';
import {SceneNames, AssetNames} from './consts';
import {Player} from './player';
import {Spider} from './spider';

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
    gem: 'gem',
    spider: 'spider'
};

const MapX = 0;
const MapY = 8;

export class MainScene extends Phaser.Scene {
    private map!: Phaser.Tilemaps.Tilemap;
    private platformLayer!: Phaser.Tilemaps.StaticTilemapLayer;
    private waterLayer!: Phaser.Tilemaps.DynamicTilemapLayer;
    private waterFrames: integer = 10;

    private gemsGroup!: Phaser.GameObjects.Group;
    private spiders: Spider[] = [];
    private player!: Player;

    constructor() {
        super(SceneNames.main);
    }

    create() {
        this.createMap();
        this.createObjects();
        this.createSpiders();

        this.physics.add.collider(this.player.sprite, this.platformLayer);
    }

    private createMap() {
        this.map = this.add.tilemap(AssetNames.level1);
        var platformTiles = this.map.addTilesetImage(LocalAssets.tiles, AssetNames.tiles);
        this.platformLayer = this.map.createStaticLayer(LayerNames.platforms, platformTiles, MapX, MapY);
        this.platformLayer.setCollision([1,2,3,4,9,10]);

        this.map.createStaticLayer(LayerNames.ladders, platformTiles, MapX, MapY);
        this.map.createStaticLayer(LayerNames.deadly, platformTiles, MapX, MapY);
        this.waterLayer = this.map.createDynamicLayer(LayerNames.water, platformTiles, MapX, MapY);
    }

    private createObjects() {
        this.gemsGroup = this.add.group();

        this.anims.create({
            key: Animations.gem,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'gem', start: 1, end: 4 }),
            frameRate: 5,
            repeat: -1
        });


        var objsLayer = this.map.getObjectLayer(LayerNames.objects);
        objsLayer.objects.forEach((obj) => {
            switch (obj.type) {
                case 'gem':
                    var gem = (this.gemsGroup.create(obj.x! + MapX, obj.y! + MapY, LocalAssets.tiles, 'gem1') as Phaser.GameObjects.Sprite).setOrigin(0, 1);
                    gem.anims.play(Animations.gem);
                    this.gemsGroup.add(gem);
                    break;
                case 'key':
                    this.add.sprite(obj.x! + MapX, obj.y! + MapY, LocalAssets.tiles, obj.name).setOrigin(0, 1);
                    break;
                case 'door':
                    this.add.sprite(obj.x! + MapX, obj.y! + MapY, LocalAssets.tiles, obj.name).setOrigin(0, 0);
                    break;
                case 'player':
                    if (!this.player) {
                        this.player = new Player(this, obj.x! + MapX, obj.y! + MapY, LocalAssets.tiles);
                    } else {
                        console.log("Attempted to add player twice");
                    }
                    break;
            }
        });
    }

    private createSpiders() {
        Spider.createAnimation(this, 'tiles');
        var spidersGroup = this.physics.add.group({ allowGravity: false });
        var spiderLayer = this.map.getObjectLayer(LayerNames.spiders);
        spiderLayer.objects.forEach((obj) => {
            this.spiders.push(new Spider(this, obj, spidersGroup, MapX, MapY, LocalAssets.tiles));
        });
    }

    update() {
        this.player.update();

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

        this.spiders.forEach((spider) => { spider.update(); });
    }
};
