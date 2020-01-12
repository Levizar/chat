exports.init = (io, sessionManager) => {
    const usersInTheRoom = {};
    io.on("connection", socket => {
        const session = sessionManager.checkSession(socket.request.headers.cookie);
        if (session === null) {
            console.error("\x1b[1m\x1b[31m%s\x1b[0m", "Connection aborted: Cannot find related session for this peer.");
            socket.emit("disconnected");
            return socket.disconnect();
        }
        const { username, userId, isConnected } = session;

        if (Boolean(session.socket) !== false) {
            session.socket++;
        } else {
            session.socket = 1;
            usersInTheRoom[userId] = username;
            socket.emit("roomData", usersInTheRoom);
            io.emit("joinRoom", username);
        }

        socket.on("message", message => {
            if (isConnected) {
                message = message.replace(/\s+/g, " ").trim();
                if (message.length > 1 && message.length <= 512) {
                    const newMessage = {
                        "author"  : username,
                        "content" : message
                    };
                    io.emit("message", newMessage);
                }
            }
        });
        socket.on("disconnect", () => {
            if (--session.socket === 0) {
                delete usersInTheRoom.userId;
                socket.broadcast.emit("leaveRoom", username);
            }
        });
    });
}