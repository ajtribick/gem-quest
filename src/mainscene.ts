import 'phaser';
import {GameData, SceneNames, AssetNames} from './gamedata';
import {Player} from './player';
import {Spider} from './spider';

const LayerNames = {
    platforms: 'Platforms',
    ladders: 'Ladders',
    deadly: 'Deadly',
    objects: 'Objects',
};

const ObjTypes = {
    gem: 'gem',
    key: 'key',
    door: 'door',
    spider: 'spider'
};

const LocalAssets = {
    tiles: 'tiles'
};

const Animations = {
    gem: 'gem',
    spider: 'spider'
};

const MapX = 0;
const MapY = 8;

export class MainScene extends Phaser.Scene {
    private gameData!: GameData;
    private map!: Phaser.Tilemaps.Tilemap;
    private platformLayer!: Phaser.Tilemaps.StaticTilemapLayer;
    private deadlyLayer!: Phaser.Tilemaps.DynamicTilemapLayer;
    private waterFrames: integer = 10;

    private gemsGroup!: Phaser.Physics.Arcade.Group;
    private keysGroup!: Phaser.Physics.Arcade.Group;
    private doorsGroup!: Phaser.Physics.Arcade.Group;
    private spidersGroup!: Phaser.Physics.Arcade.Group;
    private spikesGroup!: Phaser.Physics.Arcade.Group;
    private laddersGroup!: Phaser.Physics.Arcade.StaticGroup;
    private spiders: Spider[] = [];
    private player!: Player;

    constructor() {
        super(SceneNames.main);
    }

    init(data: any) {
        this.gameData = data as GameData;
    }

    create() {
        this.createMap();
        this.createObjects();

        this.player = new Player(this, this.gameData.playerX, this.gameData.playerY, AssetNames.tiles, this.platformLayer, this.laddersGroup);

        this.physics.add.collider(this.player.sprite, this.doorsGroup);
        this.physics.add.overlap(this.player.sprite, this.gemsGroup, this.collectGem, undefined, this);
        this.physics.add.overlap(this.player.sprite, this.keysGroup, this.collectKey, undefined, this);
        this.physics.add.overlap(this.player.sprite, this.spidersGroup, this.collideDeath, undefined, this);
        this.physics.add.overlap(this.player.sprite, this.spikesGroup, this.collideDeath, undefined, this);
        this.physics.add.overlap(this.player.sprite, this.deadlyLayer);
        this.deadlyLayer.setTileIndexCallback([17, 18], this.collideDeathTile, this);

        this.physics.world.on('worldbounds', this.onWorldBounds, this);
    }

    private createMap() {
        this.map = this.add.tilemap(AssetNames.level + this.gameData.level.toString());
        var platformTiles = this.map.addTilesetImage(LocalAssets.tiles, AssetNames.tiles);
        this.platformLayer = this.map.createStaticLayer(LayerNames.platforms, platformTiles, MapX, MapY);
        this.platformLayer.setCollision([1,2,3,4,9,10]);

        var ladderLayer = this.map.createStaticLayer(LayerNames.ladders, platformTiles, MapX, MapY);
        this.laddersGroup = this.physics.add.staticGroup();
        ladderLayer.forEachTile((tile : Phaser.Tilemaps.Tile) => {
            if (tile.index === 12 && (tile.y === 0 || ladderLayer.getTileAt(tile.x, tile.y - 1, true).index !== 12)) {
                var bottomTile = tile;
                while (bottomTile.y < this.map.height - 1) {
                    var nextTile = ladderLayer.getTileAt(bottomTile.x, bottomTile.y + 1, true);
                    if (nextTile.index != 12) { break; }
                    bottomTile = nextTile;
                }

                var ladder = this.laddersGroup.create(tile.getLeft() + 4, (tile.getTop() + bottomTile.getBottom()) / 2, undefined) as Phaser.Physics.Arcade.Sprite;
                ladder.setVisible(false);
                ladder.body.setSize(2, bottomTile.getBottom() - tile.getTop());
            }
        });

        this.deadlyLayer = this.map.createDynamicLayer(LayerNames.deadly, platformTiles, MapX, MapY);
        this.spikesGroup = this.physics.add.group({ immovable: true, allowGravity: false });
        this.deadlyLayer.forEachTile(tile => {
            if (tile.index === 20) {
                var spikes = this.spikesGroup.create(tile.pixelX + MapX, tile.pixelY + MapY + 4, AssetNames.tiles, "spikes") as Phaser.Physics.Arcade.Sprite;
                spikes.setOrigin(0, 0);
                spikes.body.setSize(6, 4, true);
                tile.index = 0;
            }
        });
    }

    private createObjects() {
        this.gemsGroup = this.physics.add.group({ immovable: true, allowGravity: false });
        this.keysGroup = this.physics.add.group({ immovable: true, allowGravity: false });
        this.doorsGroup = this.physics.add.group({ immovable: true, allowGravity: false });
        this.spidersGroup = this.physics.add.group({ allowGravity: false });

        this.anims.create({
            key: Animations.gem,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'gem', start: 1, end: 4 }),
            frameRate: 5,
            repeat: -1
        });

        Spider.createAnimation(this, 'tiles');

        var objsLayer = this.map.getObjectLayer(LayerNames.objects);
        var generateGems = false;
        var gemsSet = this.gameData.remainingGems.get(this.gameData.level);
        if (!gemsSet) {
            gemsSet = new Set<number>();
            this.gameData.remainingGems.set(this.gameData.level, gemsSet);
            generateGems = true;
        }

        var gemIndex = 0;

        objsLayer.objects.forEach((obj) => {
            switch (obj.type) {
                case ObjTypes.gem:
                    if (generateGems) {
                        gemsSet!.add(gemIndex++);
                    } else if (!gemsSet!.has(gemIndex++)) {
                        break;
                    }

                    var gem = (this.gemsGroup.create(obj.x! + MapX, obj.y! + MapY, LocalAssets.tiles, 'gem1') as Phaser.Physics.Arcade.Sprite).setOrigin(0, 1);
                    gem.setData("index", gemIndex - 1);
                    gem.body.setSize(7, 7, false);
                    gem.anims.play(Animations.gem);
                    this.gemsGroup.add(gem);
                    break;
                case ObjTypes.key:
                    if (!this.gameData.openDoors.has(parseInt(obj.name.slice(-1)))) {
                        var key = (this.keysGroup.create(obj.x! + MapX, obj.y! + MapY, LocalAssets.tiles, obj.name) as Phaser.Physics.Arcade.Sprite).setOrigin(0, 1);
                        key.setData("unlocks", "door" + obj.name.slice(-1));
                    }
                    break;
                case ObjTypes.door:
                    if (!this.gameData.openDoors.has(parseInt(obj.name.slice(-1)))) {
                        var door = (this.doorsGroup.create(obj.x! + MapX, obj.y! + MapY, LocalAssets.tiles, obj.name) as Phaser.Physics.Arcade.Sprite).setOrigin(0, 0);
                        door.name = obj.name;
                    }
                    break;
                case ObjTypes.spider:
                    this.spiders.push(new Spider(this, obj, this.spidersGroup, MapX, MapY, LocalAssets.tiles));
                    break;
            }
        });
    }

    update() {
        this.player.update();

        if (--this.waterFrames === 0) {
            this.deadlyLayer.forEachTile(tile => {
                if (tile.index === 17) {
                    tile.index = 18;
                } else if (tile.index === 18) {
                    tile.index = 17;
                }
            });
            this.waterFrames = 10;
        }

        this.spiders.forEach(spider => { spider.update(); });
    }

    private collectGem(_player: Phaser.GameObjects.GameObject, gem: Phaser.GameObjects.GameObject) {
        if (!this.player.dead) {
            (gem as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
            this.gameData.remainingGems.get(this.gameData.level)!.delete(gem.getData('index') as number);
        }
    }

    private collectKey(_player: Phaser.GameObjects.GameObject, key: Phaser.GameObjects.GameObject) {
        if (!this.player.dead) {
            var sprite = key as Phaser.Physics.Arcade.Sprite;
            sprite.disableBody(true, true);
            var doorId = sprite.getData("unlocks") as string;
            var door = this.children.getByName(doorId) as Phaser.Physics.Arcade.Sprite;
            door.disableBody(true, true);
            this.gameData.openDoors.add(parseInt(doorId.slice(-1)));
        }
    }

    private collideDeath(_player: Phaser.GameObjects.GameObject, _enemy: Phaser.GameObjects.GameObject) {
        this.player.die(this.onDied, this);
    }

    private collideDeathTile(_player: Phaser.GameObjects.GameObject, _tile: Phaser.Tilemaps.Tile) {
        this.player.die(this.onDied, this);
    }

    private onDied() {
        this.scene.restart(this.gameData);
    }

    private onWorldBounds(body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) {
        if (body.gameObject.name === 'player') {
            if (up) {
                --this.gameData.level
                this.gameData.playerX = this.player.sprite.x;
                this.gameData.playerY = this.map.heightInPixels - this.player.sprite.width + MapY;
            } else if (down) {
                ++this.gameData.level;
                this.gameData.playerX = this.player.sprite.x;
                this.gameData.playerY = MapY;
            } else if (left) {
                this.gameData.level -= 10;
                this.gameData.playerX = this.map.widthInPixels - this.player.sprite.width + MapX;
                this.gameData.playerY = this.player.sprite.y;
            } else if (right) {
                this.gameData.level += 10;
                this.gameData.playerX = MapX;
                this.gameData.playerY = this.player.sprite.y;
            }

            console.log("Restart");
            this.scene.restart(this.gameData);
        }
    }
};
