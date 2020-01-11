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

socket.on("disconnected", () => {
    // TODO : prévenir le mec qu'il a été déconnecté et lui proposer d'actualiser la page
});