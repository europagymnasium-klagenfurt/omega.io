// lädt alle bilder, sounds usw. und startet danach das eigentliche spiel.
// neue assets hier laden, damit sie in jeder scene verfügbar sind.

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.image("racetrack", "assets/racetrack.jpg");
        this.load.image("car", "assets/car1.png");
    }

    create() {
        this.scene.start("GameScene");
    }
}
