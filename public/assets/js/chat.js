const socket = io();
socket.on("message", message => {
    alert(message.content)
});