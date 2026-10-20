# Omega.io – Codestruktur

Diese Datei erklärt, **wo was liegt** und **warum**. Die Regeln fürs Mitarbeiten stehen in [AGENTS.md](AGENTS.md).

---

## Überblick

Omega.io besteht aus zwei Teilen, die über **Socket.io** miteinander reden:

| Teil       | Läuft wo?            | Technik                  | Aufgabe                                          |
|------------|----------------------|--------------------------|--------------------------------------------------|
| **Server** | Node.js (Terminal)   | Express + Socket.io      | liefert die Dateien aus, verteilt Spielerdaten   |
| **Client** | Browser (jeder Tab)  | Phaser 4 + Socket.io     | zeigt das Spiel, steuert das eigene Auto         |

Dazwischen liegt `shared/` – Code, den **beide** Seiten benutzen.

> **Kein Build-Tool:** Der Browser lädt die `.js`-Dateien direkt als ES-Module (`import` / `export`).
> Es gibt kein `npm run build`. Datei speichern → Browser neu laden → fertig.

---

## Ordnerstruktur

```
omega.io/
├── server.js                  Startpunkt des Servers
├── server/
│   ├── network.js             alle Socket-Events am Server
│   └── players.js             Spielerdaten am Server
├── shared/
│   └── events.js              alle Event-Namen (Client + Server)
├── public/                    alles, was der Browser bekommt
│   ├── index.html             die Webseite
│   ├── lib/
│   │   └── phaser.min.js      Phaser-Bibliothek (nicht ändern!)
│   ├── assets/                Bilder, Sounds
│   │   ├── car1.png
│   │   └── racetrack.jpg
│   └── src/                   unser Spielcode
│       ├── main.js            Startpunkt des Spiels
│       ├── config.js          alle Einstellungen
│       ├── network.js         die Verbindung zum Server
│       ├── scenes/            Spielbildschirme
│       │   ├── PreloadScene.js
│       │   └── GameScene.js
│       ├── objects/           Dinge, die man im Spiel sieht
│       │   ├── PlayerCar.js
│       │   └── RemoteCar.js
│       └── systems/           Logik ohne eigenes Bild
│           └── Multiplayer.js
├── AGENTS.md                  Regeln für Entwickler und KI
├── codestrukturinfo.md        diese Datei
└── package.json               npm-Skripte und Abhängigkeiten
```

---

## Server

### `server.js`
Der **Startpunkt**. Startet Express (liefert `public/` und `shared/` aus) und Socket.io und ruft `setupNetwork(io)` auf.
➜ Hier kommt **keine Spiellogik** hinein.

### `server/network.js`
Hier reagiert der Server auf **alle Nachrichten** der Clients:

- Ein Spieler verbindet sich → `addPlayer()`
- `READY` → schickt `INIT` an den Neuen und `PLAYER_JOINED` an alle anderen
- `UPDATE` → speichert die Position und schickt `PLAYER_MOVED` an alle anderen
- Disconnect → schickt `PLAYER_LEFT` und ruft `removePlayer()` auf

### `server/players.js`
Verwaltet die **Daten aller Spieler** (`id`, `x`, `y`, `angle`, `color`). Enthält keinen Socket-Code, nur Funktionen wie `addPlayer`, `updatePlayer` und `removePlayer`.
➜ Neue Spielerwerte (z. B. Punkte, Leben) werden hier ergänzt.

---

## Shared

### `shared/events.js`
**Alle Event-Namen** an einer Stelle:

| Konstante              | Richtung         | Daten                    | Bedeutung                          |
|------------------------|------------------|--------------------------|------------------------------------|
| `EVENTS.READY`         | Client → Server  | –                        | „Ich bin geladen, ich spiele mit.“ |
| `EVENTS.UPDATE`        | Client → Server  | `{x, y, angle}`          | meine aktuelle Position            |
| `EVENTS.INIT`          | Server → Client  | `{id, players}`          | deine ID und alle Spieler          |
| `EVENTS.PLAYER_JOINED` | Server → Client  | `player`                 | ein neuer Spieler ist da           |
| `EVENTS.PLAYER_MOVED`  | Server → Client  | `{id, x, y, angle}`      | ein Spieler hat sich bewegt        |
| `EVENTS.PLAYER_LEFT`   | Server → Client  | `{id}`                   | ein Spieler ist weg                |

**Warum?** Schreibt der Client `"playerMove"` und der Server `"playerMoved"`, passiert einfach *nichts* – ohne Fehlermeldung.
Mit `EVENTS.PLAYER_MOVED` meldet der Browser sofort einen Fehler, wenn man sich vertippt.

---

## Client (`public/`)

### `index.html`
Die Webseite. Lädt der Reihe nach:
1. `/socket.io/socket.io.js` → stellt die globale Variable `io` bereit
2. `/lib/phaser.min.js` → stellt die globale Variable `Phaser` bereit
3. `/src/main.js` als **Modul** → startet das Spiel

> `Phaser` und `io` sind **global** und werden deshalb **nicht importiert**.

### `src/main.js`
Erstellt das `Phaser.Game`: Größe, Skalierung (`FIT`), Physik und die **Liste der Scenes**.
➜ Wird nur geändert, wenn eine **neue Scene** dazukommt.

### `src/config.js`
**Alle Zahlen** des Spiels: Bildschirm- und Weltgröße, `DEBUG`, Werte für das Auto (`speed`, `rotationSpeed`, `friction`, `scale`, `hitbox`).
➜ Wer das Spielgefühl ändern will, ändert **nur hier** etwas.

### `src/network.js`
Erstellt die **eine** Socket-Verbindung und exportiert `socket` und `EVENTS`.
```js
import { socket, EVENTS } from "../network.js";
```

### `src/scenes/` – die Spielbildschirme

| Datei              | Aufgabe                                                                 |
|--------------------|-------------------------------------------------------------------------|
| `PreloadScene.js`  | lädt **alle** Bilder und Sounds, startet danach die `GameScene`         |
| `GameScene.js`     | baut die Welt zusammen: Hintergrund, eigenes Auto, Kamera, Multiplayer  |

`GameScene` ist der **Dirigent**: Sie erzeugt die Objekte und Systeme und ruft sie in `update()` auf, die eigentliche Arbeit machen aber andere Dateien.
➜ `GameScene.js` muss **kurz bleiben**.

Später könnten hier z. B. `MenuScene.js` oder `GameOverScene.js` dazukommen.

### `src/objects/` – Dinge, die man sieht

| Datei            | Erbt von                       | Aufgabe                                                         |
|------------------|--------------------------------|-----------------------------------------------------------------|
| `PlayerCar.js`   | `Phaser.Physics.Arcade.Sprite` | eigenes Auto: Hitbox, Steuerung (`drive()`), `getState()`       |
| `RemoteCar.js`   | `Phaser.GameObjects.Sprite`    | Auto eines anderen Spielers, ohne Physik, `applyState()`        |

Jedes Objekt ist eine **eigene Klasse in einer eigenen Datei** und kümmert sich selbst um sein Aussehen und Verhalten.

### `src/systems/` – Logik ohne eigenes Bild

| Datei             | Aufgabe                                                                        |
|-------------------|--------------------------------------------------------------------------------|
| `Multiplayer.js`  | hört auf Server-Events, erzeugt und entfernt `RemoteCar`s, sendet die eigene Position |

Hierher gehören Dinge wie Punktestand, Spawn-Logik, Kollisionsregeln, Rundenzeit …

---

## Ablauf: Was passiert beim Start?

```
Browser öffnet index.html
        │
        ▼
main.js ──► Phaser.Game startet
        │
        ▼
PreloadScene ──► lädt car1.png, racetrack.jpg ──► startet GameScene
        │
        ▼
GameScene.create()
   ├── Hintergrund (tileSprite)
   ├── new PlayerCar(...)
   ├── Kamera folgt dem Auto
   └── new Multiplayer(...) ──► sendet READY an den Server
                                        │
                     Server antwortet mit INIT {id, players}
                                        │
                     ├── eigenes Auto bekommt Startposition und Farbe
                     └── für jeden anderen Spieler: new RemoteCar(...)

GameScene.update()  (jeden Frame)
   ├── car.drive(cursors)        ← Pfeiltasten auswerten
   └── multiplayer.sendState()   ← UPDATE an den Server
```

## Ablauf: Ein Spieler bewegt sich

```
Spieler A drückt ▲
   │
   ▼
PlayerCar.drive()  ──►  Multiplayer.sendState()  ──UPDATE──►  server/network.js
                                                                  │
                                                       players.js speichert x, y, angle
                                                                  │
                                         ◄──PLAYER_MOVED── an alle anderen
   │
   ▼
Bei Spieler B: Multiplayer ──► RemoteCar.applyState() ──► Auto von A bewegt sich
```

---

## Beispiel: Ein neues Feature einbauen

Angenommen, jemand möchte einen **Boost mit der Leertaste** einbauen:

| Schritt | Datei                        | Was tun?                                                    |
|---------|------------------------------|-------------------------------------------------------------|
| 1       | `src/config.js`              | `BOOST = { speed: 1000, duration: 500, cooldown: 3000 }`    |
| 2       | `src/systems/Boost.js`       | **neue Datei**, Klasse `Boost` mit `update()`               |
| 3       | `src/scenes/GameScene.js`    | in `create()`: `this.boost = new Boost(this, this.car);`    |
|         |                              | in `update()`: `this.boost.update(delta);`                  |

Muss der Boost auch bei den anderen Spielern sichtbar sein:

| Schritt | Datei                        | Was tun?                                                    |
|---------|------------------------------|-------------------------------------------------------------|
| 4       | `shared/events.js`           | `BOOST: "boost"` eintragen                                  |
| 5       | `server/network.js`          | Event empfangen und weiterschicken                          |
| 6       | `src/systems/Multiplayer.js` | Event empfangen und am `RemoteCar` anzeigen                 |

**Ergebnis:** Eine neue Datei, und in bestehenden Dateien ändern sich nur wenige Zeilen → kaum Merge-Konflikte.

---

## Wohin gehört mein Code?

| Ich will …                                  | Datei / Ordner                     |
|---------------------------------------------|------------------------------------|
| eine Zahl ändern (Tempo, Größe …)           | `src/config.js`                    |
| ein neues Bild oder einen Sound laden       | `public/assets/` + `PreloadScene.js` |
| etwas Sichtbares bauen (Item, Hindernis …)  | neue Datei in `src/objects/`       |
| Spielregeln oder Logik (Punkte, Timer …)    | neue Datei in `src/systems/`       |
| einen neuen Bildschirm (Menü, Game Over)    | neue Datei in `src/scenes/` + `main.js` |
| eine neue Nachricht zwischen Spielern       | `shared/events.js` + `server/network.js` + `Multiplayer.js` |
| neue Daten pro Spieler am Server            | `server/players.js`                |

---

## Starten

```bash
npm install      # einmalig
npm run dev      # Server starten, startet bei Änderungen automatisch neu
npm start        # Server normal starten
```

Danach http://localhost:3000 öffnen. **Mehrere Tabs = mehrere Spieler.**
