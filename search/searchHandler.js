const {app} = require('./searchServer');
const session = require('./session');
const search = require('./search');
module.exports.init = function initSessionPaths() {

    app.get('/api/v1/search/doSearch', (req, res) => {

        if (req.query.session && req.query.searchquery && req.query.searchquery.toString().length >= 2


        ) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {

                        if (uuid) {

                            function deviceName(array) {
                                return new Promise((resolve, reject)=> {
                                    if(req.query.deviceName) {
                                        search.searchForDeviceNames(req.query.searchquery.toString(),uuid).then((result)=> {
                                            resolve(array.concat(result))
                                        });
                                    }else{
                                        resolve(array);
                                    }
                                })
                            }

                            function deviceTypeName(array) {
                                return new Promise((resolve, reject) => {
                                    if(req.query.deviceTypeName) {
                                        search.searchForDeviceTypeNames(req.query.searchquery).then((result)=> {
                                            resolve(array.concat(result))
                                        })
                                    }else{
                                        resolve(array);
                                    }
                                })
                            }

                            deviceName([]).then((array) => {deviceTypeName(array).then((array) => {
                                res.send(JSON.stringify({
                                    result: array
                                }))
                            })})


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