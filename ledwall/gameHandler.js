const {app} = require('./gameServer');
var session = require('./session');
var apps = require('./game');
const device = require("./device");

module.exports.init = function initGamePaths() {
    app.get('/api/v1/game/app/setDefaultScore', (req, res) => {
        if (req.query.session && req.query.scoreuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {

                        if (uuid) {

                            apps.getAppUUIDByScore(req.query.scoreuuid, (appuuid) => {

                                apps.setDefaultScore(req.query.scoreuuid, appuuid, uuid, (retrun) => {
                                    res.send(`{"success":true}`);


                                });
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


    app.get('/api/v1/game/app/listinstalled', (req, res) => {
        if (req.query.session) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {

                        if (uuid) {
                            apps.listInstalledApps(uuid, (InstalledApps) => {

                                if (InstalledApps) {
                                    res.send(`{"list": ${InstalledApps}}`);

                                } else {
                                    res.send('{\"error\":\"No valid Session!\",\"errorcode\":\"006\"}');

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

    app.get('/api/v1/game/app/addScore', (req, res) => {
        if (req.query.session && req.query.name && req.query.appuuid && req.query.name.length > 3) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.addScore(uuid, req.query.name, req.query.appuuid, (r) => {
                                res.send(`{"success":true,"uuid":"${r}"}`);
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

    app.get('/api/v1/game/app/getScoreConfig', (req, res) => {

        if (req.query.session && req.query.scoreuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.hasReadPermission(req.query.scoreuuid.toString(), uuid, (check) => {

                                if (check) {

                                    apps.getUserAppConfig(req.query.scoreuuid.toString(), (userconfig) => {

                                        if (userconfig !== undefined) {
                                            res.send(`{"success":true,"config":${userconfig}}`);
                                        } else {
                                            res.send('{\"error\":\"No valid score!\",\"errorcode\":\"007\"}');
                                        }

                                    });

                                } else {

                                    res.send('{\"error\":\"No Read Permission!\",\"errorcode\":\"008\"}');

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

    app.get('/api/v1/game/app/getAppScores', (req, res) => {
        if (req.query.session && req.query.appuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.getScores(req.query.appuuid, uuid, (scors) => {

                                res.send(JSON.stringify(scors));


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


    app.get('/api/v1/game/app/saveAppScore', (req, res) => {

        if (req.query.session && req.query.scoreuuid && req.query.params) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.hasWritePermission(req.query.scoreuuid, uuid, (permission) => {
                                if (permission) {
                                    apps.updateScore(req.query.scoreuuid, req.query.params, () => {
                                        res.send('{\"success\":\"Updated Settings\"}');
                                    });


                                } else {

                                    res.send('{\"error\":\"No write Permission!\",\"errorcode\":\"009\"}');

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


    app.get('/api/v1/game/app/deleteAppScore', (req, res) => {

        if (req.query.session && req.query.scoreuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.hasWritePermission(req.query.scoreuuid, uuid, (permission) => {
                                if (permission) {
                                    apps.deleteScore(req.query.scoreuuid, () => {
                                        res.send('{\"success\":\"Delete Settings\"}');
                                    });
                                } else {
                                    res.send('{\"error\":\"No write Permission!\",\"errorcode\":\"009\"}');
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


    app.get('/api/v1/game/app/getInstallURL', (req, res) => {

        if (req.query.session && req.query.appuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);


                    apps.getInstallURL(req.query.appuuid, (url) => {
                        res.send('{\"success\":' + JSON.stringify(url) + '}');
                    });


                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');

        }
    });


    app.get('/api/v1/game/app/install', (req, res) => {

        if (req.query.session && req.query.appuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.installApp(uuid, req.query.appuuid, () => {
                                res.send(`{"success":true}`);
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


    app.get('/api/v1/game/app/remove', (req, res) => {

        if (req.query.session && req.query.appuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.removeApp(uuid, req.query.appuuid, (success) => {
                                if (success) {
                                    res.send(`{"success":true}`);
                                } else {
                                    res.send(`{"success":false}`);
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

    })


    app.get('/api/v1/game/app/removeReadScore', (req, res) => {

        if (req.query.session && req.query.scoreuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.removeReadScore(uuid, req.query.scoreuuid, (success) => {
                                if (success) {
                                    res.send(`{"success":true}`);
                                } else {
                                    res.send(`{"success":false}`);
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

    app.get('/api/v1/game/app/removeWriteScore', (req, res) => {

        if (req.query.session && req.query.scoreuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            apps.removeWriteScore(uuid, req.query.scoreuuid, (success) => {
                                if (success) {
                                    res.send(`{"success":true}`);
                                } else {
                                    res.send(`{"success":false}`);
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


    app.get('/api/v1/game/app/getData', (req, res) => {

        if (req.query.session && req.query.appuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {


                            apps.getAppData(req.query.appuuid, (result) => {

                                res.send(`{"success":true,"data":${JSON.stringify(result)}}`);
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

    app.get('/api/v1/game/listinstalledcompatibleapps', (req, res) => {
        if (req.query.deviceuuid && req.query.session) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {

                        if (uuid) {


                            device.getDeviceTypFromDevice(req.query.deviceuuid, (deviceTyp) => {

                                apps.listInstalledCompatibleApps(uuid, deviceTyp.UUID, (apps) => {

                                    if (apps) {
                                        res.send(`{"list": ${apps}}`);

                                    } else {
                                        res.send('{\"error\":\"No valid Session!\",\"errorcode\":\"006\"}');

                                    }

                                });

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