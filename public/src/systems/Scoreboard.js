// rangliste mit kills, toden und schaden (ausgeteilt/erhalten): solange TAB gedrückt ist, wird sie in der mitte angezeigt.
// die zahlen zählt der server, hier werden nur die events (INIT, PLAYER_KILLED, ...) übernommen.

import { socket, EVENTS } from "../network.js";
import { SCOREBOARD, VIEW_WIDTH, VIEW_HEIGHT } from "../config.js";

export class Scoreboard {
    constructor(scene) {
        this.scene = scene;
        this.ownId = null;
        this.players = {};     // id -> {name, color, kills, deaths, damageDealt, damageTaken}
        this.rows = [];
        this.dirty = true;

        this.container = scene.add.container(VIEW_WIDTH / 2, VIEW_HEIGHT / 2)
            .setScrollFactor(0).setDepth(SCOREBOARD.depth).setVisible(false);
        this.background = scene.add.rectangle(0, 0, SCOREBOARD.width, 100, SCOREBOARD.backgroundColor, SCOREBOARD.backgroundAlpha);
        this.background.setStrokeStyle(2, SCOREBOARD.borderColor, 0.9);
        this.container.add(this.background);

        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInit(data),
            [EVENTS.PLAYER_JOINED]: (player) => this.setPlayer(player),
            [EVENTS.PLAYER_LEFT]: (data) => this.removePlayer(data.id),
            [EVENTS.PLAYER_KILLED]: (data) => this.onKilled(data),
            [EVENTS.STATS_CHANGED]: (data) => this.onStats(data),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }

        this.key = scene.input.keyboard.addKey(SCOREBOARD.key);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    onInit(data) {
        this.ownId = data.id;
        this.players = {};
        for (const player of Object.values(data.players)) this.setPlayer(player);
    }

    setPlayer(player) {
        this.players[player.id] = {
            name: player.name || "Unbekannt",
            color: player.color,
            kills: player.kills ?? 0,
            deaths: player.deaths ?? 0,
            damageDealt: player.damageDealt ?? 0,
            damageTaken: player.damageTaken ?? 0,
        };
        this.dirty = true;
    }

    removePlayer(id) {
        delete this.players[id];
        this.dirty = true;
    }

    onKilled(data) {
        const killer = this.players[data.killerId];
        const victim = this.players[data.victimId];
        if (killer) killer.kills = data.killerKills;
        if (victim) victim.deaths = data.victimDeaths;
        this.dirty = true;
    }

    // komplette statistik eines spielers vom server übernehmen
    onStats(data) {
        const player = this.players[data.id];
        if (!player) return;
        player.kills = data.kills;
        player.deaths = data.deaths;
        player.damageDealt = data.damageDealt;
        player.damageTaken = data.damageTaken;
        this.dirty = true;
    }

    // wird jeden frame von der scene aufgerufen
    update() {
        const show = this.key.isDown;
        this.container.setVisible(show);
        if (show && this.dirty) this.rebuild();
    }

    // liste neu aufbauen: meiste kills zuerst, bei gleichstand weniger tode zuerst
    rebuild() {
        this.dirty = false;
        for (const row of this.rows) row.destroy();
        this.rows = [];

        const entries = Object.entries(this.players).sort(
            ([, a], [, b]) => b.kills - a.kills || a.deaths - b.deaths,
        );
        const height = SCOREBOARD.titleHeight + SCOREBOARD.padding + entries.length * SCOREBOARD.rowHeight;
        this.background.setSize(SCOREBOARD.width, height);

        const left = -SCOREBOARD.width / 2 + SCOREBOARD.padding;
        const right = SCOREBOARD.width / 2 - SCOREBOARD.padding;
        const top = -height / 2 + SCOREBOARD.padding;
        const small = `${SCOREBOARD.fontSize - 4}px`;

        this.addText(left, top, "SPIELER", "#8ad8ff", small, 0);
        // zahlenspalten von rechts: erhalten, schaden, tode, kills
        const col = (n) => right - n * SCOREBOARD.columnWidth;
        this.addText(col(0), top, "ERHALTEN", "#8ad8ff", small, 1);
        this.addText(col(1), top, "SCHADEN", "#8ad8ff", small, 1);
        this.addText(col(2), top, "TODE", "#8ad8ff", small, 1);
        this.addText(col(3), top, "KILLS", "#8ad8ff", small, 1);

        entries.forEach(([id, player], index) => {
            const y = top + SCOREBOARD.titleHeight - SCOREBOARD.padding + index * SCOREBOARD.rowHeight;
            const color = `#${player.color.toString(16).padStart(6, "0")}`;
            const name = id === this.ownId ? `${player.name} (du)` : player.name;
            this.addText(left, y, name, color, `${SCOREBOARD.fontSize}px`, 0);
            const size = `${SCOREBOARD.fontSize}px`;
            this.addText(col(0), y, player.damageTaken.toFixed(1), "#ff8a8a", size, 1);
            this.addText(col(1), y, player.damageDealt.toFixed(1), "#8aff8a", size, 1);
            this.addText(col(2), y, String(player.deaths), "#ffffff", size, 1);
            this.addText(col(3), y, String(player.kills), "#ffffff", size, 1);
        });
    }

    addText(x, y, text, color, fontSize, originX) {
        const label = this.scene.add.text(x, y, text, { color, fontSize, fontStyle: "bold" }).setOrigin(originX, 0);
        this.container.add(label);
        this.rows.push(label);
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
        this.scene.input.keyboard?.removeKey(this.key);
    }
}
