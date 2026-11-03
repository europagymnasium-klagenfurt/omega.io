export class FPSCounter extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);

        const label = scene.add.text(0, 0, "", {
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#ffffff",
        });
        const background = scene.add.graphics();

        this.add([background, label]);
        scene.add.existing(this);
        this.setScrollFactor(0).setDepth(1000);

        this.scene = scene;
        this.label = label;
        this.background = background;
        this.paddingX = 10;
        this.paddingY = 6;
        this.collapsed = false;
        this.currentFps = "---";
        this.elapsed = 0;
        this.frames = 0;

        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true,
        });
        this.handleScenePointerDown = (pointer) => {
            const bounds = this.getBounds();
            if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
                this.collapsed = !this.collapsed;
                this.updateDisplay();
            }
        };
        scene.input.on("pointerdown", this.handleScenePointerDown);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.input.off("pointerdown", this.handleScenePointerDown);
        });
        this.updateDisplay();
    }

    update(delta) {
        if (!this.active) return;

        this.elapsed += delta;
        this.frames += 1;

        if (this.elapsed >= 500) {
            this.currentFps = String(Math.round(this.frames * 1000 / this.elapsed)).padStart(3, " ");
            this.elapsed = 0;
            this.frames = 0;
            if (!this.collapsed) this.updateDisplay();
        }
    }

    updateDisplay() {
        const text = this.collapsed ? "FPS +" : `FPS: ${this.currentFps} | Entfernen`;
        this.label.setText(text);

        const paddingX = this.collapsed ? 6 : this.paddingX;
        const paddingY = this.collapsed ? 4 : this.paddingY;
        const width = this.label.width + paddingX * 2;
        const height = this.label.height + paddingY * 2;

        this.background.clear();
        this.background.fillStyle(0x222222, 0.85);
        this.background.fillRoundedRect(0, 0, width, height, 10);
        this.label.setPosition(paddingX, paddingY);
        this.setSize(width, height);
        this.setPosition(this.scene.scale.width - width - 12, this.scene.scale.height - height - 12);
        this.input.hitArea.setTo(0, 0, width, height);
    }
}