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