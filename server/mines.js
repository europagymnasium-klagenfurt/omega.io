// minen am server (nur daten, kein socket-code): ablegen, ablaufen lassen, auslösen prüfen

import { MINE } from "../public/src/config.js";

const mines = {};
const expireTimers = {};
const lastPlaced = {};   // spieler-id -> zeitpunkt der letzten mine
let nextId = 1;

// legt eine mine hinter das auto des spielers. gibt null zurück, wenn es nicht erlaubt ist.
// onExpire wird aufgerufen, wenn die mine von selbst verschwindet.
export function tryPlaceMine(player, now, onExpire) {
    if (player.health <= 0) return null;
    if (lastPlaced[player.id] !== undefined && now - lastPlaced[player.id] < MINE.cooldown) return null;

    lastPlaced[player.id] = now;
    const forward = (player.angle - 90) * Math.PI / 180;   // das auto-bild zeigt nach oben
    const mine = {
        id: nextId++,
        ownerId: player.id,
        x: player.x - Math.cos(forward) * MINE.dropOffset,
        y: player.y - Math.sin(forward) * MINE.dropOffset,
    };
    mines[mine.id] = mine;
    expireTimers[mine.id] = setTimeout(() => {
        removeMine(mine.id);
        onExpire(mine);
    }, MINE.lifetime);
    return mine;
}

export function removeMine(id) {
    clearTimeout(expireTimers[id]);
    delete expireTimers[id];
    delete mines[id];
}

// erste fremde mine, auf die der spieler gerade fährt (die eigene löst nicht aus)
export function findTriggeredMine(player) {
    if (player.health <= 0) return null;
    return Object.values(mines).find((mine) =>
        mine.ownerId !== player.id
        && Math.hypot(player.x - mine.x, player.y - mine.y) <= MINE.triggerRadius) ?? null;
}

// wie viele millisekunden der spieler noch warten muss, bis er wieder eine mine legen darf
export function getCooldownLeft(id, now) {
    if (lastPlaced[id] === undefined) return 0;
    return Math.max(0, MINE.cooldown - (now - lastPlaced[id]));
}

export function getAllMines() {
    return mines;
}

export function forgetPlayer(id) {
    delete lastPlaced[id];
}
