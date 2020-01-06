// import mod fs (API to interact with file system) and crypto (mod to crypt the password)
const fs = require("fs");
const crypto = require("crypto");

// ------------------ MYSQL ------------------ \\

// crypt ID for token
const id = crypto.randomBytes(16).toString("hex");
console.log(id);

// import mysql
const mysql = require("mysql");

// need to see an exemple of login.json
// Why json if sql?
const {
    user,
    password
} = JSON.parse(fs.readFileSync("login.json"));

// Connection to the data base
const db = mysql.createConnection({
    host: "localhost",
    user: user,
    password: password,
    port: 3300,
    database: "chat"
});

db.connect();

// ----------------- EXPRESS ----------------- \\

// import module express
const express = require("express");
// initialize the express server
const app = express();
const http = require("http").createServer(app);

// listen Get request on root and send back index.html
app.get("/", (_, res) => res.sendFile(__dirname + "/public/html/index.html"));
// app.get("/assets/css/css.css", (_, res) => res.sendFiles (_dirname, "/public/assets/css/style.css"))
// all the request for static ressources are processed by the line below, idem for .png, .jpg, etc
app.use(express.static(__dirname + "/public"));
// answer to 404 status
app.get("*", (_, res) => res.status(404).send("error 404"));

//// Louis' method for post request (= node vanilla method) : see if it exists in express
// here is how we handle the post request
app.post("/html/ptdr", (req, res) => {
    let data = "";
    // Data are received piece by piece and not entirely.
    // Thus we have to reconstruct the data received.
    req.on("data", chunk => {
        data += chunk;
        // if the data is a flood attack : kill the request
        if (data.length > 1e3) req.destroy();
    });
    // at the end of the request : execute this function
    // For example: here we 
    req.on("end", () => {
        const signUp = JSON.parse(data);
        db.query(`SELECT * FROM users WHERE username = '${signUp.username}' LIMIT 1`, (err, rows) => {
            if (err) console.error(err);
            if (rows.length) {
                console.log("déjà dedans")
            } else console.log("ok")
        });
    });
});


http.listen(3000, () => {
    console.log("listening on *:3000");
});

// "SELECT * FROM users WHERE username = 512Louis"

// db.query("SELECT * FROM users WHERE username = 'lol' LIMIT 1", function(err, rows, fields) {
//     if (err) throw err;
//     console.log(rows);
// });

// db.end();

// ---------------- SOCKET.IO ---------------- \\

// import module socket.io
const io = require("socket.io")(http);

io.on("connection", socket => {
    console.log(`%s${socket.id} %sconnected`, "\x1b[1m\x1b[34m", "\x1b[1m\x1b[32m", "\x1b[0m");
    socket.broadcast.emit("joinRoom", socket.id);

    socket.on("disconnect", () => {
        console.log(`%s${socket.id} %sdisconnected`, "\x1b[1m\x1b[34m", "\x1b[1m\x1b[31m", "\x1b[0m");
        socket.broadcast.emit("leftRoom", socket.id);
    });
    socket.on("message", message => {

        // SANITIZE
        // BROADCAST
        console.log(`%s${socket.id}: %s${message}`, "\x1b[1m\x1b[34m", "\x1b[0m");
        const newMessage = {
            content: message,
            author: socket.id
        };

        socket.emit("message", newMessage)
            .broadcast.emit("message", newMessage);
    })
});