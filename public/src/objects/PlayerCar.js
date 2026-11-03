// das eigene auto: physik und steuerung

import { CAR, SPEED_BOOST } from "../config.js";
import { DEFAULT_VEHICLE_KEY } from "/shared/vehicles.js";
import { HealthBar } from "./HealthBar.js";

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
        this.speedMultiplier = 1;
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
    drive(cursors, shiftKey) {
        const turnSpeed = shiftKey && shiftKey.isDown
            ? CAR.rotationSpeed * CAR.turnBoostMultiplier
            : CAR.rotationSpeed;

        const isTurning = cursors.left.isDown || cursors.right.isDown;
        const isShiftBoost = shiftKey && shiftKey.isDown && isTurning;

        if (cursors.left.isDown) {
            this.setAngularVelocity(-turnSpeed);
        } else if (cursors.right.isDown) {
            this.setAngularVelocity(turnSpeed);
        } else {
            this.setAngularVelocity(0);
        }

        if (isShiftBoost) {
            this.emitDust();
        }

        const angle = this.rotation - Math.PI / 2;   // das bild zeigt nach oben, phaser rechnet ab "rechts"
        const speed = CAR.speed * this.speedMultiplier;

        if (cursors.up.isDown) {
            this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
        } else if (cursors.down.isDown) {
            this.scene.physics.velocityFromRotation(angle, -speed, this.body.velocity);
        } else {
            const glideFactor = shiftKey && shiftKey.isDown ? CAR.glideShift : CAR.glide;
            this.body.velocity.scale(glideFactor);   // geschwindigkeit verringern: normal kürzer, mit SHIFT deutlich länger
        }
    }

    emitDust() {
        const turnLeft = this.body.angularVelocity < 0;
        const radius = CAR.hitbox.radius * 0.5;
        const rotation = this.rotation;

        const points = turnLeft
            ? [
                { x: 1, y: -1 },
                { x: -1, y: 1 },
            ]
            : [
                { x: -1, y: -1 },
                { x: 1, y: 1 },
            ];

        for (const point of points) {
            const localX = point.x * radius;
            const localY = point.y * radius;
            const worldX = this.x + localX * Math.cos(rotation) - localY * Math.sin(rotation);
            const worldY = this.y + localX * Math.sin(rotation) + localY * Math.cos(rotation);

            const particle = this.scene.add.sprite(
                worldX,
                worldY,
                "starParticle"
            );

            const scale = 0.014 + Math.random() * 0.02;
            particle.setScale(scale);
            particle.setTint(0xfff200);
            particle.setAlpha(0.5);
            particle.setDepth(5);

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 6,
                y: particle.y + 10 + Math.random() * 7,
                alpha: 0,
                scale: scale * 0.8,
                duration: 230 + Math.random() * 110,
                ease: "Linear",
                onComplete: () => particle.destroy(),
            });
        }
    }

    activateSpeedBoost() {
        this.speedMultiplier = SPEED_BOOST.multiplier;
        this.scene.time.delayedCall(SPEED_BOOST.duration, () => {
            this.speedMultiplier = 1;
        });
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
