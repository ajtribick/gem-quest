export interface GameData {
    startX: number;
    startY: number;
    onLadder: boolean;
    level: number;
    openDoors: Set<number>;
    remainingGems: Map<number, Set<number>>;
}

export const SceneNames = {
    main: "main"
};

export const AssetNames = {
    level: 'level',
    tiles: 'tiles'
};

export const Levels = [
    ['level11', require('./assets/map11.json')],
    ['level21', require('./assets/map21.json')],
    ['level22', require('./assets/map22.json')],
    ['level31', require('./assets/map31.json')]
];
