function sendMessage() {
    const input = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("div");
    msg.textContent = "You: " + input.value;
    chatBox.appendChild(msg);
    input.value = "";
  }
  