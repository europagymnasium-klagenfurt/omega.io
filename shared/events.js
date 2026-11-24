// alle socket.io event-namen an EINER stelle.
// wird vom server (server/) UND vom client (public/src/) importiert.
// neue events immer hier eintragen und nie als string direkt in den code schreiben,
// sonst reicht ein tippfehler und client und server reden aneinander vorbei.

export const EVENTS = {
    // client -> server
    READY: "ready",                  // client ist geladen und will mitspielen
    UPDATE: "update",                // eigene position {x, y, angle}
    BOOST_PICKUP: "boostPickup",      // client möchte das speed-item einsammeln
    SHOOT: "shoot",                  // eigener schuss {x, y, vx, vy}
    REPAIR_PICKUP: "repairPickup",    // client möchte ein reparatur-kit einsammeln {index}
    HIT: "hit",                      // eigener schuss hat ein anderes auto getroffen {targetId}
    CAR_CRASH: "carCrash",           // eigenes auto ist mit einem anderen zusammengestoßen {targetId}
    OBSTACLE_HIT: "obstacleHit",     // eigenes auto ist gegen ein hindernis gefahren

    // server -> client
    INIT: "init",                    // {id, players} an den neuen spieler
    PLAYER_JOINED: "playerJoined",   // player an alle anderen
    PLAYER_MOVED: "playerMoved",     // {id, x, y, angle}
    PLAYER_LEFT: "playerLeft",       // {id}
    BOOST_PICKUP_TAKEN: "boostPickupTaken", // item wurde eingesammelt
    BOOST_PICKUP_RESPAWNED: "boostPickupRespawned", // item ist wieder verfügbar
    BOOST_PICKUP_REJECTED: "boostPickupRejected", // einsammeln war nicht gültig
    BOOST_GRANTED: "boostGranted",   // speed-boost nur für den sammler
    SHOT_FIRED: "shotFired",         // {id, x, y, vx, vy} schuss eines anderen spielers
    HEALTH_CHANGED: "healthChanged", // {id, health} neue lebenspunkte eines spielers
    REPAIR_TAKEN: "repairTaken",     // {index} kit wurde eingesammelt
    REPAIR_RESPAWNED: "repairRespawned", // {index} kit ist wieder da
    REPAIR_REJECTED: "repairRejected", // {index} einsammeln war nicht gültig
    PLAYER_RESPAWNED: "playerRespawned", // {id, x, y, angle, health} zerstörtes auto ist wieder da
    STATS_CHANGED: "statsChanged",   // {id, kills, deaths, damageDealt, damageTaken} neue statistik eines spielers
    ROUND_STARTED: "roundStarted",   // {round, remaining} neue runde läuft, alle starten neu
    ROUND_ENDED: "roundEnded",       // {winnerId, winnerName, winnerColor, reason, intermission} runde vorbei
    ROUND_WAITING: "roundWaiting",   // zu wenig spieler für eine runde
    PLAYER_KILLED: "playerKilled",   // {killerId, killerName, killerColor, killerKills, victimId, victimName, victimColor, victimDeaths}
};
