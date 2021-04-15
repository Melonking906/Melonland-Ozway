// +++++++++++ Web Server
var express = require("express");
var path = require("path");
var app = express();

// Root file directory
app.use(express.static("web"));

// Here we serve up our index page
app.get("/", function(req, res)
{
    res.sendFile(path.join(__dirname + "/web/index.html"));
});

var server = app.listen(3906, function() 
{
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("Web Server listening at http://%s:%s", host, port);
});

// +++++++++++ Web Sockets

const WebSocket = require('ws');
const socket = new WebSocket.Server({ port: 4906 });

let playerStore = [];

socket.on('listening', ws =>
{
    console.log( 'listening at: ' + socket.address().address + ' on port ' + socket.address().port );
});

socket.on('connection', ws =>
{
    // Setup new client
    let newClientId = getRandomInt( 1, 20000 );
    ws.send(newClientId);
    
    // Handle messages
    ws.on('message', message =>
    {
        console.log('LOG: ' + message);
        
        let messageData = JSON.parse(message);
        updateStore( messageData ); // Update player data locally
        
        ws.send( JSON.stringify(playerStore) ); // Reply with new player data
    });
});

// Updates player location info in the store and adds new players if none found.
function updateStore( messageData )
{
    var index = playerStore.findIndex(player => player.clientId == messageData.clientId);
    if( index === -1 ) { playerStore.push(messageData); return; } // Add a new player and return
    playerStore[index].sync = messageData.sync; // The sync object contains all synced data
}

// +++++++++++ Helper Functions

function getRandomInt(min, max)
{
    return Math.floor( (Math.random() * max) + min );
}

function getRandomFloat(min, max)
{
    return (Math.random() * max) + min;
}