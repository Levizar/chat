const socket = io();
// Put the messae in the chat
socket.on("message", message => {
    const chatBox = document.getElementById("chatBox");
    const template = document.getElementById("messageTemplate").cloneNode(true);
    const cloneTemplateContent = document.importNode(template.content, true);
    chatBox.appendChild(cloneTemplateContent);
    const date = new Date();
    const hours = date.getHours();
    const mins = date.getMinutes();
    document.querySelector("#chatBox > p:last-child > span.time").innerText = `[${hours}:${mins}]`;
    document.querySelector("#chatBox > p:last-child > span.username").innerText = `${message.author} :`;
    document.querySelector("#chatBox > p:last-child > span.message").innerText = message.content;
});

// Function to send a message
const sendMessage = () => {
    const chatMessage = document.getElementById('chatMessage');
    let message = chatMessage.value;
    message = message.replace(/\s+/g, " ").trim();
    if (message.length > 1 && message.length <= 512) {
        socket.emit("message", message);
        chatMessage.value = "";
        document.getElementById('msgError').innerText = "";
    } else {
        document.getElementById('msgError').innerText = "Y a un problééééém !";
    }
}

// Add a litener to trigger the send message function
document.getElementById('sendBtn').addEventListener("click", sendMessage);
document.getElementById('chatMessage').addEventListener("keypress", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

// Send a 
socket.on("joinRoom", username => {
    const chatBox = document.getElementById("chatBox");
    const template = document.getElementById("messageTemplate").cloneNode(true);
    const cloneTemplateContent = document.importNode(template.content, true);
    chatBox.appendChild(cloneTemplateContent);
    const date = new Date();
    const hours = date.getHours();
    const mins = date.getMinutes();
    document.querySelector("#chatBox > p:last-child > span.time").innerText = `[${hours}:${mins}]`;
    document.querySelector("#chatBox > p:last-child > span.username").innerText = username;
    document.querySelector("#chatBox > p:last-child > span.message").innerText = "vient d'arriver ! Bienvenue à lui !";
})

socket.on("leaveRoom", username => {
    const chatBox = document.getElementById("chatBox");
    const template = document.getElementById("messageTemplate").cloneNode(true);
    const cloneTemplateContent = document.importNode(template.content, true);
    chatBox.appendChild(cloneTemplateContent);
    const date = new Date();
    const hours = date.getHours();
    const mins = date.getMinutes();
    document.querySelector("#chatBox > p:last-child > span.time").innerText = `[${hours}:${mins}]`;
    document.querySelector("#chatBox > p:last-child > span.username").innerText = username;
    document.querySelector("#chatBox > p:last-child > span.message").innerText = "est parti... Espérons qu'il revienne vite !";
})

socket.on("disconnected", () => {
    // TODO : prévenir le mec qu'il a été déconnecté et lui proposer d'actualiser la page
    const chatBox = document.getElementById("chatBox");
    const template = document.getElementById("messageTemplate").cloneNode(true);
    const cloneTemplateContent = document.importNode(template.content, true);
    chatBox.appendChild(cloneTemplateContent);
    const date = new Date();
    const hours = date.getHours();
    const mins = date.getMinutes();
    const message = document.querySelector("#chatBox > p:last-child");
    message.classList.add("text-danger");
    message.innerText = `Tu as été déco, essaie d'actualiser la page !`;
});