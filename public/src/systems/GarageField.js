// alle garagen der welt: fährt das eigene auto hinein, öffnet sich das fahrzeug-menü.
// die lebenspunkte liegen am server und bleiben beim wechsel gleich.

import { GARAGES } from "../config.js";
import { Garage } from "../objects/Garage.js";

export class GarageField {
    constructor(scene, car, playerHealth, multiplayer, playerName) {
        this.scene = scene;
        this.car = car;
        this.playerHealth = playerHealth;
        this.multiplayer = multiplayer;
        this.playerName = playerName;
        this.garages = GARAGES.list.map((data) => new Garage(scene, data));
        for (const garage of this.garages) scene.physics.add.collider(car, garage.walls);
        this.entering = false;
        this.armed = null;   // wird gesetzt, sobald der server die startposition geschickt hat
    }

    update() {
        // sperre nach dem letzten garagenbesuch (gilt für alle garagen)
        const readyAt = this.scene.registry.get("garageReadyAt") ?? 0;
        const lockedSeconds = Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
        for (const garage of this.garages) garage.setLockedSeconds(lockedSeconds);

        if (this.entering || !this.multiplayer.playerId || !this.playerHealth.isAlive()) return;

        const inside = this.garages.some((garage) => garage.contains(this.car));
        // nach dem wechsel steht das auto noch in der garage: erst wieder einfahren, wenn es draußen war
        if (this.armed === null) this.armed = !inside;
        if (!inside) this.armed = true;
        if (inside && this.armed && lockedSeconds === 0) this.enter();
    }

    enter() {
        this.entering = true;
        this.car.setVelocity(0, 0);
        this.scene.cameras.main.fadeOut(GARAGES.enterDelay);
        this.scene.time.delayedCall(GARAGES.enterDelay, () => {
            this.scene.scene.start("MenuScene", {
                vehicleKey: this.car.texture.key,
                playerName: this.playerName,
                fromGarage: true,
            });
        });
    }
}
