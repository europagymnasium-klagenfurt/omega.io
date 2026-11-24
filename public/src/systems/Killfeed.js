// killfeed: zeigt oben links, wer wen abgeschossen hat. meldungen verschwinden nach kurzer zeit.

import { socket, EVENTS } from "../network.js";
import { KILLFEED } from "../config.js";

export class Killfeed {
    constructor(scene) {
        this.scene = scene;
        this.entries = [];   // neueste meldung zuerst

        this.handlers = {
            [EVENTS.PLAYER_KILLED]: (data) => this.addEntry(data.killerName, data.victimName),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    addEntry(killerName, victimName) {
        const style = { fontSize: `${KILLFEED.fontSize}px`, fontStyle: "bold" };
        const killer = this.scene.add.text(0, 0, killerName || "Unbekannt", { ...style, color: KILLFEED.killerColor });
        const icon = this.scene.add.text(0, 0, KILLFEED.icon, { ...style, color: KILLFEED.iconColor });
        const victim = this.scene.add.text(0, 0, victimName || "Unbekannt", { ...style, color: KILLFEED.victimColor });

        // texte nebeneinander anordnen
        const gap = KILLFEED.padding;
        killer.setPosition(KILLFEED.padding, 0);
        icon.setPosition(killer.x + killer.width + gap, 0);
        victim.setPosition(icon.x + icon.width + gap, 0);
        const width = victim.x + victim.width + KILLFEED.padding;

        const background = this.scene.add.rectangle(0, 0, width, KILLFEED.rowHeight - 4, KILLFEED.backgroundColor, KILLFEED.backgroundAlpha)
            .setOrigin(0)
            .setStrokeStyle(1, KILLFEED.borderColor, 0.9);
        for (const text of [killer, icon, victim]) text.setY((KILLFEED.rowHeight - 4 - text.height) / 2);

        const container = this.scene.add.container(KILLFEED.x, KILLFEED.y, [background, killer, icon, victim])
            .setScrollFactor(0)
            .setDepth(KILLFEED.depth);

        const entry = { container: container };
        this.entries.unshift(entry);
        if (this.entries.length > KILLFEED.maxEntries) this.removeEntry(this.entries[this.entries.length - 1]);
        this.layout();

        // nach einiger zeit ausblenden
        entry.tween = this.scene.tweens.add({
            targets: container,
            alpha: 0,
            delay: KILLFEED.entryDuration,
            duration: KILLFEED.fadeDuration,
            onComplete: () => this.removeEntry(entry),
        });
    }

    // meldungen untereinander setzen
    layout() {
        this.entries.forEach((entry, index) => {
            entry.container.y = KILLFEED.y + index * KILLFEED.rowHeight;
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
