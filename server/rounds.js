// runden am server: eine runde läuft, bis nur noch einer lebt oder die zeit abläuft.
// danach kurze pause, dann starten alle neu. wer stirbt, scheidet bis zur nächsten runde aus.

import { EVENTS } from "../shared/events.js";
import { ROUND } from "../public/src/config.js";
import { getAllPlayers, respawnPlayer } from "./players.js";

let io = null;
let state = "waiting";   // waiting (zu wenig spieler) | running | intermission
let roundNumber = 0;
let endsAt = 0;
let roundTimer = null;
let breakTimer = null;

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

// ein spieler ist ausgeschieden oder weg: gewinner prüfen
export function checkRoundEnd() {
    if (state !== "running") return;
    const alive = Object.values(getAllPlayers()).filter((player) => player.alive);
    if (alive.length <= 1) endRound(alive[0] ?? null, "last");
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
    roundNumber += 1;
    state = "running";
    endsAt = Date.now() + ROUND.duration;

    // alle starten neu, jeder auf einem eigenen platz der startreihe
    const ids = Object.keys(getAllPlayers());
    ids.sort(() => Math.random() - 0.5);
    ids.forEach((id, slot) => {
        const player = respawnPlayer(id, slot);
        io.emit(EVENTS.HEALTH_CHANGED, { id: player.id, health: player.health });
        io.emit(EVENTS.PLAYER_RESPAWNED, { id: player.id, x: player.x, y: player.y, angle: player.angle, health: player.health });
    });

    io.emit(EVENTS.ROUND_STARTED, { round: roundNumber, remaining: ROUND.duration });
    clearTimeout(roundTimer);
    roundTimer = setTimeout(endByTime, ROUND.duration);
}

// zeit abgelaufen: wer am meisten leben hat, gewinnt (bei gleichstand unentschieden)
function endByTime() {
    const alive = Object.values(getAllPlayers())
        .filter((player) => player.alive)
        .sort((a, b) => b.health - a.health);
    const draw = alive.length > 1 && alive[0].health === alive[1].health;
    endRound(draw ? null : alive[0] ?? null, "time");
}

function endRound(winner, reason) {
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
