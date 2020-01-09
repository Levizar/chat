"use strict";
const fs = require("fs");
const crypto = require("crypto");

// DATABASES

// mysql
const mysql = require("mysql");
const dbLogin = JSON.parse(fs.readFileSync("login.json"));
// sessions
const sessions = JSON.parse(fs.readFileSync("sessions.json"));

// EXPRESS SERVER

const express = require("express");
const app = express();
const http = require("http").createServer(app);

app.disable("x-powered-by"); // Prevent express-targeted attacks

function handleSession(cookies) {
    const sid = /(?<=sid=)[^(;|^)]+/.exec(cookies);
    return sessions[sid] || null;
}

app.get("/", (req, res) => {
    handleSession(req.headers.cookie);
    res.sendFile(__dirname + "/public/index.html")
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
            // console.log(crypto.randomBytes(16).toString("hex"))
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
                        const sid = Math.random().toString(36).substring(2);
                        sessions[sid] = {
                            "userId"   : userData["id"],
                            "username" : username
                        };
                        console.log(sessions)
                    } else console.log("non")
                    // res.setHeader(`Set-Cookie", "sid=${id}; HttpOnly`);
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