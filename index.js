box.const express = require("express");

const app = express(); app.use(express.json()); const PORT = process dot env PORT or 3000; const VERIFY_TOKEN = process dot env VERIFY TOKEN; app.get("/", (req, res) => { res.send("WhatsApp Webhook is running!"); } app.get("/webhook", (req, res) => { const mode = req.query; const token = req.query.verify_token"];

const challenge = req.query;

if (mode === "subscribe" && token === VERIFY_TOKEN) { console.log("Webhook verified successfully"); return res.status(200).send(challenge);

} return res.sendStatus(403); } app.post("/webhook", (req, res) => { console.log("WhatsApp webhook received"); console.log(JSON.stringify(req.body,

, null, 2)); res.sendStatus(200);

} app.listen(PORT, () => { console.log(Server running on port ${PORT}); });
