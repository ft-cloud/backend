const {app} = require('./deviceServer');
const session = require('./session');
const device = require('./device');

module.exports.init = function initDevicePaths() {


    app.get('/api/v1/device/listAvailable', (req, res) => {

        if (req.query.session) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);

                    device.listAll((devices) => {
                        if (devices) {
                            res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                        } else {
                            res.send(`{"success":false}`);
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


    app.get('/api/v1/device/listSpecificUserDevice', (req, res) => {

        if (req.query.session && req.query.device) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.listSpecificDevice(uuid, req.query.device.toString(), (devices) => {
                                if (devices) {
                                    res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
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


    app.get('/api/v1/device/getUserSpecificDeviceInfo', (req, res) => {

        if (req.query.session && req.query.device) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.getUserSpecificDeviceInfo(uuid, req.query.device.toString(), (devices) => {

                                if(devices.error) {
                                    res.send(JSON.stringify(devices));
                                }else{
                                    res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
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


    app.get('/api/v1/device/changeDeviceName', (req, res) => {

        if (req.query.session && req.query.device && req.query.newName) {
            if(req.query.newName.toString().length<4&&req.query.newName.toString().length>49) {
                res.send(`{"success":false,"error":"String too long"}`);
                return;
            }
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.getUserSpecificDeviceInfo(uuid, req.query.device.toString(), (devices) => {

                                if(devices.error) {
                                    res.send(JSON.stringify(devices));
                                }else{
                                    device.changeDeviceName(req.query.device,req.query.newName,(result) => {
                                        if(result) {
                                            res.send(`{"success":true}`)
                                        }else{
                                            res.send(`{"success":false}`)

                                        }
                                    });


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




    app.get('/api/v1/device/getDeviceConfig', (req, res) => {

        if (req.query.session && req.query.device) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid, req.query.device).then((result) => {

                                if (result) {

                                    device.getDeviceConfig(uuid, req.query.device.toString(), (devices) => {
                                        if (devices) {
                                            res.send(`{"success":true,"data":${devices}}`);
                                        } else {
                                            res.send(`{"success":false}`);
                                        }
                                    });
                                } else {
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');
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


    app.get('/api/v1/device/changeStatusInfo', (req, res) => {

        if (req.query.session && req.query.device && req.query.infokey && req.query.value) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.geliveDeviceConnectiontUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid, req.query.device).then((result) => {

                                if (result) {
                                    device.updateStatusInfo(req.query.device, req.query.infokey, req.query.value, () => {
                                        res.send(`{"success":true}`);

                                    });

                                } else {
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');

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

    app.get('/api/v1/device/getStatusInfo', (req, res) => {

        if (req.query.session && req.query.deviceuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid, req.query.deviceuuid).then((result) => {

                                if (result) {
                                    device.getStatusInfo(req.query.deviceuuid).then(r => {
                                        res.send(`{"success":true,"data":${r}}`);

                                    })



                                } else {
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');

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




    //TODO FIX MICROSERVICE LIVE TCP CONNECTION DEVICE DELETE BUG
    app.get('/api/v1/device/deleteDevice', (req, res) => {

        if (req.query.session && req.query.deviceuuid) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid,req.query.deviceuuid).then((result)=> {
                                if(result) {

                                    device.deleteDeviceConnection(req.query.deviceuuid, (result) => {
                                        if (result) {
                                            device.deleteAPIKey(req.query.deviceuuid, () => {

                                             //   console.log("hätte klappen müssen")
                                               // if(TCPLiveConnection.liveDevices[req.query.deviceuuid]!==undefined) {
                                               //     TCPLiveConnection.deleteDevice(TCPLiveConnection.liveDevices[req.query.deviceuuid]);
                                              //  }

                                                try {
                                                   // if (liveDeviceConnection.get(req.query.deviceuuid)) { //<- Deprecated
                                                    //    liveDeviceConnection.get(req.query.deviceuuid).close();
                                                     //   liveDeviceConnection.delete(req.query.deviceuuid);
                                                   // }


                                                } catch (e) {
                                                }

                                                res.send('{\"success\":\"true\"}');
                                            });
                                        } else {
                                            res.send('{\"error\":\"No write Permission\",\"errorcode\":\"009\"}');
                                        }
                                    });


                                }else{
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');
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


    app.post('/api/v1/device/saveConfig', (req, res) => {

        if (req.body.session && req.body.deviceuuid && req.body.param && req.body.value) {
            session.validateSession(req.body.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.body.session);
                    session.getUserUUID(req.body.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid,req.body.deviceuuid).then((result) => {

                                if(result) {
                                    console.log(req.body.param)
                                    console.log(req.body.value)
                                    device.updateDeviceConfig(req.body.deviceuuid, req.body.param,req.body.value).then(value => {
                                       // if (liveDeviceConnection.has(req.body.deviceuuid)) {
                                        //    liveDeviceConnection.get(req.body.deviceuuid).send(packWSContent("configChange", `${req.body.params}`));
                                       // }
                                        res.send('{\"success\":\"Updated Settings\"}');

                                    });
                                }else{
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');

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
