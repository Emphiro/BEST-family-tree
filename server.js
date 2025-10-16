// Load HTTP module
const express = require("express");
const port = 3000;

const app = express();
app.use(express.static(__dirname + "/"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/dist/index.html");
});
app.get("/bundle.js", (req, res) => {
    res.sendFile(__dirname + "/dist/bundle.js");
});
app.get("/style.css", (req, res) => {
    res.sendFile(__dirname + "/dist/style.css");
});

app.listen(port);
