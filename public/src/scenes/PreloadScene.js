// lädt alle bilder, sounds usw. und startet danach das eigentliche spiel.
// neue assets hier laden, damit sie in jeder scene verfügbar sind.

import { ALL_VEHICLES } from "/shared/vehicles.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.image("racetrack", "assets/racetrack.jpg");
        this.load.image("garage-background", "assets/u927nltrsmug1.png");
        for (const vehicle of ALL_VEHICLES) {
            this.load.image(vehicle.key, `assets/${vehicle.image}`);
        }
    }

    create() {
        this.scene.start("MenuScene");
    }
}
