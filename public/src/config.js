// alle einstellungen des spiels an einer stelle

export const VIEW_WIDTH = 1200;
export const VIEW_HEIGHT = 800;
export const WORLD_WIDTH = VIEW_WIDTH * 2;
export const WORLD_HEIGHT = VIEW_HEIGHT * 2;

export const DEBUG = true;   // zeigt die hitboxen an

export const CAR = {
    rotationSpeed: 150,   // grad pro sekunde
    turnBoostMultiplier: 2, // wenn SHIFT gedrückt ist, wird die drehung vervielfacht
    speed: 600,           // pixel pro sekunde
    shiftSpeedMultiplier: 0.7, // mit SHIFT: 30% langsamer
    glide: 0.965,         // normale gleitdistanz leicht erhöht
    glideShift: 0.97,     // mit SHIFT: gleitdistanz noch länger, aber nicht mehr so extrem
    scale: 0.5,
    hitbox: { radius: 50, offsetX: 14, offsetY: 65 },
};
