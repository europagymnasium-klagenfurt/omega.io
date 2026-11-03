// maschinengewehr: solange die LINKE MAUSTASTE gedrückt ist, schießt das eigene auto.
// eigene schüsse werden an den server geschickt, schüsse der anderen kommen vom server.
// trifft ein EIGENER schuss ein anderes auto, meldet das der client dem server (HIT).
// der server zieht die lebenspunkte ab und schickt HEALTH_CHANGED an alle (siehe PlayerHealth).

import { socket, EVENTS } from "../network.js";
import { MACHINE_GUN } from "../config.js";
import { Bullet } from "../objects/Bullet.js";

export class MachineGun {
    constructor(scene, car, multiplayer, playerHealth) {
        this.scene = scene;
        this.car = car;
        this.multiplayer = multiplayer;
        this.playerHealth = playerHealth;
        this.nextShotTime = 0;
        this.bullets = scene.physics.add.group();   // alle schüsse (eigene und fremde)

        this.handlers = {
            [EVENTS.SHOT_FIRED]: (data) => this.spawnBullet(data.x, data.y, data.vx, data.vy, data.id),
        };

        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // wird jeden frame von der scene aufgerufen
    update(time) {
        this.checkHits();

        const firing = this.scene.input.activePointer.leftButtonDown() && this.playerHealth.isAlive();
        if (!firing || time < this.nextShotTime) return;
        this.nextShotTime = time + MACHINE_GUN.fireRate;

        const angle = this.car.rotation - Math.PI / 2;   // das bild zeigt nach oben, phaser rechnet ab "rechts"
        const distance = this.car.displayHeight / 2 + MACHINE_GUN.muzzleOffset;
        const x = this.car.x + Math.cos(angle) * distance;
        const y = this.car.y + Math.sin(angle) * distance;

        // schussgeschwindigkeit + autogeschwindigkeit, sonst fährt man beim schießen in die eigenen schüsse
        const vx = Math.cos(angle) * MACHINE_GUN.bulletSpeed + this.car.body.velocity.x;
        const vy = Math.sin(angle) * MACHINE_GUN.bulletSpeed + this.car.body.velocity.y;

        this.spawnBullet(x, y, vx, vy);
        socket.emit(EVENTS.SHOOT, { x, y, vx, vy });
    }

    checkHits() {
        // fremde schüsse, die das eigene auto treffen, nur verschwinden lassen.
        // den treffer meldet der schütze selbst.
        this.scene.physics.overlap(this.car, this.bullets, (a, b) => {
            const bullet = a instanceof Bullet ? a : b;
            if (bullet.ownerId !== null) bullet.destroy();
        });

        for (const remoteCar of Object.values(this.multiplayer.remoteCars)) {
            this.scene.physics.overlap(remoteCar, this.bullets, (a, b) => {
                const bullet = a instanceof Bullet ? a : b;
                if (bullet.ownerId === remoteCar.playerId) return;   // eigenes auto trifft man nicht

                if (bullet.ownerId === null) socket.emit(EVENTS.HIT, { targetId: remoteCar.playerId });
                bullet.destroy();
            });
        }
    }

    spawnBullet(x, y, vx, vy, ownerId = null) {
        const bullet = new Bullet(this.scene, x, y, ownerId);
        this.bullets.add(bullet);
        bullet.fire(vx, vy);
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
