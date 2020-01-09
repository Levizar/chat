"use strict";
const fs = require("fs");
const crypto = require("crypto");

// DATABASES

// mysql
const mysql = require("mysql");
const dbLogin = JSON.parse(fs.readFileSync("login.json"));
// sessions
const sessions = {};

// EXPRESS SERVER

const express = require("express");
const app = express();
const http = require("http").createServer(app);

app.disable("x-powered-by"); // Prevent express-targeted attacks

function handleSession(cookies) {
    const sid = /(?<=sid=)[^(;|^)]+/.exec(cookies);
    return sid ? sessions[sid[0]] : null;
}

function generateSid() {
    return Math.random().toString(36).substring(2);
}

app.get(/\/(index)?$/i, (req, res) => {
    handleSession(req.headers.cookie);
    res.sendFile(__dirname + "/public/index.html")
    console.log(req.headers.cookie)
});
app.get("/chat", (req, res) => {
    res.sendFile(__dirname + "/public/chat.html");
});
app.get("/connection", (req, res) => {
    const connectStatus = handleSession(req.headers.cookie);
    console.log(connectStatus)
    if (connectStatus) res.sendFile(__dirname + "/public/connection.html");
    else res.sendFile(__dirname + "/public/chat.html");
});
app.use(express.static(__dirname + "/public")); // Serve assets
app.get("*", (_, res) => res.status(404).send("error 404"));

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
                        const sid = generateSid();
                        sessions[sid] = {
                            "userId"   : userData["id"],
                            "username" : username
                        };
                        res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly`);
                        res.send("lol");
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

http.listen(8080, () => console.log("listening on port 8080"));

// ---------------- SOCKET.IO ---------------- \\

let guestNumber = 0;
const io = require("socket.io")(http);

io.on("connection", socket => {
    const session = handleSession(socket.request.headers.cookie);
    const username = session ? session.username : "Guest " + ++guestNumber;
    socket.on("message", message => {
        if (session) {
            const newMessage = {
                "author"  : username,
                "content" : message
            };
            socket.emit("message", newMessage)
                  .broadcast.emit("message", newMessage);
        }
    });
});