// anzeige der runde: restzeit oben in der mitte, "warte auf spieler" und das ergebnis am rundenende.
// die runde selbst steuert der server, hier werden nur die events (INIT, ROUND_*) angezeigt.

import { socket, EVENTS } from "../network.js";
import { ROUND, VIEW_WIDTH } from "../config.js";

export class RoundHud {
    constructor(scene) {
        this.scene = scene;
        this.state = "waiting";
        this.round = 0;
        this.endsAt = 0;       // lokale zeit (ms), zu der die runde endet
        this.nextAt = 0;       // lokale zeit, zu der die nächste runde beginnt

        this.timer = scene.add.text(VIEW_WIDTH / 2, ROUND.hudY, "", {
            color: "#ffffff",
            fontSize: `${ROUND.hudFontSize}px`,
            fontStyle: "bold",
            stroke: "#101820",
            strokeThickness: 5,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(ROUND.depth);

        this.banner = scene.add.text(VIEW_WIDTH / 2, ROUND.bannerY, "", {
            color: "#ffffff",
            fontSize: `${ROUND.bannerFontSize}px`,
            fontStyle: "bold",
            stroke: "#101820",
            strokeThickness: 8,
            align: "center",
        }).setOrigin(0.5).setScrollFactor(0).setDepth(ROUND.depth).setVisible(false);

        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInfo(data.round),
            [EVENTS.ROUND_STARTED]: (data) => this.onInfo({ state: "running", ...data }),
            [EVENTS.ROUND_WAITING]: () => this.onInfo({ state: "waiting" }),
            [EVENTS.ROUND_ENDED]: (data) => this.onEnded(data),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    onInfo(info) {
        if (!info) return;
        this.state = info.state;
        this.round = info.round ?? this.round;
        this.endsAt = Date.now() + (info.remaining ?? 0);
        this.banner.setVisible(false);
    }

    onEnded(data) {
        this.state = "intermission";
        this.nextAt = Date.now() + data.intermission;
        this.winnerName = data.winnerName;
        this.reason = data.reason;
        this.banner.setColor(data.winnerColor === null ? "#ffffff" : `#${data.winnerColor.toString(16).padStart(6, "0")}`);
        this.banner.setVisible(true);
    }

    // wird jeden frame von der scene aufgerufen
    update() {
        const now = Date.now();
        if (this.state === "running") {
            const seconds = Math.max(0, Math.ceil((this.endsAt - now) / 1000));
            const minutes = Math.floor(seconds / 60);
            this.timer.setText(`RUNDE ${this.round}  ·  ${minutes}:${String(seconds % 60).padStart(2, "0")}`);
        } else if (this.state === "intermission") {
            const seconds = Math.max(0, Math.ceil((this.nextAt - now) / 1000));
            this.timer.setText(`Nächste Runde in ${seconds}`);
            const title = this.winnerName ? `${this.winnerName} gewinnt!` : "Unentschieden";
            this.banner.setText(`RUNDE VORBEI\n${title}`);
        } else {
            this.timer.setText("Warte auf weitere Spieler …");
        }
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
