# Omega.io

Alle Projektregeln stehen in `AGENTS.md` im Hauptordner. Lies diese Datei, bevor du Code änderst.

Das Wichtigste:
- Phaser 4 (global `Phaser`), Socket.io (global `io`), ES-Module ohne Build-Tool.
- Ein Feature = eigene Datei in `public/src/objects/` oder `public/src/systems/`; `GameScene.js` bleibt kurz.
- Event-Namen nur aus `shared/events.js`, Zahlen in `public/src/config.js`, Assets nur in `PreloadScene.js` laden.
- Nur Dateien ändern, die zum Feature gehören. Keine neuen Pakete ohne Absprache.
