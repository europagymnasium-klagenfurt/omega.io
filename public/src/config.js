// alle einstellungen des spiels an einer stelle

export const VIEW_WIDTH = 1200;
export const VIEW_HEIGHT = 800;
export const WORLD_SIZE_FACTOR = 3;   // wie viele bildschirme breit/hoch die welt ist
export const WORLD_WIDTH = VIEW_WIDTH * WORLD_SIZE_FACTOR;
export const WORLD_HEIGHT = VIEW_HEIGHT * WORLD_SIZE_FACTOR;

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
    count: 40,              // so viele hindernisse (höchstens gridColumns * gridRows)
    gridColumns: 8,         // die welt wird in felder geteilt, pro feld höchstens ein hindernis
    gridRows: 6,
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

// garagen in der welt: einfahren = fahrzeug wechseln (leben bleiben gleich)
export const GARAGES = {
    width: 240,
    height: 170,
    wallThickness: 28,       // hitbox oben und unten: so wird die garage zum tunnel (seitlich offen)
    enterRatio: 0.55,        // so weit muss das auto drin sein (anteil der garagengröße)
    maxStay: 10000,          // ms: so lange darf man höchstens in der garage bleiben
    cooldown: 60000,         // ms: so lange sind die garagen danach gesperrt
    enterDelay: 250,         // ms überblendung, bevor das menü kommt
    safeMargin: 120,         // abstand zu hindernissen
    labelFontSize: 26,
    labelColor: "#ffd27a",   // neon-schrift
    labelGlow: 0xff9a2e,
    labelGap: 26,            // abstand des schilds über dem dach
    doorWidth: 170,
    doorHeight: 18,
    list: [
        { name: "GARAGE NORD", x: 1900, y: 330 },
        { name: "GARAGE NORDOST", x: 3250, y: 420 },
        { name: "GARAGE WEST", x: 340, y: 1200 },
        { name: "GARAGE SÜDWEST", x: 1000, y: 2050 },
        { name: "GARAGE SÜDOST", x: 2800, y: 2000 },
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

export const MINIMAP = {
    width: 270,                 // breite der karte (höhe folgt dem seitenverhältnis der welt)
    margin: 16,                 // abstand zum rechten und unteren bildrand
    toggleKey: "M",             // taste zum ein- und ausblenden
    depth: 100,
    cornerRadius: 10,
    backgroundColor: 0x0b1118,
    backgroundAlpha: 0.82,
    borderColor: 0x4ec9f5,
    gridColor: 0x4ec9f5,
    gridAlpha: 0.12,
    gridLines: 6,               // linien pro achse
    obstacleColor: 0x7f8c9b,
    obstacleAlpha: 0.9,
    viewColor: 0xffffff,        // rahmen, der den sichtbaren ausschnitt zeigt
    viewAlpha: 0.35,
    boostColor: 0xffd166,
    boostRadius: 5,
    remoteDotRadius: 3.5,
    ownArrowSize: 7,
    ownColor: 0xffffff,
    pulseSpeed: 260,            // millisekunden pro puls-schwingung
    pulseRadius: 6,             // wie weit der ring um das eigene auto wächst
    titleFontSize: 10,
};

export const SCOREBOARD = {
    key: "TAB",                // gedrückt halten zeigt die rangliste
    width: 460,
    padding: 18,
    titleHeight: 44,
    rowHeight: 28,
    fontSize: 18,
    depth: 200,
    backgroundColor: 0x101820,
    backgroundAlpha: 0.92,
    borderColor: 0x4ec9f5,
};

export const KILLFEED = {
    x: 16,
    y: 44,                 // unter der ping-anzeige
    maxLines: 5,
    lineHeight: 26,
    showTime: 5000,        // so lange bleibt eine zeile stehen (ms)
    fadeTime: 600,
    fontSize: 16,
    depth: 150,
    backgroundColor: 0x101820,
    backgroundAlpha: 0.75,
    padding: 6,
};

export const RESPAWN = {
    delay: 3000,            // so lange (ms) bleibt ein zerstörtes auto weg, bis es neu startet
    messageFontSize: 44,
    messageY: VIEW_HEIGHT / 3,
    depth: 300,
};
