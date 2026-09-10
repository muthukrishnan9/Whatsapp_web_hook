const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Check whether the Render service is running
app.get("/", (req, res) => {
  res.send("WhatsApp Automation Webhook is running successfully!");
});
app.get("/privacy", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Privacy Policy - WhatsApp Automate</title>
      </head>
      <body style="font-family: Arial; max-width: 800px; margin: 40px auto; line-height: 1.6;">
        <h1>Privacy Policy</h1>

        <p><strong>WhatsApp Automate</strong> is a personal learning and testing project
        created to explore WhatsApp Cloud API automation.</p>

        <h2>Information We Process</h2>
        <p>The application may temporarily process WhatsApp message content,
        phone-number identifiers and related messaging data required to send
        or receive messages through the WhatsApp Cloud API.</p>

        <h2>How Information Is Used</h2>
        <p>Information is used only for operating and testing the WhatsApp
        automation functionality.</p>

        <h2>Data Sharing</h2>
        <p>This project does not sell personal information or share it with
        advertisers.</p>

        <h2>Data Retention</h2>
        <p>The application does not intentionally maintain a permanent database
        of WhatsApp message content.</p>

        <h2>Contact</h2>
        <p>For privacy-related questions, contact the application owner through
        the email address associated with the application.</p>

        <p>Last updated: September 10, 2026</p>
      </body>
    </html>
  `);
});
// Meta webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive WhatsApp messages
app.post("/webhook", async (req, res) => {
  // Acknowledge Meta immediately
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object !== "whatsapp_business_account") {
      return;
    }

    const message =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return;
    }

    const senderNumber = message.from;

    console.log("Message received from:", senderNumber);

    let replyMessage =
      "Hi! 👋 Your WhatsApp automation project is working successfully! ✅";

    if (message.type === "text") {
      const receivedText = message.text?.body || "";

      console.log("Received message:", receivedText);

      replyMessage =
        `Hi! 👋\n\n` +
        `I received your message: "${receivedText}"\n\n` +
        `Your WhatsApp automation is working successfully! ✅`;
    }

    await sendWhatsAppMessage(senderNumber, replyMessage);
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
});

// Send WhatsApp message
async function sendWhatsAppMessage(to, message) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",

          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API error:", data);
      return;
    }

    console.log("Reply sent successfully:", data);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
