// reparatur-kits an festen punkten der map. fährt ein verletztes auto drüber, fragt der client den server.
// der server prüft alles, gibt die lebenspunkte zurück (HEALTH_CHANGED) und meldet das kit als eingesammelt.

import { socket, EVENTS } from "../network.js";
import { REPAIR_KIT } from "../config.js";

export class RepairKits {
    constructor(scene, car, playerHealth) {
        this.scene = scene;
        this.car = car;
        this.playerHealth = playerHealth;

        this.kits = REPAIR_KIT.positions.map((position) => this.createKit(position));

        this.handlers = {
            [EVENTS.INIT]: (data) => data.repairClaimed.forEach((claimed, index) => this.setAvailable(index, !claimed)),
            [EVENTS.REPAIR_TAKEN]: (data) => {
                this.showPickupEffect(data.index);
                this.setAvailable(data.index, false);
            },
            [EVENTS.REPAIR_RESPAWNED]: (data) => this.setAvailable(data.index, true),
            [EVENTS.REPAIR_REJECTED]: (data) => this.onRejected(data.index),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // weißes feld mit rotem kreuz
    createKit(position) {
        const size = REPAIR_KIT.size;
        const graphics = this.scene.add.graphics().setPosition(position.x, position.y).setDepth(REPAIR_KIT.depth);
        graphics.fillStyle(0x000000, 0.25);
        graphics.fillRoundedRect(-size / 2 + 4, -size / 2 + 6, size, size, 10);
        graphics.fillStyle(REPAIR_KIT.color, 1);
        graphics.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
        graphics.fillStyle(REPAIR_KIT.crossColor, 1);
        graphics.fillRect(-size * 0.11, -size * 0.32, size * 0.22, size * 0.64);
        graphics.fillRect(-size * 0.32, -size * 0.11, size * 0.64, size * 0.22);

        // sanftes pulsieren
        this.scene.tweens.add({ targets: graphics, scale: 1.1, duration: 700, yoyo: true, repeat: -1, ease: "Sine.InOut" });

        return { x: position.x, y: position.y, graphics, available: true, pending: false, retryAt: 0 };
    }

    setAvailable(index, available) {
        const kit = this.kits[index];
        if (!kit) return;
        kit.available = available;
        kit.pending = false;
        kit.graphics.setVisible(available);
    }

    // abgelehnt (z.b. server kennt die neue position noch nicht): nach kurzer pause nochmal versuchen
    onRejected(index) {
        const kit = this.kits[index];
        if (!kit) return;
        kit.pending = false;
        kit.retryAt = this.scene.time.now + REPAIR_KIT.retryDelay;
    }

    // kleiner ring, der sich ausbreitet, wenn ein kit eingesammelt wurde
    showPickupEffect(index) {
        const kit = this.kits[index];
        if (!kit) return;
        const ring = this.scene.add.circle(kit.x, kit.y, REPAIR_KIT.size / 2, REPAIR_KIT.crossColor, 0.5).setDepth(REPAIR_KIT.depth);
        this.scene.tweens.add({ targets: ring, scale: 3, alpha: 0, duration: 500, onComplete: () => ring.destroy() });
    }

    // wird jeden frame von der scene aufgerufen
    update(time) {
        const hurt = this.car.healthBar.health < this.car.healthBar.maxHealth;
        if (!hurt || !this.playerHealth.isAlive()) return;

        this.kits.forEach((kit, index) => {
            if (!kit.available || kit.pending || time < kit.retryAt) return;
            if (Math.hypot(this.car.x - kit.x, this.car.y - kit.y) > REPAIR_KIT.pickupRadius * REPAIR_KIT.clientFactor) return;

            kit.pending = true;
            socket.emit(EVENTS.REPAIR_PICKUP, { index });
        });
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
    }
}
