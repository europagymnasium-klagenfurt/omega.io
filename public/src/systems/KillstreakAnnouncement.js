// große meldung für alle spieler, wenn jemand eine killstreak-marke erreicht (z. b. 5, 10, 20 ...)

import { socket, EVENTS } from "../network.js";
import { KILLSTREAK, VIEW_WIDTH } from "../config.js";

export class KillstreakAnnouncement {
    constructor(scene) {
        this.scene = scene;
        this.current = null;

        this.handlers = {
            [EVENTS.KILLSTREAK]: (data) => this.show(data.name, data.streak),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    show(name, streak) {
        this.clear();   // alte meldung ersetzen

        const text = this.scene.add.text(
            VIEW_WIDTH / 2,
            KILLSTREAK.y,
            `${name || "Unbekannt"}\n${streak} KILLS IN FOLGE!`,
            {
                align: "center",
                color: KILLSTREAK.color,
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: `${KILLSTREAK.fontSize}px`,
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 6,
            },
        ).setOrigin(0.5).setScrollFactor(0).setDepth(KILLSTREAK.depth).setScale(0.2);

        this.current = text;
        this.scene.tweens.add({ targets: text, scale: 1, duration: 250, ease: "Back.Out" });
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            delay: KILLSTREAK.duration,
            duration: KILLSTREAK.fadeDuration,
            onComplete: () => { if (this.current === text) this.clear(); },
        });
    }

    clear() {
        if (!this.current) return;
        this.scene.tweens.killTweensOf(this.current);
        this.current.destroy();
        this.current = null;
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
        this.clear();
    }
}
