// alle einstellungen des spiels an einer stelle

export const VIEW_WIDTH = 1200;
export const VIEW_HEIGHT = 800;
export const WORLD_WIDTH = VIEW_WIDTH * 2;
export const WORLD_HEIGHT = VIEW_HEIGHT * 2;

export const DEBUG = true;   // zeigt die hitboxen an

export const CAR = {
    rotationSpeed: 150,   // grad pro sekunde
    speed: 600,           // pixel pro sekunde
    friction: 0.97,       // geschwindigkeit wird pro frame damit multipliziert, wenn kein gas
    scale: 0.5,
    hitbox: { radius: 50, offsetX: 14, offsetY: 65 },
};

export const COLLISION_MESSAGE = {
    fontSize: 112,
    popScale: 1.25,
    fadeDelay: 500,
    fadeDuration: 450,
};

export const HEALTH_BAR = {
    points: 5,
    heartSize: 20,
    heartSpacing: 20,
    offset: 18,
};

export const PLAYER_HUD = {
    width: 240,
    margin: 16,
    padding: 12,
    titleHeight: 24,
    rowHeight: 22,
    fontSize: 14,
};
