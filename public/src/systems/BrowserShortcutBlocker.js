// sperrt browser-tastenkombinationen mit STRG, solange gespielt wird, damit man nicht aus versehen
// etwas speichert, druckt, sucht oder zoomt. STRG+W (tab schließen) kann der browser nicht sperren:
// dafür kommt vor dem verlassen der seite eine rückfrage.

import { BROWSER_SHORTCUTS } from "../config.js";

export class BrowserShortcutBlocker {
    constructor(scene) {
        this.onKeyDown = (event) => {
            if (!event.ctrlKey && !event.metaKey) return;
            if (BROWSER_SHORTCUTS.allowedKeys.includes(event.key.toLowerCase())) return;
            event.preventDefault();   // phaser bekommt die taste trotzdem (STRG und W fahren weiter)
        };
        this.onWheel = (event) => {
            if (event.ctrlKey) event.preventDefault();   // STRG + mausrad zoomt sonst die seite
        };
        this.onBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("wheel", this.onWheel, { passive: false });
        if (BROWSER_SHORTCUTS.confirmLeave) window.addEventListener("beforeunload", this.onBeforeUnload);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    }

    destroy() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("wheel", this.onWheel);
        window.removeEventListener("beforeunload", this.onBeforeUnload);
    }
}
