// killstreaks am server: zählt kills in folge, meldet marken und den goldenen status an alle.
// die zahl steht pro spieler in player.killStreak (siehe players.js).

import { EVENTS } from "../shared/events.js";
import { KILLSTREAK, GOLD_STREAK } from "../public/src/config.js";

// abschuss: das opfer verliert seine streak, der schütze bekommt eine dazu
export function registerKill(io, killer, victim) {
    resetStreak(io, victim);

    killer.killStreak += 1;
    if (killer.killStreak === GOLD_STREAK.minStreak) {
        io.emit(EVENTS.GOLD_CHANGED, { id: killer.id, gold: true });
    }
    if (KILLSTREAK.milestones.includes(killer.killStreak)) {
        io.emit(EVENTS.KILLSTREAK, { name: killer.name, streak: killer.killStreak });
    }
}

// spieler ohne gegner zerstört (z. b. hindernis): streak ist ebenfalls vorbei
export function registerSuicide(io, player) {
    resetStreak(io, player);
}

function resetStreak(io, player) {
    if (player.killStreak >= GOLD_STREAK.minStreak) {
        io.emit(EVENTS.GOLD_CHANGED, { id: player.id, gold: false });
    }
    player.killStreak = 0;
}
