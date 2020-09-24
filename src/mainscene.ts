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
    spider: 'spider',
    magicDoor: 'magicdoor'
};

const LocalAssets = {
    tiles: 'tiles'
};

const Animations = {
    gem: 'gem',
    spider: 'spider',
    magicDoor: 'magicdoor',
};

const MapX = 0;
const MapY = 8;

const RoomNames = new Map<number, string>([
    [11, "The Entrance"],
    [21, "The Cold Room"],
    [22, "The Basement"],
    [31, "The Final Challenge"]
]);

const StartLives = 5;

export class MainScene extends Phaser.Scene {
    private gameData!: GameData;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private roomNameText!: Phaser.GameObjects.BitmapText;
    private scoreText!: Phaser.GameObjects.BitmapText;
    private livesText!: Phaser.GameObjects.BitmapText;

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
    private score = 0;
    private lives = StartLives;

    constructor() {
        super(SceneNames.main);
    }

    init(data: GameData): void {
        this.gameData = data;
    }

    create(): void {
        this.score = 0;
        this.lives = StartLives;
        this.spiders.length = 0;
        this.add.bitmapText(0, 0, AssetNames.font, "Score:");
        this.add.bitmapText(192, 0, AssetNames.font, "Lives:");
        this.roomNameText = this.add.bitmapText(0, 184, AssetNames.font, "Loading");
        this.scoreText = this.add.bitmapText(56, 0, AssetNames.font, this.score.toString());
        this.livesText = this.add.bitmapText(248, 0, AssetNames.font, this.lives.toString());

        this.cursors = this.input.keyboard.createCursorKeys();

        this.createGroups();
        this.createLevel();

        this.physics.world.on('worldbounds', this.onWorldBounds, this);
    }

    private createGroups(): void {
        this.laddersGroup = this.physics.add.staticGroup();
        this.spikesGroup = this.physics.add.group({ immovable: true, allowGravity: false });
        this.gemsGroup = this.physics.add.group({ immovable: true, allowGravity: false });
        this.keysGroup = this.physics.add.group({ immovable: true, allowGravity: false });
        this.doorsGroup = this.physics.add.group({ immovable: true, allowGravity: false });
        this.spidersGroup = this.physics.add.group({ allowGravity: false });

        Spider.createAnimation(this, AssetNames.tiles);
        Player.createAnimations(this, AssetNames.tiles);

        this.anims.create({
            key: Animations.gem,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'gem', start: 1, end: 4 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: Animations.magicDoor,
            frames: this.anims.generateFrameNames(LocalAssets.tiles, { prefix: 'door', start: 1, end: 4 }),
            frameRate: 2,
            repeat: -1
        })
    }

    private createLevel(): void {
        this.createMap();
        this.createObjects();

        this.player = new Player(this, this.gameData.startX, this.gameData.startY, AssetNames.tiles, this.platformLayer, this.laddersGroup, this.cursors);

        this.physics.add.collider(this.player.sprite, this.doorsGroup);
        this.physics.add.overlap(this.player.sprite, this.gemsGroup, this.collectGem, undefined, this);
        this.physics.add.overlap(this.player.sprite, this.keysGroup, this.collectKey, undefined, this);
        this.physics.add.overlap(this.player.sprite, this.spidersGroup, this.die.bind(this), undefined, this);
        this.physics.add.overlap(this.player.sprite, this.spikesGroup, this.die.bind(this), undefined, this);
        this.physics.add.overlap(this.player.sprite, this.deadlyLayer);
        this.deadlyLayer.setTileIndexCallback([17, 18], this.die.bind(this), this);

        if (this.gameData.onLadder) {
            const ladder = this.player.getLadder();
            if (ladder) {
                this.player.setOnLadder(ladder);
            } else {
                console.log("No ladder found at transition location");
            }
        }

        const roomName = RoomNames.get(this.gameData.level) ?? "Error";
        this.roomNameText.setX(128 - roomName.length*4);
        this.roomNameText.setText(roomName);
        this.livesText.setText(this.lives.toString());
    }

    private createMap(): void {
        this.map = this.add.tilemap(AssetNames.level + this.gameData.level.toString());
        this.physics.world.setBounds(MapX, MapY, this.map.widthInPixels, this.map.heightInPixels);
        const platformTiles = this.map.addTilesetImage(LocalAssets.tiles, AssetNames.tiles);
        this.platformLayer = this.map.createStaticLayer(LayerNames.platforms, platformTiles, MapX, MapY);
        this.platformLayer.setCollision([1,2,3,4,9,10]);

        const ladderLayer = this.map.createStaticLayer(LayerNames.ladders, platformTiles, MapX, MapY);

        ladderLayer.forEachTile((tile : Phaser.Tilemaps.Tile) => {
            if (tile.index === 12 && (tile.y === 0 || ladderLayer.getTileAt(tile.x, tile.y - 1, true).index !== 12)) {
                let bottomTile = tile;
                while (bottomTile.y < this.map.height - 1) {
                    const nextTile = ladderLayer.getTileAt(bottomTile.x, bottomTile.y + 1, true);
                    if (nextTile.index != 12) { break; }
                    bottomTile = nextTile;
                }

                const ladder = this.laddersGroup.create(tile.getLeft() + 4, (tile.getTop() + bottomTile.getBottom()) / 2, undefined) as Phaser.Physics.Arcade.Sprite;
                ladder.setVisible(false);
                ladder.body.setSize(2, bottomTile.getBottom() - tile.getTop());
            }
        });

        this.deadlyLayer = this.map.createDynamicLayer(LayerNames.deadly, platformTiles, MapX, MapY);
        this.deadlyLayer.forEachTile(tile => {
            if (tile.index === 20) {
                const spikes = this.spikesGroup.create(tile.pixelX + MapX, tile.pixelY + MapY + 4, AssetNames.tiles, "spikes") as Phaser.Physics.Arcade.Sprite;
                spikes.setOrigin(0, 0);
                spikes.body.setSize(6, 4, true);
                tile.index = 0;
            }
        });
    }

    private getOrCreateRemainingGems(): [Set<number>, boolean] {
        let gemsSet = this.gameData.remainingGems.get(this.gameData.level);
        if (gemsSet) {
            return [gemsSet, false];
        }

        gemsSet = new Set<number>();
        this.gameData.remainingGems.set(this.gameData.level, gemsSet);
        return [gemsSet, true];
    }

    private createObjects(): void {
        const objsLayer = this.map.getObjectLayer(LayerNames.objects);
        const [gemsSet, generateGems] = this.getOrCreateRemainingGems();

        let gemIndex = 0;

        objsLayer.objects.forEach((obj) => {
            const objX = obj.x ?? 0;
            const objY = obj.y ?? 0;
            switch (obj.type) {
                case ObjTypes.gem:
                    if (generateGems) {
                        gemsSet.add(gemIndex++);
                    } else if (!gemsSet.has(gemIndex++)) {
                        break;
                    }

                    (this.gemsGroup.create(objX + MapX, objY + MapY, LocalAssets.tiles, 'gem1') as Phaser.Physics.Arcade.Sprite)
                        .setOrigin(0, 1)
                        .setData("index", gemIndex - 1)
                        .setBodySize(7, 7, false)
                        .play(Animations.gem);
                    break;
                case ObjTypes.key:
                    if (!this.gameData.openDoors.has(parseInt(obj.name.slice(-1)))) {
                        (this.keysGroup.create(objX + MapX, objY + MapY, LocalAssets.tiles, obj.name) as Phaser.Physics.Arcade.Sprite)
                            .setOrigin(0, 1)
                            .setData("unlocks", "door" + obj.name.slice(-1));
                    }
                    break;
                case ObjTypes.door:
                    if (!this.gameData.openDoors.has(parseInt(obj.name.slice(-1)))) {
                        (this.doorsGroup.create(objX + MapX, objY + MapY, LocalAssets.tiles, obj.name) as Phaser.Physics.Arcade.Sprite)
                            .setOrigin(0, 0)
                            .setName(obj.name);
                    }
                    break;
                case ObjTypes.spider:
                    this.spiders.push(new Spider(this, obj, this.spidersGroup, MapX, MapY, LocalAssets.tiles));
                    break;
                case ObjTypes.magicDoor:
                    if (!this.hasAllGems()) {
                        (this.doorsGroup.create(objX + MapX, objY + MapY, LocalAssets.tiles, "door1") as Phaser.Physics.Arcade.Sprite)
                            .setOrigin(0, 0)
                            .setName(obj.name)
                            .play(Animations.magicDoor);
                    }
                    break;
            }
        });
    }

    private transition(): void {
        this.map.destroy();
        this.player.destroy();
        this.gemsGroup.clear(true, true);
        this.keysGroup.clear(true, true);
        this.doorsGroup.clear(true, true);
        this.spidersGroup.clear(true, true);
        this.spikesGroup.clear(true, true);
        this.laddersGroup.clear(true, true);
        this.spiders.length = 0;
        this.createLevel();
    }

    update(): void {
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

    private collectGem(_player: Phaser.GameObjects.GameObject, gem: Phaser.GameObjects.GameObject): void {
        if (!this.player.dead) {
            this.gameData.remainingGems.get(this.gameData.level)?.delete(gem.getData('index') as number);
            if (this.hasAllGems()) {
                const door = this.children.getByName('magicdoor') as (Phaser.Physics.Arcade.Sprite | null);
                if (door) {
                    door.destroy();
                }
            }
            gem.destroy();
            this.addScore(20);
            this.sound.play(AssetNames.gemSound);
        }
    }

    private collectKey(_player: Phaser.GameObjects.GameObject, key: Phaser.GameObjects.GameObject): void {
        if (!this.player.dead) {
            const sprite = key as Phaser.Physics.Arcade.Sprite;
            const doorId = sprite.getData("unlocks") as string;
            const door = this.children.getByName(doorId) as (Phaser.Physics.Arcade.Sprite | null);
            if (door) {
                door.destroy();
            }
            sprite.destroy();
            this.gameData.openDoors.add(parseInt(doorId.slice(-1)));
            this.addScore(50);
            this.sound.play(AssetNames.keySound);
        }
    }

    private die() : void {
        if (!this.player.dead) {
            this.player.die(this.onDied.bind(this));
            --this.lives;
            this.sound.play(AssetNames.dieSound);
        }
    }

    private onDied(): void {
        if (this.lives < 0) {
            this.scene.start(SceneNames.gameOver, { finalScore: this.score });
        } else {
            this.transition();
        }
    }

    private onWorldBounds(body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean): void {
        if (body.gameObject.name === 'player') {
            if (up) {
                --this.gameData.level
                this.gameData.startX = this.player.sprite.x;
                this.gameData.startY = this.map.heightInPixels - this.player.sprite.height + MapY - 1;
            } else if (down) {
                ++this.gameData.level;
                this.gameData.startX = this.player.sprite.x;
                this.gameData.startY = MapY + 1;
            } else if (left) {
                this.gameData.level -= 10;
                this.gameData.startX = this.map.widthInPixels - this.player.sprite.width + MapX - 1;
                this.gameData.startY = this.player.sprite.y;
            } else if (right) {
                this.gameData.level += 10;
                this.gameData.startX = MapX + 1;
                this.gameData.startY = this.player.sprite.y;
            }

            if (this.gameData.level >= 40) {
                this.scene.start(SceneNames.win, { finalScore: this.score });
            } else {
                this.gameData.onLadder = this.player.onLadder;
                this.transition();
            }
        }
    }

    private addScore(points: number): void {
        this.score += points;
        this.scoreText.setText(this.score.toString());
    }

    private hasAllGems(): boolean {
        if (this.gameData.remainingGems.size !== 4) { return false; }

        const valuesIterator = this.gameData.remainingGems.values();
        for (;;) {
            const result = valuesIterator.next();
            if (result.done) { return true; }
            if (result.value.size > 0) { return false; }
        }
    }
}
