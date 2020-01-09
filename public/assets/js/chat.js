const socket = io();
socket.on("message", message => {
    alert(message.content)
});

socket.on("joinRoom", username => {
    alert(username + " vient d'arriver");
})

socket.on("leaveRoom", username => {
    alert(username + " est parti");
})