// das eigene auto: physik und steuerung

import { CAR } from "../config.js";

export class PlayerCar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "car");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true).setScale(CAR.scale);
        this.setAngle(90);
        this.setCircle(CAR.hitbox.radius, CAR.hitbox.offsetX, CAR.hitbox.offsetY);
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
        const activeSpeed = shiftKey && shiftKey.isDown ? CAR.speed * CAR.shiftSpeedMultiplier : CAR.speed;

        if (cursors.up.isDown) {
            this.scene.physics.velocityFromRotation(angle, activeSpeed, this.body.velocity);
        } else if (cursors.down.isDown) {
            this.scene.physics.velocityFromRotation(angle, -activeSpeed, this.body.velocity);
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
