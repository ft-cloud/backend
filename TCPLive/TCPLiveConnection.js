const Net = require('net');
const port = 8856;
var session = require('../account/session');
var account = require('../account/account');
var device = require('../device/device');
var liveDroneClients = require("../drone/droneFrontendConnection").liveDroneClientConnections;
const liveDevices = [];

module.exports.init = function init() {

    const server = new Net.Server();
    server.listen(port, function () {
        console.log(`Server listening for device connection requests on socket localhost:${port}`);
    });

    server.on('connection', function (socket) {
        console.log('A Device has Connected to the server. Waiting for authentication!');
        socket.lastMessage = Date.now();

        socket.write('ft+ready\n');

        function checkConnection() {
            if ((Date.now() - socket.lastMessage) >= 5000) {
                socket.write("ft+timeout\n");
                clearInterval(socket.interval);
                terminateConnection(socket);
            }
        }

        socket.interval = setInterval(checkConnection, 5000);

        socket.on('data', function (chunk) {
            socket.lastMessage = Date.now();
            console.log(`Data received from client: ${chunk.toString()}`);
            if(!chunk.toString().endsWith("\n")) {
                return;
            }
            chunk.toString().split("\n").forEach(splitChung=> {
                if(splitChung.length>0) {
                    checkIncomingMessage(splitChung, socket);

                }
            })
        });

        // When the client requests to end the TCP connection with the server, the server
        // ends the connection.
        socket.on('end', function () {
            terminateConnection(socket);
            console.log('Closing connection with the client');
        });

        // Don't forget to catch error, for your own sake.
        socket.on('error', function (err) {
            console.log(`Error: ${err}`);
        });
    });

};

function checkIncomingMessage(message, socket) {
    if (message.toString().startsWith("ft+")) {
        console.log(message.toString().slice(3, message.length));
        checkCommand(message.toString().slice(3, message.length), socket);

    } else {
        console.log(`Unknown data received from client`);
        if (socket.json) {
            socket.write(`{"success":false,"error",""}\n`);
        } else {
            socket.write("ft+error\n");
        }
    }

}


function sendSocketParamError(socket) {
    if (socket.json) {
        socket.write(`{"success":false,"error","cpe"}\n`);
    } else {
        socket.write("ft+error=cpe\n");
    }
}

function sendSocketAuthError(socket) {
    if (socket.json) {
        socket.write(`{"success":false,"error","auth"}\n`);
    } else {
        socket.write("ft+error=auth\n");
    }
}

function sendSocketOK(socket) {
    if (socket.json) {
        socket.write(`{"success":true,"error",""}\n`);
    } else {
        socket.write("ft+ok\n");
    }
}

function terminateConnection(socket) {
    if (socket.auth) {
        device.getDeviceUUID(socket.auth, (deviceUUID) => {
            device.setOnlineState(0, deviceUUID, () => {
            });
        });
        if(liveDroneClients[socket.deviceUUID]) {
            liveDroneClients[socket.deviceUUID].forEach(e => {
                e.send(JSON.stringify({
                    type: "clientStatusUpdate",
                    onlineState: "Offline"
                }))
            });
        }

        liveDevices[socket.deviceUUID] = undefined;
    }
    socket.destroy();
}

function deleteDevice(socket) {
    if (socket.auth) {
        if (socket.json) {
            socket.write(`{"update":"devicedelete"}\n`);
        } else {
            socket.write("ft+devicedelete\n");
        }
        terminateConnection(socket);
    }
}

function spreadPosToDroneClients(device, lat, long, alt,ConStats,height) {
    console.log(liveDroneClients);
    console.log(liveDroneClients[device]);
    console.log(device);
    if (liveDroneClients[device] !== undefined) {
        liveDroneClients[device].forEach(client => {
            client.send(JSON.stringify({
                type: "clientPos",
                lat: lat,
                long: long,
                alt: alt,
                ConnectedSatellites: ConStats,
                height:height
            }));
        });
    }

}

function spreadBatteryVoltageToDroneClients(device, voltage, percentage) {

    if (liveDroneClients[device] !== undefined) {
        liveDroneClients[device].forEach(client => {
            client.send(JSON.stringify({
                type: "voltage",
                voltage: voltage,
                percentage: percentage
            }));
        });
    }

}

function checkCommand(actionString, socket) {
    const command = actionString.split(/\W+/g)[0];
    const data = actionString.slice(actionString.indexOf(command) + command.length, actionString.length);
    let containsParams = false;
    let paramList = [];
    if (data.indexOf("=") !== -1) {
        containsParams = true;
        let params = data.slice(1, data.length);
        paramList = params.split(",");
    }
    console.log(containsParams);
    console.log(paramList);
    console.log(command);


    switch (command) {
        case 'key':
            if (!containsParams || paramList.length !== 1) {
                sendSocketParamError(socket);
                return;
            }
            console.log(paramList[0]);
            session.validateSession(paramList[0], (callback) => {
                if (callback) {
                    socket.auth = paramList[0];
                    device.getDeviceUUID(socket.auth, (deviceUUID) => {
                        device.setOnlineState(1, deviceUUID, () => {
                        });
                        liveDevices[deviceUUID] = socket;
                        socket.deviceUUID = deviceUUID;

                        if(liveDroneClients[socket.deviceUUID]) {
                            liveDroneClients[socket.deviceUUID].forEach(e => {
                                e.send(JSON.stringify({
                                    type: "clientStatusUpdate",
                                    onlineState: "Online"
                                }))
                            });
                        }

                    });
                    sendSocketOK(socket);
                } else {
                    sendSocketAuthError(socket);
                }
            });
            break;

        case 'auth':
            if (socket.auth) {
                sendSocketOK(socket);
            } else {
                sendSocketAuthError(socket);
            }
            break;

        case 'close':
            terminateConnection(socket);
            socket.auth = undefined;
            break;
        case 'username':
            if (socket.auth) {
                session.getUserUUID(socket.auth, (result) => {
                    if (result !== undefined) {
                        account.getAccountByUUID(result).then((callback) => {
                            if (socket.json) {
                                socket.write(`{"result":"${callback.name}"}\n`);
                            } else {
                                socket.write("ft+username=" + callback.name + "\n");
                            }
                        });
                    }
                });

            } else {
                sendSocketAuthError(socket);
            }
            break;
        case 'debug':
            socket.write("ParamsList: " + paramList + " raw param: ft+" + actionString + "\n");
            break;
        case 'jsonupgrade':
            socket.json = true;
            socket.write(`{"result":"switching ok"}`);
            break;
        case 'pos':
            if (socket.auth) {
                if (!containsParams || paramList.length !== 5) {
                    sendSocketParamError(socket);
                    return;
                }
                const lat = parseFloat(paramList[0]);
                const long = parseFloat(paramList[1]);
                const alt = parseFloat(paramList[2]);
                const ConSats = parseFloat(paramList[3]);
                const height = parseFloat(paramList[4]);
                device.updateStatusInfo(socket.deviceUUID, "lat", lat, () => {
                    device.updateStatusInfo(socket.deviceUUID, "long", long, () => {
                        device.updateStatusInfo(socket.deviceUUID, "alt", alt, () => {
                        device.updateStatusInfo(socket.deviceUUID, "connectedSatellites", ConSats, () => {
                        device.updateStatusInfo(socket.deviceUUID, "height", height, () => {
                            sendSocketOK(socket);

                            spreadPosToDroneClients(socket.deviceUUID, lat, long, alt,ConSats,height);
                        });
                        });

                    });
                    });
                });
            } else {
                sendSocketAuthError(socket);
            }
            break;
        case 'battery':
            if (socket.auth) {
                if (!containsParams || paramList.length !== 2) {
                    sendSocketParamError(socket);
                    return;
                }
                const voltage = parseFloat(paramList[0]);
                const percentage = parseFloat(paramList[1]);

                device.updateStatusInfo(socket.deviceUUID, "batteryVoltage", voltage, () => {
                    device.updateStatusInfo(socket.deviceUUID, "batteryPercentage", percentage, () => {

                        sendSocketOK(socket);
                        spreadBatteryVoltageToDroneClients(socket.deviceUUID, voltage, percentage);

                    });
                });


            } else {
                sendSocketAuthError(socket);
            }
            break;
        default:

            if (socket.json) {
                socket.write(`{"success":false,"error","cmu"}\n`);
            } else {
                socket.write("ft+error=cmu\n");
            }
            break;


    }


}

module.exports.liveDevices = liveDevices;
module.exports.terminateConnection = terminateConnection;
module.exports.deleteDevice = deleteDevice;