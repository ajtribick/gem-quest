import 'phaser';

const SceneNames = {
    main: "main"
};

class LoadScene extends Phaser.Scene {
    constructor() {
        super('myScene');
    }

    preload() {
        this.load.atlas('tiles', require('./assets/tiles.png'), require('./assets/atlas.json'));
        this.load.tilemapTiledJSON('level1', require('./assets/map.json'));
    }

    create() {
        this.scene.start(SceneNames.main);
    }
};

class MainScene extends Phaser.Scene {
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
        this.map = this.add.tilemap('level1');
        var platformTiles = this.map.addTilesetImage('tiles', 'tiles');
        this.map.createStaticLayer('Platforms', platformTiles, 0, 8);
        this.map.createStaticLayer('Ladders', platformTiles, 0, 8);
        this.map.createStaticLayer('Deadly', platformTiles, 0, 8);
        this.waterLayer = this.map.createDynamicLayer('Water', platformTiles, 0, 8);
    }

    private createObjects() {
        this.gemsGroup = this.add.group();

        this.anims.create({
            key: 'gem',
            frames: this.anims.generateFrameNames('tiles', { prefix: 'gem', start: 1, end: 4 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'playerR',
            frames: this.anims.generateFrameNames('tiles', { prefix: 'playerR', frames: [1, 2, 3, 2] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'playerL',
            frames: this.anims.generateFrameNames('tiles', { prefix: 'playerL', frames: [1, 2, 3, 2] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'playerUD',
            frames: this.anims.generateFrameNames('tiles', { prefix: 'playerUD', start: 1, end: 2 }),
            frameRate: 5,
            repeat: -1
        });

        var objsLayer = this.map.getObjectLayer('Objects');
        objsLayer.objects.forEach((obj) => {
            switch (obj.type) {
                case 'gem':
                    var gem = (this.gemsGroup.create(obj.x!, obj.y! + 8, 'tiles', 'gem1') as Phaser.GameObjects.Sprite).setOrigin(0, 1);
                    gem.anims.play('gem');
                    this.gemsGroup.add(gem);
                    break;
                case 'key':
                    this.add.sprite(obj.x!, obj.y! + 8, 'tiles', obj.name).setOrigin(0, 1);
                    break;
                case 'door':
                    this.add.sprite(obj.x!, obj.y! + 8, 'tiles', obj.name).setOrigin(0, 0);
                    break;
                case 'player':
                    if (!this.player) {
                        this.player = this.add.sprite(obj.x!, obj.y! + 8, 'tiles', 'playerR1').setOrigin(0, 0);
                        this.player.anims.play('playerR');
                    } else {
                        console.log("Attempted to add player twice");
                    }
                    break;
            }
        });
    }

    private createSpiders() {
        this.anims.create({
            key: 'spider',
            frames: this.anims.generateFrameNames('tiles', { prefix: 'spider', start: 1, end: 2 }),
            frameRate: 5,
            repeat: -1
        });

        this.spidersGroup = this.add.group();
        var spiderLayer = this.map.getObjectLayer('Spiders');
        spiderLayer.objects.forEach((obj) => {
            var path = new Phaser.Curves.Path();
            obj.polygon?.forEach((coords, index) => {
                if (index === 0) {
                    path.moveTo(coords.x! + obj.x!, coords.y! + obj.y! + 8);
                } else {
                    path.lineTo(coords.x! + obj.x!, coords.y! + obj.y! + 8);
                }
            });

            var spider = this.spidersGroup.create(obj.x!, obj.y! + 8, 'tiles', 'spider1').setOrigin(0.5, 0.5);
            spider.setData('vector', new Phaser.Math.Vector2());
            spider.setData('path', path);
            spider.anims.play('spider');
            this.tweens.add({
                targets: spider,
                z: 1,
                ease: 'Linear',
                duration: path.getLength() * 24,
                repeat: -1,
                delay: 0
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
            var vec = spider.getData('vector') as Phaser.Math.Vector2;
            var path = spider.getData('path') as Phaser.Curves.Path;

            path.getPoint(t, vec);
            spider.setPosition(vec.x, vec.y);
        });
    }
};

const config: Phaser.Types.Core.GameConfig = {
    scene: [LoadScene, MainScene],
    scale: {
        width: 256,
        height: 192,
        parent: 'game-host',
        mode: Phaser.Scale.NONE,
        zoom: Phaser.Scale.MAX_ZOOM
    },
    physics: {
        default: 'arcade'
    }
};

const game = new Phaser.Game(config);
