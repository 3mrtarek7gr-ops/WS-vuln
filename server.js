/**
 * websocket-xss-lab — server.js
 *
 * INTENTIONALLY VULNERABLE — LOCAL SECURITY TRAINING LAB ONLY.
 * Do not deploy this anywhere reachable from the internet.
 *
 * This server implements a minimal Express static file host plus a raw
 * WebSocket endpoint (using the `ws` package, no Socket.IO). It receives
 * chat JSON frames and broadcasts them, verbatim and WITHOUT validation
 * or sanitization, to every connected client (including the simulated
 * support agent page). This mirrors the PortSwigger Web Security Academy
 * lab "Manipulating WebSocket messages to exploit vulnerabilities":
 * the real security boundary the client-side encoding was supposed to
 * provide does not exist server-side, so a tool like Burp Suite can
 * intercept and rewrite the WebSocket frame before it reaches the agent.
 */

const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// Plain, standard WebSocket server — easy to spot in Burp's WebSockets history.
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[ws] client connected (total: ${clients.size})`);

  ws.on("message", (data) => {
    const raw = data.toString();
    console.log(`[ws] received frame: ${raw}`);


    broadcast(raw);
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[ws] client disconnected (total: ${clients.size})`);
  });
});

function broadcast(raw) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(raw);
    }
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n  websocket-xss-lab running  →  http://localhost:${PORT}`);
  console.log(`  (intentionally vulnerable — local security training only)\n`);
});
