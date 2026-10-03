

const statusPill = document.getElementById("status-pill");
const statusText = document.getElementById("status-text");
const messagesEl = document.getElementById("messages");
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

const protocol = location.protocol === "https:" ? "wss://" : "ws://";
const ws = new WebSocket(protocol + location.host);

function setStatus(connected) {
  if (connected) {
    statusPill.classList.add("connected");
    statusText.textContent = "WebSocket Status: Connected";
  } else {
    statusPill.classList.remove("connected");
    statusText.textContent = "WebSocket Status: Disconnected";
  }
}

ws.addEventListener("open", () => setStatus(true));
ws.addEventListener("close", () => setStatus(false));
ws.addEventListener("error", () => setStatus(false));

ws.addEventListener("message", (event) => {
  // Echo/broadcast of chat messages back to the customer's own chat window.
  try {
    const data = JSON.parse(event.data);
    if (data && data.type === "chat") {
      appendBubble(data.message, "me");
    }
  } catch (e) {
  }
});


function htmlEncode(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function appendBubble(text, who) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + who;
  // textContent here — this page never uses innerHTML for chat content.
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendMessage() {
  const value = input.value;
  if (!value.trim()) return;

  const encoded = htmlEncode(value);

  const payload = JSON.stringify({ type: "chat", message: encoded });
  ws.send(payload);

  input.value = "";
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
