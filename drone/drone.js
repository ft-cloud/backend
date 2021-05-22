const Net = require('net');
const port = 8856;


module.exports.init = function init() {

    const server = new Net.Server();
    server.listen(port, function() {
        console.log(`Server listening for connection requests on socket localhost:${port}`);
    });

    server.on('connection', function(socket) {
        console.log('A new connection has been established.');

        // Now that a TCP connection has been established, the server can send data to
        // the client by writing to its socket.
        socket.write('Hello, client.');

        // The server can also receive data from the client by reading from its socket.
        socket.on('data', function(chunk) {
            console.log(`Data received from client: ${chunk.toString()}`);
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});

}