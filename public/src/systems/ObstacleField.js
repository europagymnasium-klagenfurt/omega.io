
import { OBSTACLES, SPEED_BOOST, WORLD_HEIGHT, WORLD_WIDTH } from "../config.js";
import { pushCarOut } from "./HitboxShapes.js";

export class ObstacleField {
    constructor(scene, car) {
        this.scene = scene;
        this.randomState = OBSTACLES.seed;
        this.group = scene.physics.add.staticGroup();
        this.placeObstacles();

        // die umrisse der hindernisse schieben das auto weg (statt arcade-collider)
        this.car = car;
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.collide, this);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.collide, this);
        });
    }

    placeObstacles() {
        for (let index = 0; index < OBSTACLES.count; index += 1) {
            const type = this.chooseType();
            const radius = Math.max(type.width, type.height) / 2;

            for (let attempt = 0; attempt < OBSTACLES.attemptsPerObstacle; attempt += 1) {
                const x = OBSTACLES.edgeMargin + radius + this.random() * (WORLD_WIDTH - 2 * (OBSTACLES.edgeMargin + radius));
                const y = OBSTACLES.edgeMargin + radius + this.random() * (WORLD_HEIGHT - 2 * (OBSTACLES.edgeMargin + radius));

                if (!this.isClear(x, y, radius)) continue;

                const obstacle = this.group.create(x, y, type.key);

                obstacle.setDisplaySize(type.width, type.height);
                obstacle.setDepth(4);

                // Physik-Body aktualisieren
                obstacle.refreshBody();

                obstacle.obstacleRadius = radius;
                break;
            }
        }
    }

    collide() {
        pushCarOut(this.car, this.group.getChildren());
    }

    isClear(x, y, radius) {
        const spawn = OBSTACLES.spawn;

        for (let index = 0; index < spawn.count; index += 1) {
            const spawnX = spawn.x + index * spawn.spacing;

            if (Math.hypot(x - spawnX, y - spawn.y) < spawn.safeRadius + radius) {
                return false;
            }
        }

        if (
            Math.hypot(x - SPEED_BOOST.x, y - SPEED_BOOST.y) <
            OBSTACLES.boostSafeRadius + radius
        ) {
            return false;
        }

        for (const obstacle of this.group.getChildren()) {
            if (
                Math.hypot(x - obstacle.x, y - obstacle.y) <
                radius + obstacle.obstacleRadius + OBSTACLES.spacing
            ) {
                return false;
            }
        }

        return true;
    }

    chooseType() {
        const totalWeight = OBSTACLES.types.reduce(
            (total, type) => total + type.weight,
            0
        );

        let selection = this.random() * totalWeight;

        for (const type of OBSTACLES.types) {
            selection -= type.weight;

            if (selection < 0) {
                return type;
            }
        }

        return OBSTACLES.types[0];
    }

    random() {
        this.randomState = (
            Math.imul(this.randomState, 1664525) + 1013904223
        ) >>> 0;

        return this.randomState / 4294967296;
    }
}
