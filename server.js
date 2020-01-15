"use strict";

/**
 * @author Louis Wicket
 */

const fs = require("fs");
const crypto = require("crypto");

const mysql = require("mysql");

const { Client } = require('pg');

const db = new Client({
    user: "vtrgcgnddeyqog",
    password: "61ab990c2b29e951795d92d857130fb30f90ca8aa8c9f18055a215e72fa3b649",
    port: 5432,
    database: "chat",
    connectionString: "postgres://vtrgcgnddeyqog:61ab990c2b29e951795d92d857130fb30f90ca8aa8c9f18055a215e72fa3b649@ec2-54-228-237-40.eu-west-1.compute.amazonaws.com:5432/d70q67a34ir4hi",
    ssl: true,
  });


const sessionManager = require("./src/sessionManager.js"); // A custom module to handle sessions
const { sanitize } = require("./src/sanitize.js"); // A custom module to sanitize inputs
let guestUsersCounter = 0;


// ----------------- EXPRESS: set up ------------------ \\

const express = require("express");
const app = express();
const http = require("http").createServer(app);

app.disable("x-powered-by"); // Prevent express-targeted attacks

// ----------------- EXPRESS: routage ----------------- \\

app.get(/\/(index)?$/i, (req, res) => {
    const session = sessionManager.checkSession(req.headers.cookie);
    // Change the connection button with a logout button if the user is already connected
    if (session && session.isConnected) {
        fs.readFile(__dirname + "/public/index.html", "UTF-8", (err, data) => {
            if (err) console.error(err);
            else res.status(200).send(data.replace('connection">Connecte-toi !', 'logout">Déconnexion'));
        });
    } else res.status(200).sendFile(__dirname + "/public/index.html");
});

app.get("/chat", (req, res) => {
    const session = sessionManager.checkSession(req.headers.cookie) || sessionManager.newSession(res, {
        "userId"      : ++guestUsersCounter,
        "username"    : "Guest " + guestUsersCounter,
        "isConnected" : false
    });

    fs.readFile(__dirname + "/public/chat.html", "UTF-8", (err, data) => {
        if (err) console.error(err);
        else if (session.isConnected) {
            // Change the connection button with a logout button if the user is already connected
            res.status(200).send(data.replace('connection">Connecte-toi !', 'logout">Déconnexion'));
        } else {
            res.status(200).send(data.replace('Ton message ici"', 'Connecte-toi pour pouvoir écrire !" DISABLED').replace(">Envoyer", "DISABLED>Envoyer"));
        }
    });
});

app.get("/connection", (req, res) => {
    // If the user is already connected, redirect him to the chat room
    const session = sessionManager.checkSession(req.headers.cookie); // (Waiting for optional chaining ToT)
    session && session.isConnected ? res.status(301).redirect("/chat") : res.status(200).sendFile(__dirname + "/public/connection.html");
});

app.get("/logout", (req, res) => {
    // If a related session exists, delete it
    if (sessionManager.checkSession(req.headers.cookie) !== null) 
        delete sessionManager.sessions[sessionManager.getSid(req.headers.cookie)];
    res.status(301).redirect("/");
});

app.use(express.static(__dirname + "/public")); // Serve assets
app.get("*", (_, res) => res.status(404).send("error 404"));

// Handle sign up requests
app.post("/signup", (req, res) => {

    // Receive the posted data
    let data = "";
    req.on("data", chunk => {
        data += chunk;
        if (data.length > 1e3) {
            req.destroy();
            res.status(413).send("REQUEST ENTITY TOO LARGE");
        }
    });

    req.on("end", () => {

        // Parse the received data
        try {
            var { username, password, email } = JSON.parse(data);
        } catch {
            console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: failed to parse data`);
            return res.status(400).send("INVALID DATA");
        }

        username = sanitize("username", username);
        password = sanitize("password", password);
        email = sanitize("email", email);

        if (username instanceof Error || password instanceof Error || email instanceof Error) {
            res.status(400).send("INVALID DATA");
            return console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: invalid data`);
        } else password = crypto.createHash("sha256").update(password).digest("base64"); // Hash the password
        
        // PROCESS
        try{
            db.connect();
            // Check that the username is available
            db.query("SELECT id FROM users WHERE username = ? LIMIT 1", username, (err, rows) => {
                if (err) {
                    console.error(err);
                    res.status(500).send();
                } else if (rows.length !== 0) {
                    console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: unavailable username`);
                    res.status(403).send("UNAVAILABLE USERNAME");
                } else {
                    // Create a new user account
                    const userId = crypto.randomBytes(16).toString("hex");
                    db.query(
                        "INSERT INTO users (id, username, sha256_password, email) VALUES (?, ?, ?, ?)", 
                        [
                            userId,
                            username,
                            password,
                            email
                        ],
                        (err, _) => {
                            if (err) {
                                console.error(err);
                                res.status(500).send();
                            }
                            else {
                                console.log("\x1b[1m\x1b[32m%s\x1b[0m", `New account created: ${username}.`);
                                sessionManager.newSession(res, {
                                    "userId"      : userId,
                                    "username"    : username,
                                    "isConnected" : true
                                });
                                res.status(200).send("Account successfully created");
                            }
                        }
                    );
                }
        });
        }catch(err){
            console.error(err);
        } finally{
            db.end();
        }
    });
});

// Handle sign in requests
app.post("/login", (req, res) => {
    
    // Receive the posted data
    let data = "";
    req.on("data", chunk => {
        data += chunk;
        if (data.length > 1e3) {
            req.destroy();
            res.status(413).send("REQUEST ENTITY TOO LARGE");
        }
    });

    req.on("end", () => {
        try {
        const ip = sessionManager.getIp(req);
        // An IP can be blacklisted after too many failed login attempts
        if (sessionManager.isBlacklisted(ip)) return res.status(429).send("TOO MANY REQUESTS");

        // Parse the received data
            var { username, password } = JSON.parse(data);
        } catch {
            console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: failed to parse data`);
            return res.status(400).send("INVALID DATA");
        }

        // SANITIZE

        username = sanitize("username", username);
        password = sanitize("password", password);

        if (username instanceof Error || password instanceof Error) {
            try{
                res.status(400).send("INVALID DATA");
                return console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: invalid data`);
            }catch(err){
                console.error(err)
            }
        } else password = crypto.createHash("sha256").update(password).digest("base64"); // Hash the password

        // PROCESS
        try{
            db.connect();
            db.query("SELECT sha256_password, id FROM users WHERE username = ? LIMIT 1", username, (err, rows) => {
                if (err) {
                    console.error(err);
                    res.status(500).send();
                } else if (rows.length !== 0) {
                    const userData = rows[0];
                    if (userData["sha256_password"] === password) {
    
                        // The user is authenticated: create a new related session
                        sessionManager.newSession(res, {
                            "userId"      : userData["id"],
                            "username"    : username,
                            "isConnected" : true
                        });
                        res.status(200).send("USER SUCCESSFULLY AUTHENTICATED");
                        console.log(`%s${username} %sconnected`, "\x1b[1m\x1b[34m", "\x1b[1m\x1b[32m", "\x1b[0m");
    
                        // Reset the counter of failed login attempts
                        delete sessionManager.failedAttempts[ip];
                    } else {
                        console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: the password doesn't match`);
                        res.status(403).send("WRONG LOGIN DETAILS");
    
                        // If the password doesn't match, increment a counter which blocks the IP when a defined amount of failed attempts is reached
                        sessionManager.failedAttempts[ip] ? sessionManager.failedAttempts[ip]++ : sessionManager.failedAttempts[ip] = 1;
                    }
                } else {
                    console.error("\x1b[1m\x1b[31m%s\x1b[0m", `${req.method} ${req.url}: failed to authenticate the user`);
                    res.status(403).send("WRONG LOGIN DETAILS");
                }
            });
        } catch(err){
            console.error(err)
        } finally{
            db.end();
        }
    });
});

const port = process.env.PORT || 8080; // let the port be set by heroku
http.listen(port, () => console.log("\x1b[1m\x1b[32m%s\x1b[0m", `Listening on port ${port}.`));

// ---------------- SOCKET.IO ---------------- \\

const io = require("socket.io")(http);
require("./src/ws-server.js").init(io, sessionManager);