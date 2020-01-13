// import socket.io
const socket = io();

// Function to clone a template
const cloningTemplate = (targetID, templateID) => {
    const target = document.getElementById(`${targetID}`);
    const template = document.getElementById(`${templateID}`).cloneNode(true);
    const cloneTemplateContent = document.importNode(template.content, true);
    target.appendChild(cloneTemplateContent);
}

// Function to display a message to the chat
const displayReceivedMessageToChat = (username, content) => {
    cloningTemplate("chatBox", "messageTemplate");
    const date = new Date();
    const hours = date.getHours();
    const mins = date.getMinutes();
    document.querySelector("#chatBox > p:last-child > span.time").innerText = `[${hours < 10 ? "0" + hours : hours}:${mins < 10 ? "0" + mins : mins}]`;
    document.querySelector("#chatBox > p:last-child > span.username").innerText = `${username} :`;
    document.querySelector("#chatBox > p:last-child > span.message").innerText = content;
}

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
        document.getElementById('msgError').innerText = "Votre message doit faire une taille comprise entre 1 et 512 caractères";
    }
}

// Put the message in the chat
socket.on("message", message => {
    displayReceivedMessageToChat(message.author, message.content);
});


// Add a litener to trigger the send message function
document.getElementById('sendBtn').addEventListener("click", sendMessage);
document.getElementById('chatMessage').addEventListener("keypress", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

// Send a message when an user join the room
socket.on("joinRoom", username => {
    displayReceivedMessageToChat(username, "vient d'arriver ! Bienvenue à lui !");
})

// Send a message when an user leave the room
socket.on("leaveRoom", username => {
    displayReceivedMessageToChat(username, "est parti... Espérons qu'il revienne vite !");
    // TODO: EDIT USERLIST
    // document.querySelector("#chatBox > p:last-child > span.message").innerText = "est parti... Espérons qu'il revienne vite !";
})

// Send a message to the user on disconnection on the chat page
socket.on("disconnected", () => {
    displayReceivedMessageToChat("Attention", "Tu as été déco, essaie d'actualiser la page !");
    const message = document.querySelector("#chatBox > p:last-child");
    message.classList.add("text-danger");
});

socket.on("roomData", roomData => {
    Object.values(roomData).forEach( user => {
        cloningTemplate("userList", "userElement");
        document.querySelector("#userList > li:last-child").innerText = user;
    })
})

