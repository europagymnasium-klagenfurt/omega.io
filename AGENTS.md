# Omega.io – Regeln für Entwickler und KI-Assistenten

Multiplayer-Autospiel (jeder gegen jeden in einer großen Arena).
Phaser 4 im Browser, Node.js + Express + Socket.io am Server.
8 Leute arbeiten gleichzeitig daran – darum gelten diese Regeln für alle, auch für KI-Tools.

## Starten

```bash
npm install
npm run dev      # server startet bei änderungen neu
```
Dann http://localhost:3000 öffnen (zum Testen mehrere Tabs = mehrere Spieler).

## Aufbau

Ausführliche Erklärung mit Beispielen: [codestrukturinfo.md](codestrukturinfo.md)

```
server.js                 startet express + socket.io (nicht erweitern)
server/
  network.js              alle socket-events am server
  players.js              spielerdaten am server
shared/
  events.js               ALLE event-namen (client + server)
public/
  index.html
  lib/phaser.min.js       nicht ändern
  assets/                 bilder, sounds
  src/
    main.js               phaser-konfiguration, scene-liste
    config.js             alle einstellungen/zahlen
    network.js            die socket-verbindung
    scenes/               PreloadScene (assets laden), GameScene (spielwelt)
    objects/              spielobjekte: PlayerCar, RemoteCar, ...
    systems/              logik ohne eigenes bild: Multiplayer, ...
```

Kein Build-Tool: Der Browser lädt die Dateien direkt als ES-Module.
`Phaser` und `io` sind globale Variablen (kommen aus `<script>`-Tags), nicht importieren.

## Regeln

1. **Ein Feature = eigene Datei.** Neues Spielobjekt → `public/src/objects/`, neue Logik → `public/src/systems/`.
   In `GameScene.js` nur erzeugen und in `update()` aufrufen (1–2 Zeilen). `GameScene.js` muss kurz bleiben.
2. **Event-Namen nur aus `shared/events.js`.** Nie `socket.emit("irgendwas")` mit String schreiben.
   Neues Event: zuerst in `shared/events.js` eintragen, dann server und client.
3. **Zahlen gehören in `config.js`** (Geschwindigkeiten, Größen, Zeiten), nicht mitten in den Code.
4. **Assets nur in `PreloadScene.js` laden.** Dateien nach `public/assets/`, Key eindeutig benennen.
5. **Nur Dateien ändern, die zum eigenen Feature gehören.** Keine „Aufräum“-Änderungen in fremden Dateien,
   kein Umbenennen oder Verschieben bestehender Dateien ohne Absprache.
6. **Keine neuen npm-Pakete oder Bibliotheken** ohne Absprache mit der Lehrkraft.
7. **Kommentare auf Deutsch**, kurz, im Stil des bestehenden Codes. Klassen in `PascalCase.js`, eine Klasse pro Datei.

## Git

- Nie direkt auf `main` arbeiten. Pro Feature ein Branch: `feature/<name>-<thema>`, z. B. `feature/anna-boost`.
- Vor dem Start und vor dem Pull Request `main` in den eigenen Branch holen.
- Kleine Pull Requests mit Beschreibung: was, warum, wie testen.
- Vor jedem Pull Request mit mindestens 2 Browser-Tabs testen, ob der Multiplayer noch funktioniert.

## Hinweise für KI-Assistenten

- Lies die betroffenen Dateien, bevor du etwas änderst, und halte dich an den Aufbau oben.
- Ändere nur das, worum gebeten wurde. Schreibe keine bestehenden Dateien komplett neu.
- Erfinde keine Phaser-API: Das Projekt nutzt **Phaser 4**, nicht Phaser 2/CE.
- Wenn ein Feature eine Regel oben brechen würde, sag das, statt es trotzdem zu tun.
