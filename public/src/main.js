// startpunkt des spiels: hier wird nur das phaser spiel konfiguriert und die scenes registriert.
// spiellogik gehört NICHT hierher, sondern in scenes/, objects/ oder systems/

import { VIEW_WIDTH, VIEW_HEIGHT, DEBUG } from "./config.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";

new Phaser.Game({
    type: Phaser.AUTO,
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    parent: "game-container",
    scene: [PreloadScene, MenuScene, GameScene],   // die erste scene startet automatisch
    scale: {
        mode: Phaser.Scale.FIT,                 // spiel skaliert mit, seitenverhältnis bleibt erhalten
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: DEBUG,
        },
    },
});
