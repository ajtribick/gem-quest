const jsons = {
    map11: require('url:./assets/map11.json'),
    map21: require('url:./assets/map21.json'),
    map22: require('url:./assets/map22.json'),
    map31: require('url:./assets/map31.json')
};

export interface GameData {
    startX: number;
    startY: number;
    onLadder: boolean;
    level: number;
    openDoors: Set<number>;
    remainingGems: Map<number, Set<number>>;
}

export interface GameSummary {
    finalScore: number;
}

export const SceneNames = {
    menu: 'menu',
    main: 'main',
    gameOver: 'gameOver',
    win: 'win'
};

export const AssetNames = {
    level: 'level',
    tiles: 'tiles',
    font: 'font',
    gemSound: 'gem',
    keySound: 'key',
    dieSound: 'die',
    jumpSound: 'jump',
    landSound: 'land',
    winSound: 'win'
};

export const Levels = [
    ['level11', jsons.map11],
    ['level21', jsons.map21],
    ['level22', jsons.map22],
    ['level31', jsons.map31]
];

export function createStartData(): GameData {
    return {
        startX: 16,
        startY: 160,
        onLadder: false,
        level: 11,
        openDoors: new Set<number>(),
        remainingGems: new Map<number, Set<number>>()
    };
}

export const FlashColors = [
    0xff0000,
    0x00ff00,
    0xffff00,
    0x0000ff,
    0xff00ff,
    0x00ffff,
    0xffffff
];
