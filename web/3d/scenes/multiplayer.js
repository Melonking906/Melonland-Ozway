"use strict";
import * as THREE from '../../scripts/three-r127/build/three.module.js';
import * as MELON from '../MelonEngine.js';

export let mult = {};

mult.clientId = -1;
mult.url = 'ws://localhost:4906';
mult.players = [];

mult.clean = {};
mult.clean.cleanTime = 180;
mult.clean.lastTime = 0;

mult.connection = new WebSocket(mult.url);

// Call this from the main game loop
export function multiplayerLoop()
{
    let multiObject = {};
    multiObject.clientId = mult.clientId;
    multiObject.sync = {};
    multiObject.sync.playerLocation = MELON.getPlayerPosition();
    
    mult.connection.send( JSON.stringify(multiObject) );
}

//+++ Events +++
mult.connection.onopen = () =>
{
    console.log("Connected to Oz Server!")
    //mult.connection.send('hey');
}

mult.connection.onmessage = e =>
{
    console.log(e.data)
    
    //Set Up New Client
    if(mult.clientId === -1)
    {
        mult.clientId = e.data;
    }
}

mult.connection.onclose = e =>
{
    console.log(e.data)
}

mult.connection.onerror = e =>
{
    console.log(e.data)
}