// killfeed oben links: bei jedem abschuss erscheint kurz "killer > opfer" in den spielerfarben

import { socket, EVENTS } from "../network.js";
import { KILLFEED } from "../config.js";

export class KillFeed {
    constructor(scene) {
        this.scene = scene;
        this.lines = [];

        this.handlers = {
            [EVENTS.PLAYER_KILLED]: (data) => this.addLine(data),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    addLine(data) {
        const style = (color) => ({
            color: `#${color.toString(16).padStart(6, "0")}`,
            fontSize: `${KILLFEED.fontSize}px`,
            fontStyle: "bold",
        });
        const killer = this.scene.add.text(0, 0, data.killerName, style(data.killerColor));
        const arrow = this.scene.add.text(killer.width + 8, 0, ">", { color: "#ffffff", fontSize: `${KILLFEED.fontSize}px`, fontStyle: "bold" });
        const victim = this.scene.add.text(arrow.x + arrow.width + 8, 0, data.victimName, style(data.victimColor));

        const width = victim.x + victim.width + KILLFEED.padding * 2;
        const background = this.scene.add.rectangle(-KILLFEED.padding, -2, width, KILLFEED.lineHeight - 2,
            KILLFEED.backgroundColor, KILLFEED.backgroundAlpha).setOrigin(0, 0);
        const line = this.scene.add.container(0, 0, [background, killer, arrow, victim])
            .setScrollFactor(0).setDepth(KILLFEED.depth);

        this.lines.push(line);
        if (this.lines.length > KILLFEED.maxLines) this.removeLine(this.lines[0]);
        this.layout();

        // nach der anzeigezeit ausblenden und entfernen
        this.scene.time.delayedCall(KILLFEED.showTime, () => {
            if (!line.active) return;
            this.scene.tweens.add({
                targets: line,
                alpha: 0,
                duration: KILLFEED.fadeTime,
                onComplete: () => this.removeLine(line),
            });
        });
    }

    removeLine(line) {
        this.lines = this.lines.filter((other) => other !== line);
        this.scene.tweens.killTweensOf(line);
        line.destroy();
        this.layout();
    }

    // zeilen untereinander anordnen, die neueste ganz unten
    layout() {
        this.lines.forEach((line, index) => {
            line.setPosition(KILLFEED.x + KILLFEED.padding, KILLFEED.y + index * KILLFEED.lineHeight);
        });
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
