// alle einstellungen des spiels an einer stelle

export const VIEW_WIDTH = 1200;
export const VIEW_HEIGHT = 800;
export const WORLD_WIDTH = VIEW_WIDTH * 2;
export const WORLD_HEIGHT = VIEW_HEIGHT * 2;

const HEALTH_BAR_POINTS = 5;   // normale lebenspunkte (HEALTH_BAR.points)

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

export const OBSTACLES = {
    seed: 482731,
    count: 20,
    attemptsPerObstacle: 80,
    edgeMargin: 140,
    spacing: 80,
    spawn: { x: 400, y: 300, spacing: 100, count: 8, safeRadius: 150 },
    boostSafeRadius: 180,
    types: [
        { key: "obstacle-tire", asset: "tires.png", width: 142, height: 142, bodyWidth: 132, bodyHeight: 132, weight: 5 },
        { key: "obstacle-rubble", asset: "house.png", width: 150, height: 150, bodyWidth: 140, bodyHeight: 140, weight: 4 },
        { key: "obstacle-wreck", asset: "brokencar.png", width: 132, height: 132, bodyWidth: 66, bodyHeight: 124, weight: 3 },
        { key: "obstacle-wall", asset: "wall.png", width: 260, height: 108, bodyWidth: 250, bodyHeight: 60, weight: 2 },
        { key: "obstacle-wall-top", asset: "wall from above.png", width: 260, height: 108, bodyWidth: 250, bodyHeight: 60, weight: 2 },
    ],
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

// werte pro fahrzeug (issue #18). fahrzeuge ohne eintrag haben "default".
//   speed:    faktor auf CAR.speed
//   health:   maximale lebenspunkte (der lebensbalken zeigt health / max)
//   damage:   faktor auf MACHINE_GUN.damage (schaden an anderen autos)
//   fireRate: faktor auf MACHINE_GUN.fireRate (kleiner = schießt schneller)
const SPORT = { speed: 1.3, health: 3, damage: 0.6, fireRate: 0.6 };      // schnell, schwach, schießt schnell
const MONSTER = { speed: 0.7, health: 8, damage: 1.6, fireRate: 2.2 };   // langsam, zäh, viel schaden, schießt deutlich langsamer
export const VEHICLE_STATS = {
    default: { speed: 1, health: HEALTH_BAR_POINTS, damage: 1, fireRate: 1 },
    "sport-formula": SPORT,
    "sport-hyundai": SPORT,
    "sport-blue": SPORT,
    "monster-croc": MONSTER,
    "monster-shark": MONSTER,
    "monster-face": MONSTER,
    "fictional-delorean": { speed: 1.3, health: HEALTH_BAR_POINTS, damage: 1, fireRate: 1 },    // schnell, sonst normal
    "fictional-gtr": { speed: 1.3, health: HEALTH_BAR_POINTS, damage: 1.3, fireRate: 1 },       // schnell, guter schaden
    "fictional-kart": { speed: 1.15, health: 6, damage: 1.2, fireRate: 0.85 },                  // kann alles gut
};

export function getVehicleStats(vehicleKey) {
    return VEHICLE_STATS[vehicleKey] ?? VEHICLE_STATS.default;
}

// minen: mit STRG legt man hinter dem auto eine mine ab (der server rechnet alles)
export const MINE = {
    cooldown: 20000,          // millisekunden, bis man die nächste mine legen darf
    lifetime: 10000,          // millisekunden, dann verschwindet die mine von selbst
    dropOffset: 90,           // abstand hinter dem auto, wo die mine liegt
    triggerRadius: 45,        // so nah muss ein anderes auto kommen, damit sie explodiert
    damage: 2,                // lebenspunkte, die eine explosion kostet
    size: 40,                 // durchmesser der mine
    explosionScale: 3,        // so groß wird die explosion (mal size)
    explosionDuration: 350,
};

// browser-tastenkombinationen mit STRG, die im spiel gesperrt werden (z.b. STRG+S, STRG+P, STRG+D)
export const BROWSER_SHORTCUTS = {
    allowedKeys: ["r", "i", "j", "c"],   // bleiben erlaubt: neu laden (STRG+R) und entwicklertools (STRG+SHIFT+I/J/C)
    confirmLeave: true,                  // fragt vor dem schließen/verlassen der seite nach (schützt vor STRG+W)
};

// anzeige für den minen-cooldown (unten links)
export const MINE_HUD = {
    x: 16,
    width: 200,
    height: 44,
    bottomMargin: 16,
    barHeight: 8,
    padding: 10,
    fontSize: 14,
    readyColor: 0x33dd33,
    cooldownColor: 0xff9900,
};

export const HEALTH_BAR = {
    points: HEALTH_BAR_POINTS, // lebenspunkte eines normalen autos
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
    width: 260,
    margin: 16,
    padding: 12,
    baseHeight: 150,
    listTitleY: 118,
    listStartY: 148,
    rowHeight: 22,
    gaugeWidth: 180,
    gaugeY: 100,
    gaugeBackgroundHeight: 10,
    gaugeFillHeight: 8,
    speedValueY: 42,
    speedUnitY: 78,
    garageButtonWidth: 92,
    garageButtonHeight: 22,
    garageButtonY: 129,
    garageButtonFontSize: 10,
    maxSpeedKmh: 260,
    fpsRefreshInterval: 500,
    valueFontSize: 38,
    smallFontSize: 12,
    fontSize: 14,
};

export const PLAYER_NAME = {
    maxLength: 18,
    storageKey: "omegaPlayerName",
    fieldX: 165,
    fieldY: 70,
    fieldWidth: 260,
    fieldHeight: 38,
    labelY: 39,
    fontSize: 14,
};
