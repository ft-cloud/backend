var app = require('../index.js').app;
var account = require('./account');
var session = require('./session');

module.exports.init = function initAccountPaths() {


    app.get('/account/info', (req, res) => {

        if (req.query.session) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {

                        if (uuid) {
                            account.getAccountByUUID(uuid, (account) => {
                                if (account) {
                                    res.send(JSON.stringify(account));
                                } else {
                                    res.send();
                                }
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
