// kill-meldungen: zeigt oben links, wer wen abgeschossen hat. meldungen verschwinden nach kurzer zeit.

import { socket, EVENTS } from "../network.js";
import { KILLMESSAGES } from "../config.js";

export class KillMessages {
    constructor(scene) {
        this.scene = scene;
        this.entries = [];   // neueste meldung zuerst

        this.handlers = {
            [EVENTS.PLAYER_KILLED]: (data) => this.addEntry(data),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    addEntry(data) {
        const style = { fontSize: `${KILLMESSAGES.fontSize}px`, fontStyle: "bold" };
        const killer = this.scene.add.text(0, 0, data.killerName || "Unbekannt", { ...style, color: this.toCss(data.killerColor, KILLMESSAGES.killerColor) });
        const icon = this.scene.add.text(0, 0, KILLMESSAGES.icon, { ...style, color: KILLMESSAGES.iconColor });
        const victim = this.scene.add.text(0, 0, data.victimName || "Unbekannt", { ...style, color: this.toCss(data.victimColor, KILLMESSAGES.victimColor) });

        // texte nebeneinander anordnen
        const gap = KILLMESSAGES.padding;
        killer.setPosition(KILLMESSAGES.padding, 0);
        icon.setPosition(killer.x + killer.width + gap, 0);
        victim.setPosition(icon.x + icon.width + gap, 0);
        const width = victim.x + victim.width + KILLMESSAGES.padding;

        const background = this.scene.add.rectangle(0, 0, width, KILLMESSAGES.rowHeight - 4, KILLMESSAGES.backgroundColor, KILLMESSAGES.backgroundAlpha)
            .setOrigin(0)
            .setStrokeStyle(1, KILLMESSAGES.borderColor, 0.9);
        for (const text of [killer, icon, victim]) text.setY((KILLMESSAGES.rowHeight - 4 - text.height) / 2);

        const container = this.scene.add.container(KILLMESSAGES.x, KILLMESSAGES.y, [background, killer, icon, victim])
            .setScrollFactor(0)
            .setDepth(KILLMESSAGES.depth);

        const entry = { container: container };
        this.entries.unshift(entry);
        if (this.entries.length > KILLMESSAGES.maxEntries) this.removeEntry(this.entries[this.entries.length - 1]);
        this.layout();

        // nach einiger zeit ausblenden
        entry.tween = this.scene.tweens.add({
            targets: container,
            alpha: 0,
            delay: KILLMESSAGES.entryDuration,
            duration: KILLMESSAGES.fadeDuration,
            onComplete: () => this.removeEntry(entry),
        });
    }

    // spielerfarbe (zahl) als css-farbe, sonst die standardfarbe aus der config
    toCss(color, fallback) {
        return typeof color === "number" ? `#${color.toString(16).padStart(6, "0")}` : fallback;
    }

    // meldungen untereinander setzen
    layout() {
        this.entries.forEach((entry, index) => {
            entry.container.y = KILLMESSAGES.y + index * KILLMESSAGES.rowHeight;
        });
    }

    removeEntry(entry) {
        const index = this.entries.indexOf(entry);
        if (index === -1) return;
        this.entries.splice(index, 1);
        entry.tween?.remove();
        entry.container.destroy();
        this.layout();
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
        this.entries = [];
    }
}
