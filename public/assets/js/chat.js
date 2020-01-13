(() => {
    // import socket.io
    const socket = io();
    // liste des utilisateurs
    let userList;
    
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
        userList.push(username);
        userList.sort();
        document.querySelectorAll("#userList > li").forEach(elm => elm.remove());
        userList.forEach(user => {
            cloningTemplate("userList", "userElement");
            document.querySelector("#userList > li:last-child").innerText = user;
        })
    })
    
    // Send a message when an user leave the room and update userList
    socket.on("leaveRoom", username => {
        displayReceivedMessageToChat(username, "est parti... Espérons qu'il revienne vite !");
        userList = userList.filter(user => user !== username);
        const iToDelete = userList.findIndex(elm => elm === `${username}`);
        const nodeToDelete = document.querySelector(`#userList > li:nth-child(${iToDelete +1})`);
        nodeToDelete.remove();
    })
    
    // Send a message to the user on disconnection on the chat page
    socket.on("disconnected", () => {
        displayReceivedMessageToChat("Attention", "Tu as été déco, essaie d'actualiser la page !");
        document.querySelector("#chatBox > p:last-child").classList.add("text-danger");
    });
    
    // Add the list of person when the client connects to the chat
    socket.on("roomData", roomData => {
        // Recreate the userList
        userList = [];
        Object.values(roomData).forEach(user => userList.push(user))
        userList.sort();
        userList.forEach(user => {
            cloningTemplate("userList", "userElement");
            document.querySelector("#userList > li:last-child").innerText = user;
        })
    })
<<<<<<< HEAD
})();
=======
})

>>>>>>> front
