// die spielwelt: baut map, eigenes auto, kamera und multiplayer zusammen.
// diese datei soll KURZ bleiben. neue features als eigene klasse in objects/ oder systems/
// schreiben und hier nur erzeugen und in update() aufrufen.

import { WORLD_WIDTH, WORLD_HEIGHT, CONTROLS } from "../config.js";
import { PlayerCar } from "../objects/PlayerCar.js";
import { GarageAccess } from "../systems/GarageAccess.js";
import { FPSCounter } from "../objects/FPSCounter.js";
import { CarCollisions } from "../systems/CarCollisions.js";
import { CollisionMessage } from "../systems/CollisionMessage.js";
import { Multiplayer } from "../systems/Multiplayer.js";
import { SpeedBoost } from "../systems/SpeedBoost.js";
import { PlayerHud } from "../systems/PlayerHud.js";
import { MachineGun } from "../systems/MachineGun.js";
import { PlayerHealth } from "../systems/PlayerHealth.js";

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
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.cursors = this.input.keyboard.addKeys(CONTROLS);   // WASD, gleiche namen wie die pfeiltasten

        this.speedBoost = new SpeedBoost(this, this.car);
        this.fpsCounter = new FPSCounter(this);
        this.collisionMessage = new CollisionMessage(this);
        this.carCollisions = new CarCollisions(this, this.car, this.collisionMessage);
        this.playerHud = new PlayerHud(this);
        this.multiplayer = new Multiplayer(this, this.car, this.carCollisions, this.playerHud);
        this.playerHealth = new PlayerHealth(this, this.car, this.multiplayer);   // nach multiplayer, braucht dessen autos
        this.machineGun = new MachineGun(this, this.car, this.multiplayer, this.playerHealth);
    }

    update(time, delta) {
        this.car.drive(this.cursors, this.shiftKey);
        if (this.playerHealth.isAlive()) this.car.drive(this.cursors);
        this.machineGun.update(time);
        this.fpsCounter.update(delta);
        this.multiplayer.sendState();
    }
}
