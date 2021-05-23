var mysql = require('mysql');
var express = require('express');
var uuid = require('uuid');
var cors = require('cors');
var app = express();
module.exports.app = app;
const port = 8146;

const drone = require('./drone/drone.js');


var game = require('./ledwall/game.js');
var account = require('./account/accountHandler.js');
var session = require('./account/sessionHandler.js');
var deviceHandler = require('./device/deviceHandler.js');
var device = require('./device/device');
const rateLimit = require("express-rate-limit");

var expressWs = require('express-ws')(app);
const liveDeviceConnection = new Map();


global.connection = mysql.createConnection({
    host: '172.17.0.2',
    user: 'root',
    password: 'LEDWall$246#',
    database: "cloud"
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


deviceHandler.init();
drone.init();
game.init();
account.init();
session.init();

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
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




app.use(function (req, res, next) {
    res.status(404).send('Something went wrong!');
});


