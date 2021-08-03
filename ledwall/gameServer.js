const express = require('express');
const https = require("https");
const fs = require("fs");
const app = express();
module.exports.app = app;

const cors = require('cors');

const gameHandler = require("./gameHandler")

global.connection = mysql.createConnection({
    host: '172.17.0.2',
    user: 'root',
    password: 'LEDWall$246#',
    database: "cloud"
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));



global.connection.connect();


app.use(cors());

app.get("/",(req, res) => {
    res.send(JSON.stringify({microService:"Game (LEDWall)"}))
})


app.listen(3000, () => {
    console.log(`LedWall app listening at http://localhost:3000`);
});


gameHandler.init();