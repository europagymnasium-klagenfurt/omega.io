// runden am server: eine runde dauert ROUND.duration (5 minuten). wer die meisten abschüsse in dieser runde hat, gewinnt.
// danach kurze pause, dann starten alle neu. wer stirbt, sieht eine weile zu und startet dann wieder (ROUND.respawnDelay).

import { EVENTS } from "../shared/events.js";
import { ROUND } from "../public/src/config.js";
import { getAllPlayers, getPlayer, respawnPlayer } from "./players.js";

let io = null;
let state = "waiting";   // waiting (zu wenig spieler) | running | intermission
let roundNumber = 0;
let endsAt = 0;
let roundTimer = null;
let breakTimer = null;
const respawnTimers = {};   // spieler-id -> timer bis zum neustart

export function setupRounds(socketServer) {
    io = socketServer;
}

export function isRunning() {
    return state === "running";
}

// für INIT: damit ein neuer client weiß, wie weit die runde ist
export function getRoundInfo() {
    return {
        state: state,
        round: roundNumber,
        remaining: state === "running" ? Math.max(0, endsAt - Date.now()) : 0,
    };
}

// ein neuer spieler ist da: genug spieler -> runde starten
export function onPlayerJoined() {
    if (state === "waiting") tryStart();
}

// spieler ist gestorben: nach der wartezeit startet er wieder, außer die runde ist vorher vorbei
export function playerDied(id) {
    if (state === "running") scheduleRespawn(id);
}

// spieler ist weg: kein neustart mehr
export function playerLeft(id) {
    clearTimeout(respawnTimers[id]);
    delete respawnTimers[id];
}

export function scheduleRespawn(id) {
    clearTimeout(respawnTimers[id]);
    respawnTimers[id] = setTimeout(() => {
        delete respawnTimers[id];
        if (state !== "running" || !getPlayer(id)) return;
        const player = respawnPlayer(id);
        io.emit(EVENTS.HEALTH_CHANGED, { id: player.id, health: player.health });
        io.emit(EVENTS.PLAYER_RESPAWNED, { id: player.id, x: player.x, y: player.y, angle: player.angle, health: player.health });
    }, ROUND.respawnDelay);
}

function clearRespawns() {
    for (const id of Object.keys(respawnTimers)) clearTimeout(respawnTimers[id]);
    for (const id of Object.keys(respawnTimers)) delete respawnTimers[id];
}

function tryStart() {
    if (Object.keys(getAllPlayers()).length < ROUND.minPlayers) {
        state = "waiting";
        io.emit(EVENTS.ROUND_WAITING);
        return;
    }
    startRound();
}

function startRound() {
    clearRespawns();
    roundNumber += 1;
    state = "running";
    endsAt = Date.now() + ROUND.duration;

    // alle starten neu, jeder auf einem eigenen platz der startreihe
    const ids = Object.keys(getAllPlayers());
    ids.sort(() => Math.random() - 0.5);
    ids.forEach((id, slot) => {
        getPlayer(id).roundKills = 0;
        const player = respawnPlayer(id, slot);
        io.emit(EVENTS.HEALTH_CHANGED, { id: player.id, health: player.health, maxHealth: player.maxHealth });
        io.emit(EVENTS.PLAYER_RESPAWNED, { id: player.id, x: player.x, y: player.y, angle: player.angle, health: player.health });
    });

    io.emit(EVENTS.ROUND_STARTED, { round: roundNumber, remaining: ROUND.duration });
    clearTimeout(roundTimer);
    roundTimer = setTimeout(endByTime, ROUND.duration);
}

// zeit abgelaufen: wer die meisten abschüsse in dieser runde hat, gewinnt (bei gleichstand oder ohne abschüsse unentschieden)
function endByTime() {
    const ranking = Object.values(getAllPlayers()).sort((a, b) => b.roundKills - a.roundKills);
    const best = ranking[0];
    const draw = !best || best.roundKills === 0 || (ranking[1] && ranking[1].roundKills === best.roundKills);
    endRound(draw ? null : best, "time");
}

function endRound(winner, reason) {
    clearRespawns();
    state = "intermission";
    clearTimeout(roundTimer);
    io.emit(EVENTS.ROUND_ENDED, {
        winnerId: winner?.id ?? null,
        winnerName: winner?.name ?? null,
        winnerColor: winner?.color ?? null,
        reason: reason,
        intermission: ROUND.intermission,
    });

    clearTimeout(breakTimer);
    breakTimer = setTimeout(tryStart, ROUND.intermission);
}
