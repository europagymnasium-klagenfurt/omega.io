// umriss-hitboxen: die hitbox folgt genau der außenlinie der sichtbaren pixel eines bildes.
// arcade-physik kennt nur kreise und rechtecke, darum wird hier selbst geprüft und herausgeschoben.

import { HITBOX } from "../config.js";

const outlines = new Map();   // textur-key -> umrisse in bild-pixeln
const shapes = new Map();     // textur-key + größe -> vereinfachte, verdichtete umrisse

// ---------- umriss aus dem bild lesen ----------

// verfolgt die außenkanten aller sichtbaren flächen. ergebnis: liste von umrissen [{x, y}, ...] in bild-pixeln,
// jeder umriss läuft so, dass das innere rechts von der laufrichtung liegt.
function traceOutlines(scene, key) {
    const image = scene.textures.get(key).getSourceImage();
    const step = Math.max(1, Math.max(image.width, image.height) / HITBOX.maskResolution);
    const gridWidth = Math.ceil(image.width / step);
    const gridHeight = Math.ceil(image.height / step);
    const cellWidth = image.width / gridWidth;
    const cellHeight = image.height / gridHeight;

    const canvas = document.createElement("canvas");
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, gridWidth, gridHeight);
    const pixels = context.getImageData(0, 0, gridWidth, gridHeight).data;

    const filled = (x, y) => x >= 0 && y >= 0 && x < gridWidth && y < gridHeight
        && pixels[(y * gridWidth + x) * 4 + 3] >= HITBOX.alphaThreshold;

    // jede sichtbare zelle bekommt an jeder seite zu einer leeren zelle eine kante (innen = rechts)
    const stride = gridWidth + 1;
    const outgoing = new Map();   // ecke -> kanten, die dort starten
    const addEdge = (x0, y0, x1, y1) => {
        const from = y0 * stride + x0;
        if (!outgoing.has(from)) outgoing.set(from, []);
        outgoing.get(from).push({ to: y1 * stride + x1, used: false });
    };
    for (let y = 0; y < gridHeight; y += 1) {
        for (let x = 0; x < gridWidth; x += 1) {
            if (!filled(x, y)) continue;
            if (!filled(x, y - 1)) addEdge(x, y, x + 1, y);
            if (!filled(x + 1, y)) addEdge(x + 1, y, x + 1, y + 1);
            if (!filled(x, y + 1)) addEdge(x + 1, y + 1, x, y + 1);
            if (!filled(x - 1, y)) addEdge(x, y + 1, x, y);
        }
    }

    // kanten zu geschlossenen umrissen verbinden
    const loops = [];
    for (const [start, edges] of outgoing) {
        for (const first of edges) {
            if (first.used) continue;
            const corners = [];
            let from = start;
            let edge = first;
            while (edge) {
                edge.used = true;
                corners.push(from);
                const to = edge.to;
                const dx = (to % stride) - (from % stride);
                const dy = Math.floor(to / stride) - Math.floor(from / stride);

                // an engen stellen am stärksten nach rechts abbiegen, damit die fläche zusammenbleibt
                let next = null;
                let bestTurn = -Infinity;
                for (const candidate of outgoing.get(to) ?? []) {
                    if (candidate.used) continue;
                    const ex = (candidate.to % stride) - (to % stride);
                    const ey = Math.floor(candidate.to / stride) - Math.floor(to / stride);
                    const turn = dx * ey - dy * ex;
                    if (turn > bestTurn) {
                        bestTurn = turn;
                        next = candidate;
                    }
                }
                from = to;
                edge = next;
            }
            loops.push(corners.map((corner) => ({
                x: (corner % stride) * cellWidth,
                y: Math.floor(corner / stride) * cellHeight,
            })));
        }
    }

    // nur äußere umrisse (positive fläche) behalten, winzige reste weglassen. löcher haben negative fläche.
    const areas = loops.map(areaOf);
    const biggest = Math.max(...areas, 0);
    return loops.filter((loop, index) => areas[index] > 0 && areas[index] >= biggest * HITBOX.minPartArea);
}

function areaOf(points) {
    let sum = 0;
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        sum += a.x * b.y - b.x * a.y;
    }
    return sum / 2;
}

// ---------- vereinfachen (Douglas-Peucker) ----------

function distanceToSegment(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    let t = lengthSquared ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function simplifyChain(points, tolerance) {
    if (points.length < 3) return points;
    const first = points[0];
    const last = points[points.length - 1];
    let maxDistance = 0;
    let index = 0;
    for (let i = 1; i < points.length - 1; i += 1) {
        const distance = distanceToSegment(points[i], first, last);
        if (distance > maxDistance) {
            maxDistance = distance;
            index = i;
        }
    }
    if (maxDistance <= tolerance) return [first, last];
    const left = simplifyChain(points.slice(0, index + 1), tolerance);
    const right = simplifyChain(points.slice(index), tolerance);
    return left.slice(0, -1).concat(right);
}

function simplifyLoop(points, tolerance) {
    // geschlossen: am weitesten entfernten punkt als zweiten ankerpunkt nehmen
    let far = 0;
    let farDistance = 0;
    for (let i = 1; i < points.length; i += 1) {
        const distance = Math.hypot(points[i].x - points[0].x, points[i].y - points[0].y);
        if (distance > farDistance) {
            farDistance = distance;
            far = i;
        }
    }
    if (far === 0) return points;
    const firstHalf = simplifyChain(points.slice(0, far + 1), tolerance);
    const secondHalf = simplifyChain(points.slice(far).concat(points[0]), tolerance);
    return firstHalf.slice(0, -1).concat(secondHalf.slice(0, -1));
}

// zwischenpunkte einfügen, damit nirgends mehr als pointSpacing (welt-pixel) zwischen zwei punkten liegt.
// ergebnis flach: [x0, y0, x1, y1, ...] in bild-pixeln
function densify(points, scale) {
    const maxGap = HITBOX.pointSpacing / scale;
    const flat = [];
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const parts = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / maxGap));
        for (let part = 0; part < parts; part += 1) {
            flat.push(a.x + (b.x - a.x) * part / parts, a.y + (b.y - a.y) * part / parts);
        }
    }
    return Float64Array.from(flat);
}

function getShape(scene, key, scale) {
    const id = `${key}@${scale.toFixed(4)}`;
    if (shapes.has(id)) return shapes.get(id);

    if (!outlines.has(key)) outlines.set(key, traceOutlines(scene, key));
    const tolerance = HITBOX.tolerance / scale;
    const polygons = outlines.get(key).map((loop) => densify(simplifyLoop(loop, tolerance), scale));
    shapes.set(id, polygons);
    return polygons;
}

// ---------- umriss in die spielwelt setzen ----------

// weltkoordinaten des umrisses eines sprites (mit position, drehung, größe und drehpunkt).
// statische sprites (hindernisse, item) werden nur einmal berechnet.
export function getWorldShape(sprite) {
    const isStatic = sprite.body instanceof Phaser.Physics.Arcade.StaticBody;
    if (isStatic && sprite.hitboxShape) return sprite.hitboxShape;

    const scaleX = Math.abs(sprite.scaleX);
    const scaleY = Math.abs(sprite.scaleY);
    const local = getShape(sprite.scene, sprite.texture.key, (scaleX + scaleY) / 2);
    const cos = Math.cos(sprite.rotation);
    const sin = Math.sin(sprite.rotation);
    const originX = sprite.originX * sprite.width;
    const originY = sprite.originY * sprite.height;

    let radius = 0;
    const polygons = local.map((points) => {
        const world = new Float64Array(points.length);
        for (let i = 0; i < points.length; i += 2) {
            const u = (points[i] - originX) * scaleX;
            const v = (points[i + 1] - originY) * scaleY;
            world[i] = sprite.x + u * cos - v * sin;
            world[i + 1] = sprite.y + u * sin + v * cos;
            radius = Math.max(radius, Math.hypot(u, v));
        }
        return world;
    });

    const shape = { x: sprite.x, y: sprite.y, radius, polygons };
    if (isStatic) sprite.hitboxShape = shape;
    return shape;
}

function translate(shape, dx, dy) {
    shape.x += dx;
    shape.y += dy;
    for (const points of shape.polygons) {
        for (let i = 0; i < points.length; i += 2) {
            points[i] += dx;
            points[i + 1] += dy;
        }
    }
}

// ---------- tests ----------

function contains(points, px, py) {
    let inside = false;
    for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
        const xi = points[i], yi = points[i + 1], xj = points[j], yj = points[j + 1];
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

// liegt der punkt in einer der flächen des umrisses?
export function shapeContains(shape, px, py) {
    if (Math.hypot(px - shape.x, py - shape.y) > shape.radius) return false;
    return shape.polygons.some((points) => contains(points, px, py));
}

// punkte von "points", die in "other" liegen: wie weit muss "points" in richtung "sign" * außennormale
// der nächsten kante von "other" verschoben werden, um herauszukommen. nimmt den tiefsten punkt.
function deepestPoint(points, other, sign) {
    let best = null;
    for (let i = 0; i < points.length; i += 2) {
        const px = points[i];
        const py = points[i + 1];
        if (!contains(other, px, py)) continue;

        let nearest = Infinity;
        let pushX = 0;
        let pushY = 0;
        for (let k = 0; k < other.length; k += 2) {
            const ax = other[k], ay = other[k + 1];
            const bx = other[(k + 2) % other.length], by = other[(k + 3) % other.length];
            const dx = bx - ax, dy = by - ay;
            const lengthSquared = dx * dx + dy * dy;
            if (!lengthSquared) continue;
            const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
            const distance = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
            if (distance < nearest) {
                nearest = distance;
                const length = Math.sqrt(lengthSquared);
                pushX = dy / length * sign;     // außennormale (inneres liegt rechts der laufrichtung)
                pushY = -dx / length * sign;
            }
        }
        if (!best || nearest > best.depth) best = { x: pushX * nearest, y: pushY * nearest, depth: nearest };
    }
    return best;
}

// wie muss shapeA verschoben werden, damit sie shapeB nicht mehr berührt? null = keine berührung
export function findPush(shapeA, shapeB) {
    if (Math.hypot(shapeA.x - shapeB.x, shapeA.y - shapeB.y) > shapeA.radius + shapeB.radius) return null;

    let best = null;
    for (const a of shapeA.polygons) {
        for (const b of shapeB.polygons) {
            for (const candidate of [deepestPoint(a, b, 1), deepestPoint(b, a, -1)]) {
                if (candidate && candidate.depth > HITBOX.minDepth && (!best || candidate.depth > best.depth)) best = candidate;
            }
        }
    }
    return best;
}

// berühren sich die umrisse zweier sprites?
export function spritesOverlap(spriteA, spriteB) {
    return findPush(getWorldShape(spriteA), getWorldShape(spriteB)) !== null;
}

// schiebt das auto aus allen berührten sprites heraus und nimmt ihm die geschwindigkeit in diese richtung.
// gibt zurück, ob es eine berührung gab.
export function pushCarOut(car, others) {
    if (!car.body || !car.body.moves) return false;   // ein zerstörtes auto bleibt stehen

    const carShape = getWorldShape(car);
    let touched = false;
    for (const other of others) {
        const push = findPush(carShape, getWorldShape(other));
        if (!push) continue;
        touched = true;

        const factor = Math.min(1, HITBOX.maxPush / push.depth);
        const dx = push.x * factor;
        const dy = push.y * factor;
        car.x += dx;
        car.y += dy;
        translate(carShape, dx, dy);

        const nx = push.x / push.depth;
        const ny = push.y / push.depth;
        const velocity = car.body.velocity;
        const intoWall = velocity.x * nx + velocity.y * ny;
        if (intoWall < 0) velocity.set(velocity.x - nx * intoWall, velocity.y - ny * intoWall);
    }
    return touched;
}
