const Net = require('net');
const port = 8856;
var session = require('../account/session');
var account = require('../account/account');
var device = require('../device/device');

module.exports.init = function init() {

    const server = new Net.Server();
    server.listen(port, function () {
        console.log(`Server listening for drone connection requests on socket localhost:${port}`);
    });

    server.on('connection', function (socket) {
        console.log('A Drone has Connected to the server. Waiting for authentication!');

        // Now that a TCP connection has been established, the server can send data to
        // the client by writing to its socket.
        socket.write('ft+ready\n');

        // The server can also receive data from the client by reading from its socket.
        socket.on('data', function (chunk) {
            console.log(`Data received from client: ${chunk.toString()}`);

            if (chunk.toString().startsWith("ft+") && chunk.toString().endsWith("\n")) {
                console.log(chunk.toString().slice(3, chunk.length - 1));
                checkCommand(chunk.toString().slice(3, chunk.length - 1), socket);


            } else {
                console.log(`Unknown data received from client`);
                socket.write('ft+error\n');
            }
        });

        // When the client requests to end the TCP connection with the server, the server
        // ends the connection.
        socket.on('end', function () {
            if(socket.auth) {
                device.getDeviceUUID(socket.auth,(device) => {
                    device.setOnlineState(0,device,() => {})
                })
            }
            console.log('Closing connection with the client');
        });

        // Don't forget to catch error, for your own sake.
        socket.on('error', function (err) {
            console.log(`Error: ${err}`);
        });
    });

};

function sendSocketParamError(socket) {
    socket.write("ft+error=cpe\n")
}
function sendSocketAuthError(socket) {
    socket.write("ft+error=auth\n")
}
function sendSocketOK(socket) {
    socket.write("ft+ok\n")
}

function checkCommand(actionString, socket) {
    const command = actionString.split(/\W+/g)[0];
    const data = actionString.slice(actionString.indexOf(command)+command.length,actionString.length);
    let containsParams = false;
    let paramList = [];
    if(data.indexOf("=")!==-1) {
        containsParams = true;
        let params = data.slice(1,data.length);
        paramList = params.split(",");
    }
    console.log(containsParams)
    console.log(paramList)
    console.log(command);


    switch (command) {
        case 'key':
            if(!containsParams||paramList.length!==1) { sendSocketParamError(socket); return}
            console.log(paramList[0])
            session.validateSession(paramList[0],(callback) => {
                if(callback) {
                    socket.auth=paramList[0];
                    device.getDeviceUUID(socket.auth,(deviceUUID) => {
                        device.setOnlineState(1,deviceUUID,() => {})
                    })
                    sendSocketOK(socket)
                }else{
                    sendSocketAuthError(socket);
                }
            })
            break;

        case 'auth':
            if(socket.auth) {
                sendSocketOK(socket);
            }else{
                sendSocketAuthError(socket);
            }
            break;

        case 'close':
            socket.auth=undefined;
            socket.destroy();
            break;
        case 'username':
            if(socket.auth) {
                session.getUserUUID(socket.auth,(result) => {
                    if(result!==undefined) {
                        account.getAccountByUUID(result,(callback) => {
                          socket.write("ft+username="+callback.name+"\n");
                        })
                    }
                })

            }else{
                sendSocketAuthError(socket);
            }
            break;
        case 'debug':
            socket.write("ParamsList: "+paramList+" raw param: ft+"+actionString+"\n")
            break;
        default:
            socket.write("ft+error=cmu\n")
            break;


    }


}