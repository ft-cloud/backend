var mysql = require('mysql');
var express = require('express');
var uuid = require('uuid');
var account = require('./account');
var session = require('./session');
var apps = require('./app');
var cors = require('cors');
const {deleteScore} = require('./app');
var app = express();
module.exports.app = app;
const port = 8146;
var game = require('./ledwall/game.js');
var device = require('./device');
const rateLimit = require("express-rate-limit");

var expressWs = require('express-ws')(app);

const liveDeviceConnection = new Map();


global.connection = mysql.createConnection({
    host: '172.17.0.2',
    user: 'root',
    password: 'LEDWall$246#',
    database: "cloud"
});


const limiter = rateLimit({
    windowMs: 1 * 10 * 1000, // 15 minutes
    max: 8 // limit each IP to 50 requests per windowMs
});
//app.use(limiter);  todo activate

global.connection.connect();

app.use(cors());

app.get('/', (req, res) => {
    res.send('LEDWall API V1.1');
});

app.get('/v2', (req, res) => {
    res.send('LEDWall API V2.0');
});


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


game.init();

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


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

                            //Create Devices in Database
                            device.createDeviceEntry(waitForRegistrationDevices[req.query.regCode.toString()].uuid.toString(), waitForRegistrationDevices[req.query.regCode.toString()].name.toString(), (AddUuid) => {

                                session.generateAPIKey(uuid, AddUuid, (apiKey) => {

                                    waitForRegistrationDevices[req.query.regCode.toString()].res.send(`{"success":"true","APIKey":"${apiKey}","deviceuuid":"${AddUuid}"}`);

                                    //Store User Device
                                    device.storeUserDevices(AddUuid, uuid, waitForRegistrationDevices[req.query.regCode.toString()].uuid.toString(), () => {

                                        //Answer Request
                                        res.send('{\"success\":\"Registration done\"}');


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


function packWSContent(message, content) {

    const jsonOutput = `{"message": "${message}","content": ${content}}`;
    return jsonOutput;

}


app.ws('/device/liveconnection', function (ws, req) {


    if (req.query.session) {
        session.validateSession(req.query.session.toString(), (isValid) => {
            if (isValid) {
                session.reactivateSession(req.query.session);
                session.getUserUUID(req.query.session.toString(), (uuid) => {
                    if (uuid) {


                        device.getDeviceUUID(req.query.session, (deviceuuid) => {

                            liveDeviceConnection.set(deviceuuid, ws);

                            device.setOnlineState(1, deviceuuid, () => {


                                ws.send(packWSContent("deviceuuid", `{"deviceuuid":"${deviceuuid}"}`));

                                device.getDeviceTypFromDevice(deviceuuid, (deviceTyp) => {
                                    apps.listInstalledCompatibleApps(uuid, deviceTyp.UUID, (apps) => {

                                        if (apps) {
                                            var appuuid = [];
                                            JSON.parse(apps).forEach(e => {
                                                appuuid.push(e.UUID);
                                            });
                                            const tempObj = {
                                                apps: appuuid
                                            };
                                            ws.send(packWSContent("syncApps", JSON.stringify(tempObj)));
                                        }

                                    });

                                });


                                ws.on('close', function () {

                                    device.getDeviceUUID(req.query.session, (deviceuuid) => {
                                        liveDeviceConnection.delete(deviceuuid);

                                        device.setOnlineState(0, deviceuuid, () => {
                                        });
                                    });

                                });

                                ws.on('message', function (msg) {
                                    if (Array.from(liveDeviceConnection.values()).includes(ws)) {
                                        ws.close();
                                        return;
                                    }
                                    ws.send(msg);


                                });


                            });
                        });


                    } else {
                        ws.close();
                    }
                });

            } else {
                ws.close();
            }
        });
    } else {
        ws.close();
    }


});


app.get('/device/listinstalledcompatibleapps', (req, res) => {
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


function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateSignUp(name, email, password) {

    if (name && password && email) {
        if (name.toString().trim() != '' && password.toString().trim() != '' && email.toString().trim() != '') {
            if (validateEmail(email.toString())) {

                if (name.toString().trim().length >= 3) {


                    return undefined;

                } else {
                    return '{\"error\":\"Username must contain at least 3 Characters\",\"errorcode\":\"002\"}';

                }


            } else {
                return '{\"error\":\"No valid email!\",\"errorcode\":\"002\"}';
            }

        } else {
            return '{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}';

        }

    } else {
        return '{\"error\":\"please provide name, password and email!\",\"errorcode\":\"001\"}';
    }
}


app.use(function (req, res, next) {
    res.status(404).send('Something went wrong!');
});


