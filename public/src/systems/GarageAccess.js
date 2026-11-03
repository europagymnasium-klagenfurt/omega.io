import { VIEW_WIDTH } from "../config.js";

export class GarageAccess {
    constructor(scene, car) {
        const button = scene.add.rectangle(VIEW_WIDTH - 125, 34, 220, 48, 0xffb45f)
            .setScrollFactor(0)
            .setStrokeStyle(2, 0xffdf9a)
            .setInteractive({ useHandCursor: true });
        const label = scene.add.text(VIEW_WIDTH - 125, 34, "GARAGE  ·  1 WECHSEL", {
            color: "#202832",
            fontFamily: "monospace",
            fontSize: "13px",
            fontStyle: "bold",
        }).setOrigin(0.5).setScrollFactor(0);

        button.on("pointerover", () => button.setFillStyle(0xffd08a));
        button.on("pointerout", () => button.setFillStyle(0xffb45f));
        button.on("pointerdown", () => {
            scene.scene.start("MenuScene", {
                vehicleKey: car.texture.key,
                vehicleChangeUsed: true,
            });
        });
    }
}