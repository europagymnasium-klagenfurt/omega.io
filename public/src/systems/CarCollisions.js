import { pushCarOut } from "./HitboxShapes.js";

// eigenes auto gegen die autos der anderen spieler. die umrisse der autos (siehe HitboxShapes) schieben sich weg.
export class CarCollisions {
    constructor(scene, localCar, collisionMessage) {
        this.scene = scene;
        this.localCar = localCar;
        this.collisionMessage = collisionMessage;
        this.remoteCars = new Map();
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
    }

    addRemoteCar(remoteCar) {
        this.remoteCars.set(remoteCar.playerId, remoteCar);
    }

    removeRemoteCar(playerId) {
        this.remoteCars.delete(playerId);
    }

    // nach jedem physik-schritt: aus berührten autos herausschieben
    update() {
        if (pushCarOut(this.localCar, this.remoteCars.values())) this.collisionMessage.show();
    }

    destroy() {
        this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
        this.remoteCars.clear();
    }
}
