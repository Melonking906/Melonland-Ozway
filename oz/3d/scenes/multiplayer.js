"use strict";
import * as THREE from '../../scripts/three-r127/build/three.module.js';
import * as MELON from '../MelonEngine.js';

import * as SETTINGS from '../../settings.js';

export let mult = {};

mult.clientId = -1;
mult.avatar = {};
export function setAvatar( avatar ) { mult.avatar = avatar; }  

mult.url = SETTINGS.s.multiplayer.socketAddress;
mult.port = SETTINGS.s.multiplayer.socketPort;
mult.players = [];

mult.clean = {};
mult.clean.cleanTime = 180;
mult.clean.lastTime = 0;

mult.connection = new WebSocket('wss://'+mult.url+':'+mult.port);

// Call this from the main game loop
export function multiplayerLoop()
{
    let multiObject = {};
    multiObject.clientId = mult.clientId;
    multiObject.sync = {};
    multiObject.sync.playerLocation = mult.avatar.model.getWorldPosition( new THREE.Vector3() );
    multiObject.sync.playerRotation = mult.avatar.model.rotation;
    
    mult.connection.send( JSON.stringify(multiObject) );
}

//+++ Web Socket Events +++
mult.connection.onopen = () =>
{
    console.log("Connected to Oz Server!")
    //mult.connection.send('hey');
}

mult.connection.onmessage = e =>
{
    //console.log(e.data)
    
    //Set Up New Client
    if(mult.clientId === -1)
    {
        mult.clientId = e.data;
        return;
    }
    
    //Do update
    updatePlayerObjects( JSON.parse(e.data) );
}

mult.connection.onclose = e =>
{
    console.log(e.data)
}

mult.connection.onerror = e =>
{
    console.log(e.data)
}

//+++ Handle Player Objects +++
function updatePlayerObjects( syncPayload )
{   
    let syncClientIds = syncPayload.map(x => x.clientId);
    let localClientIds = mult.players.map(x => x.clientId);
    
    let playersToAdd = syncClientIds.filter(x => !localClientIds.includes(x)); // Get players in sync not in local
    let playersToRemove = localClientIds.filter(x => !syncClientIds.includes(x)); // Get players in local not in sync
    let playersToUpdate = syncClientIds.filter(x => localClientIds.includes(x)); // Get players in both local and sync
    
    // Add Players
    for( let playerToAdd of playersToAdd )
    {
        if( playerToAdd == mult.clientId ) { continue; } // Skip local player
        const index = syncPayload.findIndex(player => player.clientId == playerToAdd);
        let otherPlayerObject = MELON.spawnObject( 'model_ozwomp', 'OtherPlayer_'+playerToAdd );
        otherPlayerObject.setScale(0.02);
        let otherPlayer = new OtherPlayer( playerToAdd, otherPlayerObject );
        mult.players.push(otherPlayer);
    }
    
    // Remove Players
    for( let playerToRemove of playersToRemove )
    {
        const index = mult.players.findIndex(player => player.clientId == playerToRemove);
        MELON.removeObject( mult.players[index].superObject.name ); // Delete the world object
        mult.players.splice(index, 1); // Delete the OtherPlayer object
    }
    
    // Update Players
    for( let playerToUpdate of playersToUpdate )
    {
        const indexLocal = mult.players.findIndex(player => player.clientId == playerToUpdate);
        const indexSync = syncPayload.findIndex(player => player.clientId == playerToUpdate);
        mult.players[indexLocal].superObject.setPosition( syncPayload[indexSync].sync.playerLocation );
        // Weird double euler hack, not sure why it did not parse the first time.
        mult.players[indexLocal].superObject.setRotationFromEuler( new THREE.Euler( 
            syncPayload[indexSync].sync.playerRotation._x,
            syncPayload[indexSync].sync.playerRotation._y,
            syncPayload[indexSync].sync.playerRotation._z,
            syncPayload[indexSync].sync.playerRotation._order
         ) )
    }
}

// Classes
export class OtherPlayer
{
    constructor( clientId, superObject )
    {
        this.clientId = clientId;
        this.superObject = superObject;
    }
}


