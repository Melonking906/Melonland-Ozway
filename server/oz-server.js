// +++++++++++ Settings
const settings = require('./settings.json');

const WebSocket = require('ws');
const socket = new WebSocket.Server({ port: settings.socketPort });

let playerStore = [];

socket.on('listening', ws =>
{
    console.log( 'OZ listening at: ' + socket.address().address + ' on port ' + socket.address().port );
});

socket.on('connection', ws =>
{
    // Setup new client
    const newClientId = getRandomInt( 1, 20000 );
    ws.send( newClientId );
    
    // Handle messages
    ws.on('message', message =>
    {
        //console.log('LOG: ' + message);
        
        let messageData = JSON.parse(message);
        updateStore( messageData ); // Update player data locally
        
        ws.send( JSON.stringify(playerStore) ); // Reply with new player data
    });
    
    // Client disconnects
    ws.on('close', message =>
    {
        // Delete the player from storage
        const index = playerStore.findIndex(player => player.clientId == newClientId);
        playerStore.splice(index, 1);
        console.log('LOG: Close Id: ' + newClientId);
    });
});

// Updates player location info in the store and adds new players if none found.
function updateStore( messageData )
{
    const index = playerStore.findIndex(player => player.clientId == messageData.clientId);
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