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
            checkIncomingMessage(chunk, socket);
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
    if (message.toString().startsWith("ft+") && message.toString().endsWith("\n")) {
        console.log(message.toString().slice(3, message.length - 1));
        checkCommand(message.toString().slice(3, message.length - 1), socket);

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

function spreadPosToDroneClients(device,lat, long, alt) {
    console.log(liveDroneClients)
    console.log(liveDroneClients[device])
    console.log(device)
    if(liveDroneClients[device]!==undefined) {
        liveDroneClients[device].forEach(client => {
            client.send(JSON.stringify({
                type: "clientPos",
                lat: lat,
                long: long,
                atl: alt
            }))
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
                        account.getAccountByUUID(result, (callback) => {
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
                if (!containsParams || paramList.length !== 3) {
                    sendSocketParamError(socket);
                    return;
                }
                const lat =  parseFloat(paramList[0]);
                const long = parseFloat(paramList[1]);
                const alt = parseFloat(paramList[2]);
                device.updateStatusInfo(socket.deviceUUID, "lat", lat, () => {
                    device.updateStatusInfo(socket.deviceUUID, "long", long, () => {
                        device.updateStatusInfo(socket.deviceUUID, "alt", alt, () => {
                            sendSocketOK(socket);

                            spreadPosToDroneClients(socket.deviceUUID,lat, long, alt);
                        });

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