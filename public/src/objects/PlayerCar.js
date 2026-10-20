// das eigene auto: physik und steuerung

import { CAR } from "../config.js";
import { DEFAULT_VEHICLE_KEY } from "/shared/vehicles.js";

export class PlayerCar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, vehicleKey = DEFAULT_VEHICLE_KEY) {
        super(scene, x, y, vehicleKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const scale = CAR.scale * CAR.referenceSize / Math.max(this.width, this.height);
        this.setCollideWorldBounds(true).setScale(scale);
        this.setAngle(90);
        const radius = Math.min(this.width, this.height) * CAR.hitbox.widthRatio / 2;
        const offsetX = (this.width - radius * 2) / 2;
        const offsetY = (this.height - radius * 2) / 2;
        this.setCircle(radius, offsetX, offsetY);
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
        if (player.vehicleKey) this.setTexture(player.vehicleKey);
    }
}
