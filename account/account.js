var uuid = require('uuid');
const crypto = require('crypto');
const hashingSecret = "LEDWAll";
const session = require('./session');


var account = {


    checkAndCreateUser: function (name, email, res, req) {

        var sql = `SELECT *
                   FROM account
                   WHERE name = ?;`;
        global.connection.query(sql, [name.toString()], function (err, result) {
            if (result[0]) {

                res.send('{\"error\":\"Username already exists\",\"errorcode\":\"004\"}');

            } else {

                checkUserEmailExisting(email, res, req);

            }


        });

    },

    login: function (nameOrEmail, password, res) {

        const pw_hash = crypto.createHmac('sha256', hashingSecret).update(password).digest('hex');

        var sql = `SELECT *
                   FROM account
                   WHERE (name = ? OR email = ?)
                     AND password = ?`;
        global.connection.query(sql, [nameOrEmail, nameOrEmail, pw_hash], function (err, result) {
            if (result && result[0]) {

                res.send(`{\"info\":\"loged in\",\"session\":\"${session.startsession(result[0].uuid)}\"}`);

            } else {
                res.send('{\"error\":\"email or password incorrect\",\"errorcode\":\"003\"}');


            }


        });


    },
    isUserAdmin: function(uuid,callback) {

        var sql = `SELECT admin FROM account WHERE uuid = ?`;
        global.connection.query(sql,[uuid],function(err,result) {
            callback(result[0].admin);
        })

    },

    getAccountByUUID: function (uuid, callback) {
        var sql = `SELECT uuid, name, created_at, installedApps
                   FROM account
                   WHERE uuid = ?;`;
        global.connection.query(sql, [uuid.toString()], function (err, result) {

            if (result && result[0]) {
                callback(result[0]);

            } else {

                callback(undefined);

            }


        });


    },
    getAccountSettings: function (uuid, callback) {
        var sql = `SELECT settings
                   FROM account
                   WHERE uuid = ?;`;
        global.connection.query(sql, [uuid.toString()], function (err, result) {

            if (result && result[0]) {
                callback(result[0].settings);

            } else {

                callback(undefined);

            }


        });


    }



};

module.exports = account;


function checkUserEmailExisting(email, res, req) {

    var sql = `SELECT 1 FROM account WHERE email = '${email.toString()}';`;

    global.connection.query(sql, function (err, result) {
        if (err) throw err;

        if (result[0]) {
            res.send('{\"error\":\"Email already exists\",\"errorcode\":\"005\"}');

        } else {
            createUser(req, res);

        }


    });

}

function createUser(req, res) {
    const pw_hash = crypto.createHmac('sha256', hashingSecret).update(req.body.password.toString()).digest('hex');

    const user = uuid.v4();
    var sql = `INSERT INTO account (uuid,email,password,name) VALUES ('${user}', '${req.body.email.toString()}','${pw_hash}','${req.body.name.toString()}')`;
    global.connection.query(sql, function (err, result) {
        if (err) throw err;
    });

    res.send(`{\"success\":\"Account creating done\",\"session\":\"${session.startsession(user)}\"}`);
}
