"use strict";
const fs = require("fs");
const crypto = require("crypto");

// DATABASES

// mysql
const mysql = require("mysql");
const dbLogin = JSON.parse(fs.readFileSync("login.json"));
// sessions
const sessionManager = require("./src/sessionManager.js");
let guestUsersCounter = 0;


// ----------------- EXPRESS: set up ------------------ \\

const express = require("express");
const app = express();
const http = require("http").createServer(app);

app.disable("x-powered-by"); // Prevent express-targeted attacks

// ----------------- EXPRESS: routage ----------------- \\

app.get(/\/(index)?$/i, (req, res) => {
    sessionManager.checkSession(req.headers.cookie) || sessionManager.newSession(res, {
        "userId"    : ++guestUsersCounter,
        "username"  : "Guest " + guestUsersCounter,
        "isConnected" : false
    });
    res.sendFile(__dirname + "/public/index.html")
});

app.get("/chat", (req, res) => {
    sessionManager.checkSession(req.headers.cookie) || sessionManager.newSession(res, {
        "userId"    : ++guestUsersCounter,
        "username"  : "Guest " + guestUsersCounter,
        "isConnected" : false
    });
    res.sendFile(__dirname + "/public/chat.html");
});

app.get("/connection", (req, res) => {
    // If the user is already connected, redirect him to the chat room
    const session = sessionManager.checkSession(req.headers.cookie);
    session && session.isConnected ? res.status(301).redirect("/chat") : res.sendFile(__dirname + "/public/connection.html");
});

app.use(express.static(__dirname + "/public")); // Serve assets
app.get("*", (_, res) => res.status(404).send("error 404"));

app.post("/signup", (req, res) => {
    let data = "";
    req.on("data", chunk => {
        data += chunk;
        if (data.length > 1e3) req.destroy();
    });

    req.on("end", () => {
        try {
            var { username, password, mail } = JSON.parse(data);
        } catch {
            console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: failed to parse data`);
            return res.status(400).send("INVALID DATA");
        }

        if (username && password && mail) {
            // TODO: Sanitize
            password = crypto.createHash("sha256").update(password).digest("base64"); // Hash the password
            const db = mysql.createConnection(dbLogin);
            db.connect();
            db.query(
                `INSERT INTO users (id, username, sha256_password, email) VALUES ?`, 
                [
                    crypto.randomBytes(16).toString("hex"),
                    username,
                    password,
                    mail
                ],
                (err, _) => {
                    if (err) {
                        db.end();
                        return console.error(err);
                    } else {
                        console.log("New entry successfully created");
                    }
                }
            );
            db.end();
        }
    });
});

app.post("/login", (req, res) => {
    let data = "";
    req.on("data", chunk => {
        data += chunk;
        if (data.length > 1e3) req.destroy();
    });

    req.on("end", () => {
        try {
            var { username, password } = JSON.parse(data);
        } catch {
            console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: failed to parse data`);
            return res.status(400).send("INVALID DATA");
        }

        if (username && password) {
            // SANITIZE
            if (typeof username !== "string" || typeof password !== "string") {
                res.status(400).send("INVALID DATA");
                return console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: invalid data`);
            }
            username = username.trim();
            if (!/^\w{3,20}$/i.test(username) && password.length < 31 && password.length > 5) {
                res.status(400).send("INVALID DATA");
                return console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: invalid data`);
            }
            password = crypto.createHash("sha256").update(password).digest("base64");
            // PROCESS
            const db = mysql.createConnection(dbLogin);
            db.connect();
            db.query(`SELECT sha256_password, id FROM users WHERE username = ? LIMIT 1`, username, (err, rows) => {
                if (err) {
                    db.end();
                    return console.error(err);
                } else if (rows.length) {
                    const userData = rows[0];
                    if (userData["sha256_password"] === password) {
                        // tout est bon, on peut connecter le mec
                        sessionManager.newSession(res, {
                            "userId"      : userData["id"],
                            "username"    : username,
                            "isConnected" : true
                        });
                        res.send("lol");
                        console.log(`%s${username} %sconnected`, "\x1b[1m\x1b[34m", "\x1b[1m\x1b[32m", "\x1b[0m");
                    } else console.log("non")
                } else console.log(rows)
            });
            db.end();
        } else {
            console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: invalid data`);
            res.status(400).send("INVALID DATA");
        }
    });
});

http.listen(8080, () => console.log("\x1b[1m\x1b[32m%s\x1b[0m", "Listening on port 8080."));

// ---------------- SOCKET.IO ---------------- \\

const io = require("socket.io")(http);
const usersInTheRoom = {};
io.on("connection", socket => {
    const session = sessionManager.checkSession(socket.request.headers.cookie);
    if (session === null) {
        console.error("\x1b[1m\x1b[31m%s\x1b[0m", "Connection aborted: Cannot find related session for this peer.");
        return socket.disconnect();
    }
    const { username, userId, isConnected } = session;

    if (usersInTheRoom[userId] !== void null) {
        usersInTheRoom[userId]++;
    } else {
        usersInTheRoom[userId] = 1;
        socket.emit("joinRoom", username)
              .broadcast.emit("joinRoom", username);
    }

    socket.on("message", message => {
        if (isConnected) {
            // TODO : Sanitize message
            const newMessage = {
                "author"  : username,
                "content" : message
            };
            socket.emit("message", newMessage)
                  .broadcast.emit("message", newMessage);
        }
    });
    socket.on("disconnect", () => {
        if (--usersInTheRoom[userId] === 0) {
            delete usersInTheRoom[userId];
            socket.broadcast.emit("leaveRoom", username);
        }
    });
});