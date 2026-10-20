// das eigene auto: physik und steuerung

import { CAR } from "../config.js";
import { HealthBar } from "./HealthBar.js";

export class PlayerCar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "car");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true).setScale(CAR.scale);
        this.setAngle(90);
        this.setCircle(CAR.hitbox.radius, CAR.hitbox.offsetX, CAR.hitbox.offsetY);
        this.healthBar = new HealthBar(scene, this);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.healthBar.updatePosition();
    }

    destroy(fromScene) {
        this.healthBar.destroy();
        super.destroy(fromScene);
    }

    // wird jeden frame von der scene aufgerufen.
    // links und rechts rotieren die grafik, die hitbox bleibt axis-aligned.
    drive(cursors) {
        if (cursors.left.isDown) {
            this.setAngularVelocity(-CAR.rotationSpeed);
        } else if (cursors.right.isDown) {
            this.setAngularVelocity(CAR.rotationSpeed);
        } else {
            this.setAngularVelocity(0);
        }

        const angle = this.rotation - Math.PI / 2;   // das bild zeigt nach oben, phaser rechnet ab "rechts"

        if (cursors.up.isDown) {
            this.scene.physics.velocityFromRotation(angle, CAR.speed, this.body.velocity);
        } else if (cursors.down.isDown) {
            this.scene.physics.velocityFromRotation(angle, -CAR.speed, this.body.velocity);
        } else {
            this.body.velocity.scale(CAR.friction);   // geschwindigkeit verringern
        }
    }

    // daten, die an den server geschickt werden
    getState() {
        return { x: this.x, y: this.y, angle: this.angle };
    }

    // daten vom server übernehmen (startposition, farbe)
    applyServerData(player) {
        this.setPosition(player.x, player.y);
        this.setAngle(player.angle);
        this.setTint(player.color);
    }
}
