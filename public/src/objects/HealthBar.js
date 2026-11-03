// lebensbalken über einem auto: wird kürzer und färbt sich von grün über orange nach rot

import { HEALTH_BAR } from "../config.js";

export class HealthBar {
    constructor(scene, car) {
        this.car = car;
        this.maxHealth = HEALTH_BAR.points;
        this.health = this.maxHealth;
        this.graphics = scene.add.graphics().setDepth(10);

        this.draw();
        this.updatePosition();
    }

    updatePosition() {
        this.graphics.setPosition(
            this.car.x,
            this.car.y - this.car.displayHeight / 2 - HEALTH_BAR.offset,
        );
    }

    setHealth(health) {
        this.health = Phaser.Math.Clamp(health, 0, this.maxHealth);
        this.draw();
    }

    // balken neu zeichnen. (0, 0) ist die mitte des balkens.
    draw() {
        const { width, height, border } = HEALTH_BAR;
        const ratio = this.health / this.maxHealth;

        this.graphics.clear();
        this.graphics.fillStyle(HEALTH_BAR.backgroundColor, 1);
        this.graphics.fillRect(-width / 2 - border, -height / 2 - border, width + border * 2, height + border * 2);
        this.graphics.fillStyle(this.getColor(ratio), 1);
        this.graphics.fillRect(-width / 2, -height / 2, width * ratio, height);
    }

    // obere hälfte: grün -> orange, untere hälfte: orange -> rot
    getColor(ratio) {
        if (ratio > 0.5) return this.mixColors(HEALTH_BAR.colorHalf, HEALTH_BAR.colorFull, (ratio - 0.5) * 2);
        return this.mixColors(HEALTH_BAR.colorEmpty, HEALTH_BAR.colorHalf, ratio * 2);
    }

    // mischt zwei farben: t = 0 ergibt colorA, t = 1 ergibt colorB
    mixColors(colorA, colorB, t) {
        const r = Math.round(Phaser.Math.Linear((colorA >> 16) & 0xff, (colorB >> 16) & 0xff, t));
        const g = Math.round(Phaser.Math.Linear((colorA >> 8) & 0xff, (colorB >> 8) & 0xff, t));
        const b = Math.round(Phaser.Math.Linear(colorA & 0xff, colorB & 0xff, t));
        return (r << 16) | (g << 8) | b;
    }

    destroy() {
        this.graphics.destroy();
    }
}
