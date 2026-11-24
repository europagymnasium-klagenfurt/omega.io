// zusammenstöße zwischen dem eigenen auto und anderen autos: zeigt die nachricht
// und meldet den zusammenstoß dem server (CAR_CRASH). der server zieht den schaden ab.

import { socket, EVENTS } from "../network.js";

export class CarCollisions {
    constructor(scene, localCar, collisionMessage) {
        this.scene = scene;
        this.localCar = localCar;
        this.collisionMessage = collisionMessage;
        this.colliders = new Map();
    }

    addRemoteCar(remoteCar) {
        const collider = this.scene.physics.add.collider(this.localCar, remoteCar, () => {
            this.collisionMessage.show();
            socket.emit(EVENTS.CAR_CRASH, { targetId: remoteCar.playerId });
        });
        this.colliders.set(remoteCar.playerId, collider);
    }

    removeRemoteCar(playerId) {
        this.colliders.get(playerId)?.destroy();
        this.colliders.delete(playerId);
    }

    destroy() {
        for (const collider of this.colliders.values()) {
            collider.destroy();
        }
        this.colliders.clear();
    }
}