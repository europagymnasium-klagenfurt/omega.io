// schaden beim aufprall auf hindernisse: das eigene auto meldet den aufprall dem server.
// der server zieht die lebenspunkte ab und schickt HEALTH_CHANGED an alle (siehe PlayerHealth).

import { socket, EVENTS } from "../network.js";
import { OBSTACLE_DAMAGE } from "../config.js";

export class ObstacleDamage {
    constructor(scene, car, obstacleField, playerHealth) {
        this.playerHealth = playerHealth;
        this.nextHitTime = 0;

        // den bestehenden collider des ObstacleField mitbenutzen. ein zweiter collider würde nichts melden,
        // weil das auto vom ersten schon weggeschoben wurde und sich dann nicht mehr überlappt.
        this.collider = obstacleField.collider;
        this.collider.collideCallback = () => this.onHit(scene.time.now);
        this.collider.callbackContext = this;
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.collider.collideCallback = null; });
    }

    onHit(time) {
        if (!this.playerHealth.isAlive() || time < this.nextHitTime) return;
        this.nextHitTime = time + OBSTACLE_DAMAGE.cooldown;
        socket.emit(EVENTS.OBSTACLE_HIT);
    }
}
