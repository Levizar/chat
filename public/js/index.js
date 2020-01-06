const socket = io();

const sendBar = document.getElementById("send-bar");
sendBar.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        if (sendBar.value.length) {
            socket.emit("message", sendBar.value);
            sendBar.value = "";
        }
    }
});

const chatHistory = document.getElementById("chat-history");
socket.on("message", message => {
    const date = new Date();
    const newMessage = document.createElement("p");
    newMessage.innerHTML = `
        <span class="time">[${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}]</span>
        <span class="username">${message.author}</span>
    `
    newMessage.appendChild(document.createTextNode(message.content));
    chatHistory.appendChild(newMessage);
});

socket.on("joinRoom", user => {
    // loguer quand quelqu'un rejoint
})

socket.on("leftRoom", user => {
    // loguer quand quelqu'un s'en va
})