// alle raketen-items auf der karte: einsammeln füllt das inventar (verwaltet hier den vorrat)
// und zeigt den slot unten links mit der taste 1 und der anzahl an.

import { socket, EVENTS } from "../network.js";
import { ROCKET, ROCKET_HUD, VIEW_HEIGHT } from "../config.js";
import { RocketPickup } from "../objects/RocketPickup.js";

export class RocketPickupField {
    constructor(scene, car) {
        this.scene = scene;
        this.car = car;
        this.ammo = 0;
        this.pendingPickupId = null;
        this.retryTimer = null;

        this.pickups = ROCKET.pickupPositions.map((position, index) => new RocketPickup(scene, index, position));
        this.overlaps = this.pickups.map((pickup) =>
            scene.physics.add.overlap(car, pickup, () => this.requestPickup(pickup)));

        this.handlers = {
            [EVENTS.INIT]: (data) => this.onInit(data),
            [EVENTS.ROCKET_PICKUP_TAKEN]: (data) => this.setAvailable(data.pickupId, false),
            [EVENTS.ROCKET_PICKUP_RESPAWNED]: (data) => this.setAvailable(data.pickupId, true),
            [EVENTS.ROCKET_PICKUP_REJECTED]: (data) => this.onRejected(data.pickupId),
            [EVENTS.ROCKET_GRANTED]: () => this.addAmmo(),
        };
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.on(event, handler);
        }

        this.buildInventoryUi();
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    // welche pickups beim beitritt schon vergeben sind, vom server übernehmen
    onInit(data) {
        for (const pickupId of data.rocketPickupsTaken ?? []) this.setAvailable(pickupId, false);
    }

    requestPickup(pickup) {
        if (this.pendingPickupId !== null || !pickup.visible || this.ammo >= ROCKET.maxAmmo) return;

        this.pendingPickupId = pickup.pickupId;
        this.setAvailable(pickup.pickupId, false);
        socket.emit(EVENTS.ROCKET_PICKUP, { pickupId: pickup.pickupId });
    }

    onRejected(pickupId) {
        this.pendingPickupId = null;
        this.retryTimer = this.scene.time.delayedCall(ROCKET.retryDelay, () => this.setAvailable(pickupId, true));
    }

    addAmmo() {
        this.pendingPickupId = null;
        this.ammo = Math.min(ROCKET.maxAmmo, this.ammo + 1);
        this.updateUi();
    }

    // von RocketLauncher beim abschuss aufgerufen. gibt zurück, ob überhaupt eine rakete da war.
    useAmmo() {
        if (this.ammo <= 0) return false;
        this.ammo -= 1;
        this.updateUi();
        return true;
    }

    setAvailable(pickupId, available) {
        const pickup = this.pickups[pickupId];
        if (!pickup) return;
        pickup.setVisible(available);
        pickup.body.enable = available;
    }

    // inventar-slot unten links: hintergrund, raketen-symbol, tastenhinweis "1" und anzahl
    buildInventoryUi() {
        const x = ROCKET_HUD.x;
        const y = VIEW_HEIGHT - ROCKET_HUD.margin - ROCKET_HUD.size;

        this.slotBackground = this.scene.add.rectangle(x, y, ROCKET_HUD.size, ROCKET_HUD.size, ROCKET_HUD.backgroundColor, ROCKET_HUD.backgroundAlpha)
            .setOrigin(0)
            .setStrokeStyle(2, ROCKET_HUD.borderColor)
            .setScrollFactor(0)
            .setDepth(ROCKET_HUD.depth);

        this.slotIcon = this.scene.add.image(x + ROCKET_HUD.size / 2, y + ROCKET_HUD.size / 2, "rocket")
            .setDisplaySize(ROCKET_HUD.size * 0.55, ROCKET_HUD.size * 0.55)
            .setScrollFactor(0)
            .setDepth(ROCKET_HUD.depth + 1);

        this.keyLabel = this.scene.add.text(x + 4, y + 2, "1", {
            color: "#ffffff",
            fontSize: `${ROCKET_HUD.keyFontSize}px`,
            fontStyle: "bold",
        }).setScrollFactor(0).setDepth(ROCKET_HUD.depth + 1);

        this.countLabel = this.scene.add.text(x + ROCKET_HUD.size - 6, y + ROCKET_HUD.size - 4, "0", {
            color: "#ffffff",
            fontSize: `${ROCKET_HUD.countFontSize}px`,
            fontStyle: "bold",
        }).setOrigin(1, 1).setScrollFactor(0).setDepth(ROCKET_HUD.depth + 1);

        this.updateUi();
    }

    updateUi() {
        this.countLabel.setText(String(this.ammo));
        this.slotIcon.setAlpha(this.ammo > 0 ? 1 : ROCKET_HUD.emptyAlpha);
    }

    destroy() {
        for (const [event, handler] of Object.entries(this.handlers)) {
            socket.off(event, handler);
        }
        for (const overlap of this.overlaps) overlap.destroy();
        this.retryTimer?.remove(false);
        for (const pickup of this.pickups) pickup.destroy();
        this.slotBackground.destroy();
        this.slotIcon.destroy();
        this.keyLabel.destroy();
        this.countLabel.destroy();
    }
}
