// alle einstellungen des spiels an einer stelle

export const VIEW_WIDTH = 1200;
export const VIEW_HEIGHT = 800;
export const WORLD_WIDTH = VIEW_WIDTH * 2;
export const WORLD_HEIGHT = VIEW_HEIGHT * 2;

export const DEBUG = false;  // zeigt die hitboxen an

export const CAR = {
    rotationSpeed: 150,   // grad pro sekunde
    turnBoostMultiplier: 2, // wenn SHIFT gedrückt ist, wird die drehung vervielfacht
    speed: 600,           // pixel pro sekunde
    shiftSpeedMultiplier: 0.7, // mit SHIFT: 30% langsamer
    glide: 0.965,         // normale gleitdistanz leicht erhöht
    glideShift: 0.97,     // mit SHIFT: gleitdistanz noch länger, aber nicht mehr so extrem
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

// tastenbelegung zum fahren (namen wie in Phaser.Input.Keyboard.KeyCodes)
export const CONTROLS = {
    up: "W",
    left: "A",
    down: "S",
    right: "D",
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

export const MACHINE_GUN = {
    fireRate: 80,         // millisekunden zwischen zwei schüssen
    bulletSpeed: 700,     // pixel pro sekunde, kommt zur geschwindigkeit des autos dazu
    range: 250,           // so weit fliegt ein schuss (vom auto aus gesehen), dann verschwindet er
    bulletSize: 6,        // durchmesser eines punktes
    bulletColor: 0xffee66,
    muzzleOffset: 10,     // abstand vor der autonase, wo der schuss startet
    damage: 0.1,          // so viele lebenspunkte kostet ein treffer (bei armor 1)
    hitTolerance: 150,    // server: treffer gilt nur, wenn ziel höchstens range + das entfernt ist
};

// panzerung pro fahrzeug: abgezogen wird damage / armor.
// armor 2 = halber schaden = hält doppelt so viel aus. fahrzeuge ohne eintrag haben "default".
export const ARMOR = {
    default: 1,
    "monster-croc": 2,
    "monster-shark": 2,
    "monster-face": 2,
};

export const HEALTH_BAR = {
    points: 5,                // maximale lebenspunkte
    width: 70,                // balken bei voller gesundheit
    height: 8,
    border: 1,                // dunkler rand um den balken
    offset: 14,               // abstand über dem auto
    backgroundColor: 0x222222,
    colorFull: 0x33dd33,      // grün
    colorHalf: 0xff9900,      // orange
    colorEmpty: 0xff2222,     // rot
};

export const PLAYER_HUD = {
    width: 240,
    margin: 16,
    padding: 12,
    titleHeight: 24,
    rowHeight: 22,
    fontSize: 14,
};
