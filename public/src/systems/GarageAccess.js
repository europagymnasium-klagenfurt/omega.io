import { PLAYER_HUD } from "../config.js";

export class GarageAccess {
    constructor(scene, car, playerHud) {
        const x = PLAYER_HUD.width - PLAYER_HUD.padding - PLAYER_HUD.garageButtonWidth / 2;
        const button = scene.add.rectangle(
            x,
            PLAYER_HUD.garageButtonY,
            PLAYER_HUD.garageButtonWidth,
            PLAYER_HUD.garageButtonHeight,
            0xffb45f,
        )
            .setStrokeStyle(2, 0xffdf9a)
            .setInteractive({ useHandCursor: true });
        const label = scene.add.text(x, PLAYER_HUD.garageButtonY, "GARAGE · 1", {
            color: "#202832",
            fontFamily: "monospace",
            fontSize: `${PLAYER_HUD.garageButtonFontSize}px`,
            fontStyle: "bold",
        }).setOrigin(0.5);
        playerHud.container.add([button, label]);

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