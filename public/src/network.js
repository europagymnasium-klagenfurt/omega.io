// die eine socket.io verbindung zum server. überall wo man den server braucht:
//   import { socket, EVENTS } from "../network.js";

import { EVENTS } from "/shared/events.js";

export const socket = io();   // io kommt global aus /socket.io/socket.io.js
export { EVENTS };
