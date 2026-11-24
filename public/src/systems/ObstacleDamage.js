// schaden beim aufprall auf hindernisse: das eigene auto meldet den aufprall dem server.
// der server zieht die lebenspunkte ab und schickt HEALTH_CHANGED an alle (siehe PlayerHealth).

import { socket, EVENTS } from "../network.js";
import { OBSTACLE_DAMAGE } from "../config.js";

export class ObstacleDamage {
    constructor(scene, car, obstacleField, playerHealth) {
        this.playerHealth = playerHealth;
        this.nextHitTime = 0;

        // das ObstacleField meldet jede berührung mit den umrissen der hindernisse
        obstacleField.onHit = () => this.onHit(scene.time.now);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { obstacleField.onHit = null; });
    }

    onHit(time) {
        if (!this.playerHealth.isAlive() || time < this.nextHitTime) return;
        this.nextHitTime = time + OBSTACLE_DAMAGE.cooldown;
        socket.emit(EVENTS.OBSTACLE_HIT);
    }
}
