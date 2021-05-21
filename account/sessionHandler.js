var app = require('../index.js').app;
var session = require('./session');
var account = require('./account')

module.exports.init = function initSessionPaths() {

    app.get('/auth/signup', (req, res) => {

        const error = validateSignUp(req.query.name, req.query.email, req.query.password);
        if (error) {
            res.send(error);
        } else {
            account.checkAndCreateUser(req.query.name.toString(), req.query.email.toString(), res, req);

        }
    });


    app.get('/auth/signin', (req, res) => {

        if (req.query.eorn && req.query.password) {
            account.login(req.query.eorn.toString(), req.query.password.toString(), res);
        } else {
            res.send('{\"error\":\"please provide name or email and password!\",\"errorcode\":\"001\"}');

        }
    });
    app.get('/auth/signout', (req, res) => {
        if (req.query.session) {
            session.deleteSession(req.query.session.toString(), res);
        } else {
            res.send('{\"error\":\"please provide valid session!\",\"errorcode\":\"001\"}');
        }

    });

    app.get('/auth/validateSession', (req, res) => {


        if (req.query.session) {
            session.validateSession(req.query.session.toString(), (result) => {
                if (result) {
                    res.send("{\"success\": true}");

                } else {

                    res.send("{\"success\": false}");

                }
            });
        } else {
            res.send('{\"error\":\"please provide valid session!\",\"errorcode\":\"001\",\"success\":false}');
        }
    });

    app.get('/auth/addAPIKey', (req, res) => {

        if (req.query.session) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {
                            const AddUuid = "unknown";
                            session.generateAPIKey(uuid, AddUuid, (apiKey) => {


                                //Store User Device

                                //Answer Request
                                res.send(`{"success":"${apiKey}"}`);


                            });


                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');

                        }

                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });



}