// hier wird ein phaser spiel erstellt und mit socket.io verbunden
// wir erstellen zuerst eine scene mit create und update, laden racetrack.jpg als tilesprite
// und erstellen ein auto als sprite, das sich mit den pfeiltasten bewegen lässt
// wir verbinden das spiel mit socket.io, damit wir die position des autos an den server senden können
// und die position des autos von anderen Spielern empfangen können


const socket = io();

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 800;
const WORLD_WIDTH = VIEW_WIDTH * 2;
const WORLD_HEIGHT = VIEW_HEIGHT * 2;

// konstanten für die rotation und die geschwindigkeit des autos
const rotationSpeed = 150;
const speed = 600;


class OmegaIo extends Phaser.Scene {
    preload() {
        this.load.image("racetrack", "assets/racetrack.jpg");
        this.load.image("car", "assets/car1.png");
    }

    create() {
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "racetrack").setOrigin(0, 0);

        this.car = this.physics.add.sprite(400, 300, 'car').setCollideWorldBounds(true).setScale(0.5);
        this.car.setAngle(90);
        this.car.setCircle(50, 14, 65);

        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.car, true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.remoteCars = {};

        this.setupMultiplayer();
    }

    update(time, delta) {
        // Bewegung des Autos mit den Pfeiltasten. links und rechts rotieren die Grafik, die Hitbox bleibt axis-aligned.

        if (this.cursors.left.isDown) {
            this.car.setAngularVelocity(-rotationSpeed)   
        }
        else if (this.cursors.right.isDown) {
            this.car.setAngularVelocity(rotationSpeed)
        }
        else {
            this.car.setAngularVelocity(0)
        }

        const angle = this.car.rotation - Math.PI / 2;
       
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(angle, speed, this.car.body.velocity);  // geschwindigkeit aus der rotation berechnen
        } else if (this.cursors.down.isDown) {
            this.physics.velocityFromRotation(angle, -speed, this.car.body.velocity);  // geschwindigkeit aus der rotation berechnen
        } else {
            this.car.body.velocity.scale(0.97);  // geschwindigkeit verringern
        }

        socket.emit("update", {x: this.car.x, y: this.car.y, angle: this.car.angle});  // position und winkel an den server senden

    }

    addRemoteCar(player) {
        if (player.id === this.playerId || this.remoteCars[player.id]) return;   // eigene id, oder player id gibt es schon

        const car = this.add.sprite(player.x, player.y, "car").setScale(0.5);
        car.setAngle(player.angle);
        car.setTint(player.color);
        this.remoteCars[player.id] = car;   // remote car in das lokale objekt remoteCars speichern
    }

    removeRemoteCar(id) {   // car lokal entfernen
        if (this.remoteCars[id]) {
            this.remoteCars[id].destroy();
            delete this.remoteCars[id];
        }
    }

    setupMultiplayer() {
        socket.emit("ready");

        socket.on("init", (data) => {
            this.playerId = data.id;
            this.players = data.players;
            
            // hier übernehmen wir für unser car die position und den winkel und die farbe die wir vom server erhalten
            const playerData = this.players[this.playerId];
            this.car.setPosition(playerData.x, playerData.y);
            this.car.setAngle(playerData.angle);
            this.car.setTint(playerData.color);

            for (const player of Object.values(data.players)) {
                this.addRemoteCar(player);
            }
        });

        socket.on("playerJoined", (player) => {
            this.addRemoteCar(player);
        });

        socket.on("playerLeft", (data) => {
            this.removeRemoteCar(data.id);
        });

        socket.on("playerMoved", (data) => {
            const car = this.remoteCars[data.id];
            if (car) {
                car.setPosition(data.x, data.y);
                car.setAngle(data.angle);
            }
        });
    }



}

new Phaser.Game({
    type: Phaser.AUTO,
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    scene: OmegaIo,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
});



