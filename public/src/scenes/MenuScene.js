import { VIEW_WIDTH, VIEW_HEIGHT } from "../config.js";
import { VEHICLE_CATEGORIES } from "/shared/vehicles.js";

const CATEGORY_COLORS = [0xff765e, 0x9bdc4a, 0x55d7e5];
const CATEGORY_TEXT_COLORS = ["#ff8b72", "#b6ef64", "#72e9f1"];

export class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create(data) {
        this.categoryIndex = 0;
        this.vehicleIndex = 0;
        this.transitioning = false;
        this.vehicleChangeUsed = Boolean(data?.vehicleChangeUsed);
        const savedCategoryIndex = VEHICLE_CATEGORIES.findIndex((category) =>
            category.vehicles.some((vehicle) => vehicle.key === data?.vehicleKey));
        if (savedCategoryIndex >= 0) {
            this.categoryIndex = savedCategoryIndex;
            this.vehicleIndex = VEHICLE_CATEGORIES[savedCategoryIndex].vehicles
                .findIndex((vehicle) => vehicle.key === data.vehicleKey);
        }
        this.categoryContainer = this.add.container(0, 0);
        this.selectionContainer = this.add.container(0, 0);
        this.categoryContainer.setDepth(1);
        this.selectionContainer.setDepth(1);

        const background = this.add.image(VIEW_WIDTH / 2, VIEW_HEIGHT / 2, "garage-background");
        background.setScale(Math.max(VIEW_WIDTH / background.width, VIEW_HEIGHT / background.height));
        this.add.rectangle(0, 0, VIEW_WIDTH, VIEW_HEIGHT, 0x101923, 0.68).setOrigin(0);
        const lines = this.add.graphics();
        lines.lineStyle(1, 0x314451, 0.6);
        for (let x = -300; x < VIEW_WIDTH + 300; x += 100) {
            lines.lineBetween(x, 0, x + 300, VIEW_HEIGHT);
        }
        lines.lineStyle(3, 0xff765e, 0.7);
        lines.lineBetween(70, 117, 320, 117);
        lines.lineStyle(3, 0x55d7e5, 0.7);
        lines.lineBetween(VIEW_WIDTH - 320, 117, VIEW_WIDTH - 70, 117);

        this.add.text(VIEW_WIDTH / 2, 48, "Garage", {
            color: "#f5f7f2",
            fontFamily: "monospace",
            fontSize: "38px",
            fontStyle: "bold",
        }).setOrigin(0.5);
        this.add.text(VIEW_WIDTH / 2, 88, "WÄHLE DEIN FAHRZEUG", {
            color: "#b3c2cb",
            fontFamily: "monospace",
            fontSize: "14px",
        }).setOrigin(0.5);
        if (this.vehicleChangeUsed) {
            this.add.text(VIEW_WIDTH / 2, 112, "LETZTE ÄNDERUNG", {
                color: "#ffb36b",
                fontFamily: "monospace",
                fontSize: "12px",
                fontStyle: "bold",
            }).setOrigin(0.5);
        }

        this.playButton = this.add.rectangle(VIEW_WIDTH / 2, VIEW_HEIGHT - 45, 300, 58, CATEGORY_COLORS[0])
            .setInteractive({ useHandCursor: true });
        this.add.text(VIEW_WIDTH / 2, VIEW_HEIGHT - 45, "INS SPIEL", {
            color: "#14202a",
            fontFamily: "monospace",
            fontSize: "20px",
            fontStyle: "bold",
        }).setOrigin(0.5);
        this.playButton.on("pointerover", () => this.playButton.setFillStyle(0xffffff));
        this.playButton.on("pointerout", () => this.playButton.setFillStyle(CATEGORY_COLORS[this.categoryIndex]));
        this.playButton.on("pointerdown", () => this.startGame());

        this.renderCategories();
        this.renderVehicles();
    }

    renderCategories() {
        this.categoryContainer.removeAll(true);

        VEHICLE_CATEGORIES.forEach((category, index) => {
            const x = VIEW_WIDTH / 2 + (index - 1) * 230;
            const active = index === this.categoryIndex;
            const color = CATEGORY_COLORS[index];
            const background = this.add.rectangle(x, 157, 214, 52, active ? color : 0x202d38)
                .setStrokeStyle(1, active ? color : 0x4a5a60)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(x, 157, category.name.toUpperCase(), {
                color: active ? "#14202a" : "#e3e9e4",
                fontFamily: "monospace",
                fontSize: "15px",
                fontStyle: "bold",
            }).setOrigin(0.5);

            background.on("pointerdown", () => {
                this.categoryIndex = index;
                this.vehicleIndex = 0;
                this.playButton.setFillStyle(CATEGORY_COLORS[index]);
                this.renderCategories();
                this.renderVehicles();
            });
            this.categoryContainer.add([background, label]);
        });
    }

    renderVehicles() {
        this.selectionContainer.removeAll(true);
        const category = VEHICLE_CATEGORIES[this.categoryIndex];
        const selectedVehicle = category.vehicles[this.vehicleIndex];
        const categoryColor = CATEGORY_COLORS[this.categoryIndex];

        const previewPanel = this.add.rectangle(VIEW_WIDTH / 2, 380, 850, 326, 0x1b2a36, 0.94)
            .setStrokeStyle(2, categoryColor);
        const categoryLabel = this.add.text(VIEW_WIDTH / 2, 234, category.name.toUpperCase(), {
            color: CATEGORY_TEXT_COLORS[this.categoryIndex],
            fontFamily: "monospace",
            fontSize: "13px",
        }).setOrigin(0.5);
        const preview = this.add.image(VIEW_WIDTH / 2, 380, selectedVehicle.key);
        preview.setScale(Math.min(300 / preview.width, 270 / preview.height));
        preview.setName("previewVehicle");
        this.previewVehicle = preview;

        preview.setName("previewVehicle");
        this.previewVehicle = preview;
        this.addVehicleSelectionAnimation(preview);
        const vehicleName = this.add.text(VIEW_WIDTH / 2, 560, selectedVehicle.name, {
            color: "#f5f7f2",
            fontFamily: "monospace",
            fontSize: "24px",
            fontStyle: "bold",
        }).setOrigin(0.5);

        const previousButton = this.add.text(VIEW_WIDTH / 2 - 385, 380, "<", {
            color: CATEGORY_TEXT_COLORS[this.categoryIndex],
            fontFamily: "monospace",
            fontSize: "40px",
            fontStyle: "bold",
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        previousButton.on("pointerdown", () => this.selectVehicle(-1));

        const nextButton = this.add.text(VIEW_WIDTH / 2 + 385, 380, ">", {
            color: CATEGORY_TEXT_COLORS[this.categoryIndex],
            fontFamily: "monospace",
            fontSize: "40px",
            fontStyle: "bold",
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        nextButton.on("pointerdown", () => this.selectVehicle(1));

        this.selectionContainer.add([previewPanel, categoryLabel, preview, vehicleName, previousButton, nextButton]);

        const cardWidth = 250;
        const cardGap = 24;
        category.vehicles.forEach((vehicle, index) => {
            const x = VIEW_WIDTH / 2 + (index - 1) * (cardWidth + cardGap);
            const active = index === this.vehicleIndex;
            const card = this.add.rectangle(x, 663, cardWidth, 90, active ? 0x293b43 : 0x1b2a36)
                .setStrokeStyle(active ? 2 : 1, active ? categoryColor : 0x46565b)
                .setInteractive({ useHandCursor: true });
            const thumbnail = this.add.image(x - 75, 663, vehicle.key);
            thumbnail.setScale(Math.min(76 / thumbnail.width, 72 / thumbnail.height));
            const label = this.add.text(x + 12, 663, vehicle.name, {
                color: active ? "#f5f7f2" : "#b9c4c1",
                fontFamily: "monospace",
                fontSize: "14px",
                wordWrap: { width: 135 },
            }).setOrigin(0, 0.5);

            card.on("pointerdown", () => {
                this.vehicleIndex = index;
                this.renderVehicles();
            });
            this.selectionContainer.add([card, thumbnail, label]);
        });
    }

    addVehicleSelectionAnimation(preview) {
        if (!preview) return;

        const startScaleX = preview.scaleX || 1;
        const startScaleY = preview.scaleY || 1;
        this.tweens.add({
            targets: preview,
            x: preview.x + 10,
            y: preview.y - 8,
            scaleX: startScaleX * 1.08,
            scaleY: startScaleY * 1.08,
            duration: 160,
            ease: "Back.Out",
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                preview.setPosition(VIEW_WIDTH / 2, 380);
                preview.setScale(startScaleX, startScaleY);
            },
        });

        const driver = this.add.container(preview.x + 10, preview.y + 12);
        const seat = this.add.rectangle(0, 10, 26, 18, 0x1b1d22, 0.9);
        const head = this.add.circle(0, -8, 8, 0xf0c29d);
        driver.add([seat, head]);
        this.selectionContainer.add(driver);
        this.tweens.add({
            targets: driver,
            y: preview.y + 18,
            duration: 130,
            ease: "Quad.easeOut",
            yoyo: true,
            repeat: 1,
            onComplete: () => driver.destroy(),
        });

        const smoke = this.add.particles(preview.x - 110, preview.y + 26, "boostSmoke", {
            speed: { min: 20, max: 60 },
            angle: { min: 150, max: 200 },
            rotate: { min: 0, max: 360 },
            scale: { start: 0.20, end: 0.9 },
            alpha: { start: 0.75, end: 0 },
            lifespan: 600,
            quantity: 3,
            frequency: 50,
            maxParticles: 18,
        });
        smoke.setDepth(10);
        this.time.delayedCall(650, () => smoke.destroy());
    }

    selectVehicle(direction) {
        const vehicleCount = VEHICLE_CATEGORIES[this.categoryIndex].vehicles.length;
        this.vehicleIndex = (this.vehicleIndex + direction + vehicleCount) % vehicleCount;
        this.renderVehicles();
    }

    startGame() {
        if (this.transitioning) return;

        const vehicle = VEHICLE_CATEGORIES[this.categoryIndex].vehicles[this.vehicleIndex];
        this.transitioning = true;
        this.playButton.disableInteractive();

        const garageExitCar = this.add.image(this.previewVehicle?.x ?? VIEW_WIDTH / 2, this.previewVehicle?.y ?? 380, vehicle.key);
        garageExitCar.setScale(this.previewVehicle?.scaleX ?? 1, this.previewVehicle?.scaleY ?? 1);
        garageExitCar.setDepth(5);

        const garageShadow = this.add.rectangle(VIEW_WIDTH / 2, 432, 300, 42, 0x000000, 0.25);
        garageShadow.setDepth(4);

        this.tweens.add({
            targets: garageShadow,
            scaleX: 1.5,
            alpha: 0,
            duration: 850,
            ease: "Cubic.Out",
        });

        this.tweens.add({
            targets: garageExitCar,
            x: VIEW_WIDTH + 260,
            y: 470,
            rotation: 1.4,
            scaleX: 0.9,
            scaleY: 0.9,
            alpha: 0.15,
            duration: 950,
            ease: "Cubic.In",
            onComplete: () => {
                garageExitCar.destroy();
                garageShadow.destroy();
                this.scene.start("GameScene", {
                    vehicleKey: vehicle.key,
                    vehicleChangeUsed: this.vehicleChangeUsed,
                });
            },
        });
    }
}