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

export const SPEED_BOOST = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    size: 120,
    pickupRadius: 125,
    multiplier: 2,
    duration: 3000,
    respawnDelay: 30000,
    retryDelay: 250,
    smokeTextureSize: 64,
    smokeCount: 16,
    smokeLifespan: 2000,
    smokeSpeed: { min: 35, max: 120 },
    smokeScale: { start: 0.2, end: 1.1 },
    smokeAlpha: { start: 0.7, end: 0 },
    messageDuration: 2000,
    messageFontSize: "56px",
    messageY: VIEW_HEIGHT / 4,
};
