const session = require("../account/session");
const drone = require("./drone");
var app = require('../index.js').app;

module.exports.init = function initDronePaths() {


    app.post('/drone/mission/createMission', (req, res) => {

        if (req.body.session&&req.body.name) {
            if(req.body.name.toString().length<4&&req.body.name.toString().length>49) {
                res.send(`{"success":false,"error":"String too long"}`);
                return;
            }
            session.validateSession(req.body.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.body.session);
                    session.getUserUUID(req.body.session.toString(), (uuid) => {

                        if (uuid) {

                            drone.addDroneMission(uuid,req.body.name.toString(),req.body.data).then(missionUUID => {
                                res.send(JSON.stringify({
                                    success: true,
                                    uuid: missionUUID
                                }))
                            })


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

    app.get('/drone/mission/listMissions', (req, res) => {

        if (req.query.session) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {


                            drone.getAllUserMissions(uuid).then(results => {

                                res.send(JSON.stringify({
                                    success: true,
                                    missions: results
                                }))

                            })


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



    app.get('/drone/mission/getMissionData', (req, res) => {

        if (req.query.session&&req.query.missionUUID) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {


                            drone.getDroneMissionData(uuid,req.query.missionUUID.toString()).then(results => {

                                res.send(JSON.stringify({
                                    success: true,
                                    mission: results
                                }))

                            })



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

    app.get('/drone/mission/deleteDroneMission', (req, res) => {

        if (req.query.session&&req.query.missionUUID) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {


                            drone.deleteMission(uuid,req.query.missionUUID.toString()).then(results => {
                                if(results) {
                                    res.send(JSON.stringify({
                                        success: true
                                    }))
                                }else{
                                    res.send(JSON.stringify({
                                        success: false
                                    }))
                                }



                            })



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

    app.post('/drone/mission/saveMissionData', (req, res) => {

        if (req.body.session&&req.body.missionUUID&&req.body.data) {
            session.validateSession(req.body.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.body.session);
                    session.getUserUUID(req.body.session.toString(), (uuid) => {
                        if (uuid) {


                            drone.saveMissionData(uuid,req.body.missionUUID.toString(),req.body.data.toString()).then(results => {

                                res.send(JSON.stringify({
                                    success: true
                                }))

                            })



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
