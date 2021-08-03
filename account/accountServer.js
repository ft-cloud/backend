const express = require('express');
const app = express();
module.exports.app = app;

const cors = require('cors');
const mysql = require('mysql');


const accountHandler = require("./accountHandler");
const sessionHandler = require("./sessionHandler");


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
    res.send(JSON.stringify({microService:"Account"}))
})


accountHandler.init();
sessionHandler.init();

app.listen(3000, () => {
    console.log(`Account app listening at http://localhost:3000`);

});



