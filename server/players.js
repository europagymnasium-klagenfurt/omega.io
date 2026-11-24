// verwaltet alle spieler am server (nur daten, kein socket-code)

import { DEFAULT_VEHICLE_KEY, getVehicle } from "../shared/vehicles.js";
import { HEALTH_BAR, ARMOR, PLAYER_NAME, OBSTACLES } from "../public/src/config.js";

const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

const players = {};

export function addPlayer(id, requestedName) {
    const n = Object.keys(players).length;   // anzahl der spieler
    const name = typeof requestedName === "string"
        ? requestedName.trim().replace(/\s+/g, " ").slice(0, PLAYER_NAME.maxLength)
        : "";
    const usedColors = new Set(Object.values(players).map((player) => player.color));
    let color = COLORS.find((candidate) => !usedColors.has(candidate));

    if (color === undefined) {
        do {
            color = Math.floor(Math.random() * 0x1000000);
        } while (usedColors.has(color));
    }

    players[id] = {
        id: id,
        name: name || `Spieler ${n + 1}`,
        x: 400 + n * 100,
        y: 300,
        angle: 0,
        vehicleKey: DEFAULT_VEHICLE_KEY,
        color: color,
        health: HEALTH_BAR.points,
        armor: ARMOR.default,
        kills: 0,
        deaths: 0,
        damageDealt: 0,   // schaden, den der spieler anderen zugefügt hat
        damageTaken: 0,   // schaden, den der spieler bekommen hat
    };
    return players[id];
}

// lebenspunkte abziehen, die panzerung verringert den schaden (damage / armor).
// auf 3 kommastellen runden, sonst wird aus 5 - 0.1 - 0.1 ... z.b. 4.199999
// attackerId (optional): dem angreifer wird der tatsächlich verlorene schaden gutgeschrieben.
export function damagePlayer(id, damage, attackerId = null) {
    const player = players[id];
    if (!player) return null;

    const health = Math.max(0, Math.round((player.health - damage / player.armor) * 1000) / 1000);
    const lost = Math.round((player.health - health) * 1000) / 1000;   // nie mehr als noch da war
    player.health = health;
    player.damageTaken = Math.round((player.damageTaken + lost) * 1000) / 1000;

    const attacker = players[attackerId];
    if (attacker && attacker !== player) {
        attacker.damageDealt = Math.round((attacker.damageDealt + lost) * 1000) / 1000;
    }
    return player;
}

// tod ohne schützen (z.b. zusammenstoß): nur das opfer bekommt einen tod
export function recordDeath(id) {
    const player = players[id];
    if (!player) return null;

    player.deaths += 1;
    return player;
}

// abschuss verbuchen: der schütze bekommt einen kill, das opfer einen tod
export function recordKill(killerId, victimId) {
    const killer = players[killerId];
    const victim = players[victimId];
    if (!killer || !victim) return null;

    killer.kills += 1;
    victim.deaths += 1;
    return { killer, victim };
}

// zerstörtes auto neu starten: volle lebenspunkte, zufälliger startplatz aus der freien startreihe
// (dort stehen garantiert keine hindernisse, siehe OBSTACLES.spawn)
export function respawnPlayer(id) {
    const player = players[id];
    if (!player) return null;

    const spawn = OBSTACLES.spawn;
    const slot = Math.floor(Math.random() * spawn.count);
    player.x = spawn.x + slot * spawn.spacing;
    player.y = spawn.y;
    player.angle = 0;
    player.health = HEALTH_BAR.points;
    return player;
}

// lebenspunkte zurückgeben (höchstens bis zum maximum), gerundet wie beim schaden
export function healPlayer(id, amount) {
    const player = players[id];
    if (!player) return null;

    const health = Math.min(HEALTH_BAR.points, player.health + amount);
    player.health = Math.round(health * 1000) / 1000;
    return player;
}

export function getPlayer(id) {
    return players[id];
}

export function setPlayerVehicle(id, vehicleKey) {
    const player = players[id];
    if (!player) return null;

    player.vehicleKey = getVehicle(vehicleKey).key;
    player.armor = ARMOR[player.vehicleKey] ?? ARMOR.default;
    return player;
}

export function getAllPlayers() {
    return players;
}

export function updatePlayer(id, data) {
    const player = players[id];
    if (!player) return null;

    player.x = data.x;
    player.y = data.y;
    player.angle = data.angle;
    return player;
}

export function removePlayer(id) {
    delete players[id];
}
