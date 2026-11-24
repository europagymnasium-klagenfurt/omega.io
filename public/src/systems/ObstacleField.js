
import { GARAGES, OBSTACLES, REPAIR_KIT, SPEED_BOOST, WORLD_HEIGHT, WORLD_WIDTH } from "../config.js";

export class ObstacleField {
    constructor(scene, car) {
        this.scene = scene;
        this.randomState = OBSTACLES.seed;
        this.group = scene.physics.add.staticGroup();
        this.placeObstacles();
        this.collider = scene.physics.add.collider(car, this.group);
    }

    // die welt wird in felder geteilt und die hindernisse auf zufällige felder verteilt.
    // so liegen sie gleichmäßig verteilt und nicht an einer stelle zusammengeklumpt.
    placeObstacles() {
        const cellWidth = WORLD_WIDTH / OBSTACLES.gridColumns;
        const cellHeight = WORLD_HEIGHT / OBSTACLES.gridRows;
        const cells = [];

        for (let column = 0; column < OBSTACLES.gridColumns; column += 1) {
            for (let row = 0; row < OBSTACLES.gridRows; row += 1) {
                cells.push({ left: column * cellWidth, top: row * cellHeight });
            }
        }
        this.shuffle(cells);

        for (const cell of cells.slice(0, OBSTACLES.count)) {
            const type = this.chooseType();
            const radius = Math.max(type.width, type.height) / 2;
            const minX = Math.max(cell.left, OBSTACLES.edgeMargin + radius);
            const maxX = Math.min(cell.left + cellWidth, WORLD_WIDTH - OBSTACLES.edgeMargin - radius);
            const minY = Math.max(cell.top, OBSTACLES.edgeMargin + radius);
            const maxY = Math.min(cell.top + cellHeight, WORLD_HEIGHT - OBSTACLES.edgeMargin - radius);
            if (minX >= maxX || minY >= maxY) continue;

            for (let attempt = 0; attempt < OBSTACLES.attemptsPerObstacle; attempt += 1) {
                const x = minX + this.random() * (maxX - minX);
                const y = minY + this.random() * (maxY - minY);

                if (!this.isClear(x, y, radius)) continue;

                const obstacle = this.group.create(x, y, type.key);

                obstacle.setDisplaySize(type.width, type.height);
                obstacle.setDepth(4);

                // Physik-Body aktualisieren
                obstacle.refreshBody();

                // Hitbox auf 70 % verkleinern
                obstacle.body.setSize(
                    type.bodyWidth * 0.7,
                    type.bodyHeight * 0.7,
                    true
                );

                obstacle.obstacleRadius = radius;
                break;
            }
        }
    }

    // zufällig mischen (mit dem festen seed, damit alle spieler dieselbe karte sehen)
    shuffle(list) {
        for (let index = list.length - 1; index > 0; index -= 1) {
            const other = Math.floor(this.random() * (index + 1));
            [list[index], list[other]] = [list[other], list[index]];
        }
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

        // um die reparatur-kits bleibt platz
        for (const kit of REPAIR_KIT.positions) {
            if (Math.hypot(x - kit.x, y - kit.y) < REPAIR_KIT.safeRadius + radius) {
                return false;
            }
        }

        // garagen und ihre einfahrt freihalten
        for (const garage of GARAGES.list) {
            if (Math.hypot(x - garage.x, y - garage.y) < GARAGES.width / 2 + GARAGES.safeMargin + radius) {
                return false;
            }
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
