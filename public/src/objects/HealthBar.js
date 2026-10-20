import { HEALTH_BAR } from "../config.js";

export class HealthBar {
    constructor(scene, car) {
        this.car = car;
        this.maxHealth = HEALTH_BAR.points;
        this.health = this.maxHealth;
        this.container = scene.add.container(0, 0).setDepth(10);
        this.hearts = [];

        for (let index = 0; index < this.maxHealth; index += 1) {
            const heart = scene.add.text(
                (index - (this.maxHealth - 1) / 2) * HEALTH_BAR.heartSpacing,
                0,
                "♥",
                {
                    fontFamily: "Arial",
                    fontSize: `${HEALTH_BAR.heartSize}px`,
                    color: "#ff0000",
                },
            ).setOrigin(0.5);

            this.container.add(heart);
            this.hearts.push(heart);
        }

        this.updatePosition();
    }

    updatePosition() {
        this.container.setPosition(
            this.car.x,
            this.car.y - this.car.displayHeight / 2 - HEALTH_BAR.offset,
        );
    }

    setHealth(health) {
        this.health = Phaser.Math.Clamp(health, 0, this.maxHealth);
        this.hearts.forEach((heart, index) => heart.setVisible(index < this.health));
    }

    destroy() {
        this.container.destroy();
    }
}