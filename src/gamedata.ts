export interface GameData {
    playerX: number;
    playerY: number;
    level: number;
    openDoors: Set<number>;
    remainingGems: Map<number, Set<number>>;
}
