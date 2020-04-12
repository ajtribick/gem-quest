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
    font: 'font'
};

export const Levels = [
    ['level11', require('./assets/map11.json')],
    ['level21', require('./assets/map21.json')],
    ['level22', require('./assets/map22.json')],
    ['level31', require('./assets/map31.json')]
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
