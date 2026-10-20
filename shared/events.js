// alle socket.io event-namen an EINER stelle.
// wird vom server (server/) UND vom client (public/src/) importiert.
// neue events immer hier eintragen und nie als string direkt in den code schreiben,
// sonst reicht ein tippfehler und client und server reden aneinander vorbei.

export const EVENTS = {
    // client -> server
    READY: "ready",                  // client ist geladen und will mitspielen
    UPDATE: "update",                // eigene position {x, y, angle}

    // server -> client
    INIT: "init",                    // {id, players} an den neuen spieler
    PLAYER_JOINED: "playerJoined",   // player an alle anderen
    PLAYER_MOVED: "playerMoved",     // {id, x, y, angle}
    PLAYER_LEFT: "playerLeft",       // {id}
};
