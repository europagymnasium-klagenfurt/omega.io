// die spielwelt: baut map, eigenes auto, kamera und multiplayer zusammen.
// diese datei soll KURZ bleiben. neue features als eigene klasse in objects/ oder systems/
// schreiben und hier nur erzeugen und in update() aufrufen.

import { WORLD_WIDTH, WORLD_HEIGHT } from "../config.js";
import { PlayerCar } from "../objects/PlayerCar.js";
import { FPSCounter } from "../objects/FPSCounter.js";
import { CarCollisions } from "../systems/CarCollisions.js";
import { CollisionMessage } from "../systems/CollisionMessage.js";
import { Multiplayer } from "../systems/Multiplayer.js";
import { PlayerHud } from "../systems/PlayerHud.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "racetrack").setOrigin(0, 0);

        this.car = new PlayerCar(this, 400, 300);

        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.car, true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.fpsCounter = new FPSCounter(this);
        this.collisionMessage = new CollisionMessage(this);
        this.carCollisions = new CarCollisions(this, this.car, this.collisionMessage);
        this.playerHud = new PlayerHud(this);
        this.multiplayer = new Multiplayer(this, this.car, this.carCollisions, this.playerHud);
    }

    update(time, delta) {
        this.car.drive(this.cursors);
        this.fpsCounter.update(delta);
        this.multiplayer.sendState();
    }
}
