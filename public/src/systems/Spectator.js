// zuschauen: wer ausgeschieden ist, sieht dem spieler zu, der ihn abgeschossen hat.
// stirbt dieser auch, geht die kamera zum nächsten lebenden spieler. mit der neuen runde geht es zurück zum eigenen auto.

import { socket, EVENTS } from "../network.js";
import { ROUND, VIEW_WIDTH } from "../config.js";

export class Spectator {
    constructor(scene, car, multiplayer) {
        this.scene = scene;
        this.car = car;
        this.multiplayer = multiplayer;
        this.names = {};        // id -> name
        this.dead = new Set();  // ausgeschiedene spieler
        this.killedBy = {};     // opfer-id -> schützen-id
        this.targetId = null;

        this.hint = scene.add.text(VIEW_WIDTH / 2, ROUND.hintY, "", {
            color: "#ffffff",
            fontSize: `${ROUND.hintFontSize}px`,
            fontStyle: "bold",
            stroke: "#101820",
            strokeThickness: 5,
            align: "center",
        }).setOrigin(0.5).setScrollFactor(0).setDepth(ROUND.depth).setVisible(false);

        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInit(data),
            [EVENTS.PLAYER_JOINED]: (player) => this.onJoined(player),
            [EVENTS.PLAYER_LEFT]: (data) => this.onLeft(data.id),
            [EVENTS.PLAYER_KILLED]: (data) => this.onKilled(data),
            [EVENTS.ROUND_STARTED]: () => this.onRoundStarted(),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    onInit(data) {
        for (const player of Object.values(data.players)) this.onJoined(player);
        // mitten in der runde dazugekommen: es gibt keinen schützen, also irgendjemandem zusehen
        if (this.dead.has(data.id)) this.follow(this.pickTarget());
    }

    onJoined(player) {
        this.names[player.id] = player.name;
        if (player.health <= 0) this.dead.add(player.id);
        else this.dead.delete(player.id);
    }

    onLeft(id) {
        this.dead.delete(id);
        delete this.names[id];
        if (this.targetId === id) this.follow(this.pickTarget());
    }

    onKilled(data) {
        this.dead.add(data.victimId);
        this.killedBy[data.victimId] = data.killerId;
        this.names[data.victimId] = data.victimName;
        this.names[data.killerId] = data.killerName;

        if (data.victimId === this.multiplayer.playerId) {
            this.follow(this.pickTarget(data.killerId));
        } else if (data.victimId === this.targetId && this.dead.has(this.multiplayer.playerId)) {
            this.follow(this.pickTarget(this.killedBy[data.victimId]));
        }
    }

    onRoundStarted() {
        this.dead.clear();
        this.killedBy = {};
        this.follow(null);
    }

    // bevorzugt der wunsch-spieler (schütze), wenn er lebt, sonst irgendein lebender
    pickTarget(preferredId) {
        const cars = this.multiplayer.remoteCars;
        const isOk = (id) => cars[id] && !this.dead.has(id);
        if (preferredId && isOk(preferredId)) return preferredId;
        return Object.keys(cars).find(isOk) ?? null;
    }

    // null = wieder dem eigenen auto folgen
    follow(id) {
        this.targetId = id;
        const camera = this.scene.cameras.main;
        const target = id ? this.multiplayer.remoteCars[id] : null;
        camera.startFollow(target ?? this.car, true);
        this.hint.setVisible(this.dead.has(this.multiplayer.playerId));
        if (target) this.hint.setText(`Du siehst ${this.names[id] ?? "?"} zu\nbis die Runde vorbei ist`);
        else if (this.hint.visible) this.hint.setText("Alle anderen sind ausgeschieden\nbis die Runde vorbei ist");
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
