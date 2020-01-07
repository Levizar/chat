"use strict";
const fs = require("fs");
const crypto = require("crypto");

// MYSQL DATABASE

const mysql = require("mysql");
const dbLogin = JSON.parse(fs.readFileSync("login.json"));

// EXPRESS SERVER

const express = require("express");
const app = express();
const http = require("http").createServer(app);

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
// app.get("/room//.*", (req, res) => res.sendFile(__dirname + "/public/chat.html"));
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
            data = JSON.parse(data);
        } catch {
            console.log("lol")
            return res.status(400).send("INVALID DATA");
        }

        if (data.username && data.password) {
            db.query(`SELECT * FROM users WHERE username = '${data.username}' LIMIT 1`, (err, rows) => {
                if (err) return console.error(err);
                else if (rows.length) {
                    console.log("déjà dedans")
                } else console.log("ok")
            });
        } else {
            console.log("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: someone sended invalid data`);
            res.status(400).send("INVALID DATA");
        }
        // const signUp = JSON.parse(data);
        // const db = mysql.createConnection(dbLogin);
        // db.connect();
        // db.query(`SELECT * FROM users WHERE username = '${signUp.username}' LIMIT 1`, (err, rows) => {
        //     if (err) console.error(err);
        //     else if (rows.length) {
        //         console.log("déjà dedans")
        //     } else console.log("ok")
        // });
        // db.end();
    });
});

http.listen(8080, () => {
    console.log("listening on 8080");
});