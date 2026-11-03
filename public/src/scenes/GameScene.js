// die spielwelt: baut map, eigenes auto, kamera und multiplayer zusammen.
// diese datei soll KURZ bleiben. neue features als eigene klasse in objects/ oder systems/
// schreiben und hier nur erzeugen und in update() aufrufen.

import { WORLD_WIDTH, WORLD_HEIGHT, SPAWN_INTRO } from "../config.js";
import { PlayerCar } from "../objects/PlayerCar.js";
import { GarageAccess } from "../systems/GarageAccess.js";
import { FPSCounter } from "../objects/FPSCounter.js";
import { CarCollisions } from "../systems/CarCollisions.js";
import { CollisionMessage } from "../systems/CollisionMessage.js";
import { Multiplayer } from "../systems/Multiplayer.js";
import { SpeedBoost } from "../systems/SpeedBoost.js";
import { PlayerHud } from "../systems/PlayerHud.js";
import { ExhaustSmoke } from "../systems/ExhaustSmoke.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create(data) {
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "racetrack").setOrigin(0, 0);

        this.car = new PlayerCar(this, 400, 300, data?.vehicleKey);
        this.car.setVisible(false);
        this.car.setAlpha(0);
        this.isIntroActive = true;

        if (!data?.vehicleChangeUsed) this.garageAccess = new GarageAccess(this, this.car);

        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.car, true);
        this.cameras.main.setZoom(1.9);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.setupIntroAnimation();
    }

    setupIntroAnimation() {
        const introDuration = SPAWN_INTRO.duration;
        const engineSound = this.sound.add("startEngine");
        this.introElapsed = 0;
        this.introTrail = [];
        this.introSkidMarks = this.add.graphics();
        this.introSkidMarks.setDepth(2);

        this.car.setVisible(true);
        this.car.setAlpha(1);
        this.car.setAngularVelocity(0);
        this.car.setVelocity(0, 0);
        this.car.healthBar.container.setVisible(false);

        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.25,
            duration: 500,
            ease: "Cubic.Out",
        });

        const exhaustX = this.car.x - Math.cos(this.car.rotation - Math.PI / 2) * 72;
        const exhaustY = this.car.y - Math.sin(this.car.rotation - Math.PI / 2) * 72;
        const smoke = this.add.particles(exhaustX, exhaustY, "boostSmoke", {
            speed: { min: 50, max: 150 },
            angle: { min: 150, max: 210 },
            scale: { start: 0.2, end: 1.1 },
            alpha: { start: 0.8, end: 0 },
            lifespan: SPAWN_INTRO.smokeLifespan,
            quantity: SPAWN_INTRO.smokeQuantity,
            frequency: SPAWN_INTRO.smokeFrequency,
            maxParticles: 120,
        });
        smoke.setDepth(15);
        this.introSmoke = smoke;

        this.tweens.add({
            targets: this.car,
            angle: this.car.angle + SPAWN_INTRO.rotation,
            duration: introDuration,
            ease: "Cubic.Out",
        });

        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: introDuration,
            ease: "Cubic.InOut",
        });

        this.introVehicleSpeed = SPAWN_INTRO.vehicleSpeed;
        this.introVehicleDrift = SPAWN_INTRO.driftSpeed;

        this.time.delayedCall(introDuration - SPAWN_INTRO.fadeDuration, () => {
            this.tweens.add({
                targets: smoke,
                frequency: SPAWN_INTRO.smokeFadeFrequency,
                duration: SPAWN_INTRO.fadeDuration,
                ease: "Sine.InOut",
                onComplete: () => smoke.stop(),
            });
            this.tweens.add({
                targets: this.introSkidMarks,
                alpha: 0,
                duration: SPAWN_INTRO.fadeDuration,
                ease: "Sine.InOut",
            });
            this.tweens.add({
                targets: engineSound,
                volume: 0,
                duration: SPAWN_INTRO.fadeDuration,
                ease: "Sine.InOut",
                onComplete: () => engineSound.stop(),
            });
        });

        this.time.delayedCall(introDuration, () => {
            if (this.introSkidMarks) this.introSkidMarks.destroy();
            const velocity = this.car.body.velocity;
            if (Math.hypot(velocity.x, velocity.y) > 1) {
                this.car.setAngle(
                    Phaser.Math.RadToDeg(Math.atan2(velocity.y, velocity.x) + Math.PI / 2),
                );
            }
            this.car.healthBar.container.setVisible(true);
            this.isIntroActive = false;
            this.setupGameplay();
            this.time.delayedCall(
                Math.max(0, SPAWN_INTRO.smokeLifespan - SPAWN_INTRO.fadeDuration),
                () => smoke.destroy(),
            );
        });

        engineSound.play();
    }

    setupGameplay() {
        this.speedBoost = new SpeedBoost(this, this.car);
        this.fpsCounter = new FPSCounter(this);
        this.collisionMessage = new CollisionMessage(this);
        this.carCollisions = new CarCollisions(this, this.car, this.collisionMessage);
        this.playerHud = new PlayerHud(this);
        this.multiplayer = new Multiplayer(this, this.car, this.carCollisions, this.playerHud);
        this.exhaustSmoke = new ExhaustSmoke(this, this.car);
    }

    update(time, delta) {
        if (this.isIntroActive) {
            this.updateIntroDrift(delta);
            return;
        }

        this.car.drive(this.cursors);
        this.exhaustSmoke.update(this.cursors.up.isDown);
        this.fpsCounter.update(delta);
        this.multiplayer.sendState();
    }

    updateIntroDrift(delta) {
        if (!this.car || !this.car.body) return;
        this.introElapsed += delta;

        const forwardAngle = this.car.rotation - Math.PI / 2;
        const rearOffset = new Phaser.Math.Vector2(
            Math.cos(forwardAngle),
            Math.sin(forwardAngle)
        ).scale(64);

        const rearX = this.car.x - rearOffset.x;
        const rearY = this.car.y - rearOffset.y;

        if (this.introSmoke) {
            this.introSmoke.setPosition(rearX, rearY);
        }

        const forwardVelocity = new Phaser.Math.Vector2(
            Math.cos(forwardAngle),
            Math.sin(forwardAngle)
        ).scale(this.introVehicleSpeed);
        const driftVector = new Phaser.Math.Vector2(
            Math.cos(this.car.rotation + Math.PI / 2),
            Math.sin(this.car.rotation + Math.PI / 2)
        ).scale(
            this.introVehicleDrift * Phaser.Math.Clamp(
                (SPAWN_INTRO.duration - this.introElapsed) / SPAWN_INTRO.fadeDuration,
                0,
                1,
            ),
        );

        this.car.setVelocity(
            forwardVelocity.x + driftVector.x,
            forwardVelocity.y + driftVector.y
        );

        const lastTrailPoint = this.introTrail[this.introTrail.length - 1];
        const trailDistance = lastTrailPoint
            ? Phaser.Math.Distance.Between(lastTrailPoint.x, lastTrailPoint.y, rearX, rearY)
            : Number.MAX_SAFE_INTEGER;

        if (trailDistance > 10) {
            this.introTrail.push({ x: rearX, y: rearY, life: 1 });
            if (this.introTrail.length > 26) {
                this.introTrail.shift();
            }
        }

        if (this.introSkidMarks) {
            this.introSkidMarks.clear();
            this.introTrail.forEach((point, index) => {
                const alpha = (index + 1) / this.introTrail.length;
                this.introSkidMarks.fillStyle(0x111111, 0.14 + alpha * 0.25);
                const size = 10 + alpha * 18;
                this.introSkidMarks.fillEllipse(point.x, point.y, size, size * 0.5);
            });
        }
    }
}
