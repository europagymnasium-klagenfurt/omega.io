import { EXHAUST_SMOKE } from "../config.js";

export class ExhaustSmoke {
    constructor(scene, car) {
        this.car = car;
        this.isEmitting = false;
        this.emitter = scene.add.particles(car.x, car.y, "boostSmoke", {
            speed: EXHAUST_SMOKE.speed,
            angle: { min: 0, max: 360 },
            scale: EXHAUST_SMOKE.scale,
            alpha: EXHAUST_SMOKE.alpha,
            lifespan: EXHAUST_SMOKE.lifespan,
            quantity: EXHAUST_SMOKE.quantity,
            frequency: EXHAUST_SMOKE.frequency,
            maxParticles: 80,
        });
        this.emitter.setDepth(15);
        this.emitter.stop();
    }

    update(isAccelerating) {
        const forwardAngle = this.car.rotation - Math.PI / 2;
        const rearX = this.car.x - Math.cos(forwardAngle) * EXHAUST_SMOKE.rearOffset;
        const rearY = this.car.y - Math.sin(forwardAngle) * EXHAUST_SMOKE.rearOffset;

        this.emitter.setPosition(rearX, rearY);
        this.emitter.setParticleSpeed(
            -Math.cos(forwardAngle) * EXHAUST_SMOKE.speed,
            -Math.sin(forwardAngle) * EXHAUST_SMOKE.speed,
        );

        if (isAccelerating && !this.isEmitting) {
            this.emitter.start();
            this.isEmitting = true;
        } else if (!isAccelerating && this.isEmitting) {
            this.emitter.stop();
            this.isEmitting = false;
        }
    }

    destroy() {
        this.emitter.destroy();
    }
}