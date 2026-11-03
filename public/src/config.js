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
    referenceSize: 235,   // längste seite des bisherigen autos
    hitbox: { widthRatio: 0.78 },
};

export const SPAWN_INTRO = {
    duration: 2800,
    fadeDuration: 1000,
    smokeLifespan: 1800,
    smokeFrequency: 60,
    smokeFadeFrequency: 300,
    smokeQuantity: 3,
    rotation: 1080,
    vehicleSpeed: 150,
    driftSpeed: 120,
};

export const EXHAUST_SMOKE = {
    frequency: 90,
    quantity: 2,
    lifespan: 1200,
    speed: 45,
    scale: { start: 0.16, end: 0.8 },
    alpha: { start: 0.65, end: 0 },
    rearOffset: 64,
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
