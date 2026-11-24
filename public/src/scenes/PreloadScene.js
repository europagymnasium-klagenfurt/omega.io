// lädt alle bilder, sounds usw. und startet danach das eigentliche spiel.
// neue assets hier laden, damit sie in jeder scene verfügbar sind.

import { ALL_VEHICLES } from "/shared/vehicles.js";
import { SPEED_BOOST, MACHINE_GUN, OBSTACLES, MINE } from "../config.js";

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
        this.load.audio("startEngine", "assets/Start.mp3");
        this.load.image("car", "assets/car1.png");
        this.load.image("starParticle", "assets/starparticle.png");
        this.load.image("speedBoost", "assets/velo.webp");
        for (const obstacle of OBSTACLES.types) {
            this.load.image(obstacle.key, `assets/${obstacle.asset}`);
        }
    }

    create() {
        const textureSize = SPEED_BOOST.smokeTextureSize;
        const smokeTexture = this.textures.createCanvas("boostSmoke", textureSize, textureSize);
        const context = smokeTexture.getContext();
        const gradient = context.createRadialGradient(
            textureSize / 2,
            textureSize / 2,
            0,
            textureSize / 2,
            textureSize / 2,
            textureSize / 2,
        );
        gradient.addColorStop(0, "rgba(95, 95, 95, 0.7)");
        gradient.addColorStop(0.45, "rgba(125, 125, 125, 0.35)");
        gradient.addColorStop(1, "rgba(155, 155, 155, 0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, textureSize, textureSize);
        smokeTexture.refresh();

        // kleiner runder punkt für das maschinengewehr
        const bulletSize = MACHINE_GUN.bulletSize;
        const bulletGraphics = this.make.graphics({}, false);
        bulletGraphics.fillStyle(MACHINE_GUN.bulletColor, 1);
        bulletGraphics.fillCircle(bulletSize / 2, bulletSize / 2, bulletSize / 2);
        bulletGraphics.generateTexture("bullet", bulletSize, bulletSize);
        bulletGraphics.destroy();

        // mine: dunkle scheibe mit rotem punkt
        const mineGraphics = this.make.graphics({}, false);
        mineGraphics.fillStyle(0x222222, 1);
        mineGraphics.fillCircle(MINE.size / 2, MINE.size / 2, MINE.size / 2);
        mineGraphics.fillStyle(0xff2222, 1);
        mineGraphics.fillCircle(MINE.size / 2, MINE.size / 2, MINE.size / 5);
        mineGraphics.generateTexture("mine", MINE.size, MINE.size);
        mineGraphics.destroy();

        this.scene.start("MenuScene");
    }
}
