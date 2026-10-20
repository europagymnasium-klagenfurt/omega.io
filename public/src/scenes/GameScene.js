// die spielwelt: baut map, eigenes auto, kamera und multiplayer zusammen.
// diese datei soll KURZ bleiben. neue features als eigene klasse in objects/ oder systems/
// schreiben und hier nur erzeugen und in update() aufrufen.

import { WORLD_WIDTH, WORLD_HEIGHT } from "../config.js";
import { PlayerCar } from "../objects/PlayerCar.js";
import { GarageAccess } from "../systems/GarageAccess.js";
import { Multiplayer } from "../systems/Multiplayer.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create(data) {
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "racetrack").setOrigin(0, 0);

        this.car = new PlayerCar(this, 400, 300, data?.vehicleKey);
        if (!data?.vehicleChangeUsed) this.garageAccess = new GarageAccess(this, this.car);

        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.car, true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.multiplayer = new Multiplayer(this, this.car);
    }

    update(time, delta) {
        this.car.drive(this.cursors);
        this.multiplayer.sendState();
    }
}
