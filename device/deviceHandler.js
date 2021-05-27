var app = require('../index.js').app;
var account = require('../account/account');
var session = require('../account/session');
var apps = require('../ledwall/app');
var device = require('./device');

module.exports.init = function initDevicePaths() {


    app.get('/device/listAvailable', (req, res) => {

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


    app.get('/device/listSpecificUserDevice', (req, res) => {

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


    app.get('/device/getUserSpecificDeviceInfo', (req, res) => {

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


    app.get('/device/changeDeviceName', (req, res) => {

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




    app.get('/device/getDeviceConfig', (req, res) => {

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
                                            res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
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


    app.get('/device/changeStatusInfo', (req, res) => {

        if (req.query.session && req.query.device && req.query.infokey && req.query.value) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
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


    const registrationCodes = [];
    app.get('/device/getRegistrationCode', (req, res) => {

        var regCode;
        var counter = 0;
        while (counter < 200) {
            const random = Math.floor(Math.random() * 16383); //Because this is in bin 14 length
            if (!registrationCodes.includes(random)) {
                regCode = random;
                console.log("Reg Code is: " + regCode);
                registrationCodes.push(regCode);
                break;
            }
            counter++;

        }
        if (counter > 199) {
            res.send("something went wrong (No Registration Keys available)");


        }
        const tempOBJ = {
            token: regCode

        };

        res.send(JSON.stringify(tempOBJ));

    });


    const waitForRegistrationDevices = [];

    app.get('/device/waitForRegistration', (req, res) => {


        if (req.query.regCode && req.query.deviceUUID && req.query.deviceName) {

            if (registrationCodes.includes(Number.parseInt(req.query.regCode))) {
                var objTest = {
                    uuid: req.query.deviceUUID.toString(),
                    res: res,
                    name: req.query.deviceName
                };


                waitForRegistrationDevices[req.query.regCode.toString()] = objTest;

            } else {
                res.send('{\"error\":\"No valid registration code!\",\"errorcode\":\"010\"}');


            }

        } else {

            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });


    app.get('/device/registerByCode', (req, res) => {

        if (req.query.regCode && req.query.session) {


            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            if (registrationCodes.includes(Number.parseInt(req.query.regCode))) {
                                if(waitForRegistrationDevices[req.query.regCode.toString()] === undefined) {

                                    const indexOfCode = registrationCodes.indexOf(Number.parseInt(req.query.regCode));
                                    if (indexOfCode > -1) registrationCodes.splice(indexOfCode, 1);

                                    const indexOfRequest = waitForRegistrationDevices.indexOf(waitForRegistrationDevices[req.query.regCode.toString()]);
                                    if (indexOfRequest > -1) registrationCodes.splice(indexOfRequest, 1);
                                    res.send('{\"error\":\"No Device is waiting for this registration!\",\"errorcode\":\"010\"}');

                                    return;

                                }

                                //Create Devices in Database
                                device.createDeviceEntry(waitForRegistrationDevices[req.query.regCode.toString()].uuid.toString(), waitForRegistrationDevices[req.query.regCode.toString()].name.toString(), (AddUuid) => {

                                    session.generateAPIKey(uuid, AddUuid, (apiKey) => {

                                        waitForRegistrationDevices[req.query.regCode.toString()].res.send(`{"success":"true","APIKey":"${apiKey}","deviceuuid":"${AddUuid}"}`);

                                        //Store User Device
                                        device.storeUserDevices(AddUuid, uuid, waitForRegistrationDevices[req.query.regCode.toString()].uuid.toString(), () => {

                                            //Answer Request
                                            res.send(`{"success":"Registration done","deviceType":"${waitForRegistrationDevices[req.query.regCode.toString()].uuid.toString()}","uuid":"${AddUuid}"}`);


                                            //Remove Temp vars
                                            const indexOfCode = registrationCodes.indexOf(Number.parseInt(req.query.regCode));
                                            if (indexOfCode > -1) registrationCodes.splice(indexOfCode, 1);

                                            const indexOfRequest = waitForRegistrationDevices.indexOf(waitForRegistrationDevices[req.query.regCode.toString()]);
                                            if (indexOfRequest > -1) registrationCodes.splice(indexOfRequest, 1);


                                        });


                                    });


                                });

                            } else {
                                res.send('{\"error\":\"No valid registration code!\",\"errorcode\":\"010\"}');
                            }

                        } else {
                            res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

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


    app.get('/device/deleteDevice', (req, res) => {

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
                                                try {
                                                    if (liveDeviceConnection.get(req.query.deviceuuid))
                                                        liveDeviceConnection.get(req.query.deviceuuid).close();
                                                } catch (e) {
                                                }
                                                liveDeviceConnection.delete(req.query.deviceuuid);

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


    app.get('/device/saveConfig', (req, res) => {

        if (req.query.session && req.query.deviceuuid && req.query.params) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid,req.query.deviceuuid).then((result) => {

                                if(result) {

                                    device.updateDeviceConfig(req.query.deviceuuid, req.query.params, () => {
                                        if (liveDeviceConnection.has(req.query.deviceuuid)) {
                                            liveDeviceConnection.get(req.query.deviceuuid).send(packWSContent("configChange", `${req.query.params}`));
                                        }
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
