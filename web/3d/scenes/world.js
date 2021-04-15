"use strict";
import * as THREE from '../../scripts/three-r127/build/three.module.js';
import * as MELON from '../MelonEngine.js';
import * as OZMult from './multiplayer.js';

//+++ Game VarBox +++
let z = {};

//HTML
z.html = {};
z.html.loadingPlot = document.getElementById('plot-loading');
z.html.nameStore =  document.getElementById('store-name');

//Galaxy
z.galaxy = {};
z.galaxy.center = undefined;
z.galaxy.starRange = 1000000;
z.galaxy.starCount = 500;

//Player
z.player = {};
z.player.flySpeed = 0.1;
z.player.flySpeedBoost = 0.25;
z.player.isFlying = false;

z.player.thirdPerson = {};
z.player.thirdPerson.model = new MELON.MelonSuperObject('DefaultThirdPerson');
z.player.thirdPerson.modelName = 'unset';
z.player.thirdPerson.isSetup = false;

//+++ ME Functions +++
MELON.startErUp(init, [spawnWorld, startWorld, setupDone], loop);

function init()
{	
	MELON.me.three.scene.background = new THREE.Color( 0x00061e );
	MELON.me.three.scene.fog = new THREE.Fog( 0x00061e, 0, 65 );
	
	MELON.preLoadModel( 'plaza', 'plaza', false );
	
	MELON.preLoadModel( '/monsters/man_3', 'model_ozwomp' );
}

function spawnWorld()
{
	MELON.me.three.camera.rotateY( 1.641593 );
	
	var plaza = MELON.spawnObject( 'plaza', 'Plaza', 0.2 );
	plaza.setScale(0.2);
}

function startWorld()
{
	let galaxyCenterObj = MELON.getObject( 'GROUND_1' );
	MELON.addGroundObject(galaxyCenterObj);
	z.galaxy.center = galaxyCenterObj.getWorldPosition( new THREE.Vector3() );
	
	//Other
	placeStars();
}

function setupDone()
{
    z.html.loadingPlot.style.visibility = "hidden";
}

function loop()
{	
	playerLogic();
	OZMult.multiplayerLoop();
}

//+++ Code Start +++
function playerLogic()
{
	if( !z.player.thirdPerson.isSetup && z.html.nameStore.innerHTML !== 'unset' )
	{
		z.player.thirdPerson.modelName = z.html.nameStore.innerHTML;
		z.player.thirdPerson.model = MELON.spawnObject( z.player.thirdPerson.modelName, 'PlayerThirdPerson' );
		z.player.thirdPerson.isSetup = true;
	}

	if( !MELON.me.player.isOnGround )
	{
		let newPos = MELON.getPlayerPosition();
		let speed = z.player.flySpeed;

		//boosting system
		if( MELON.getMouseDownFrames( 0 ) > 25 )
		{
			speed = z.player.flySpeedBoost;
		}

		MELON.me.three.camera.translateOnAxis( MELON.FORWARD, speed );
		MELON.updateCameraTarget();
		MELON.me.three.controls.enablePan = false;
		MELON.me.three.controls.enableKeys = false;
		MELON.me.player.viewRange = 1;
		z.player.isFlying = true;

		z.player.thirdPerson.model.position.copy( MELON.getPlayerTarget() );
		z.player.thirdPerson.model.setScale( 0.01 );
		z.player.thirdPerson.model.lookAt( newPos );
		z.player.thirdPerson.model.rotateY( 3.141593 ); //Look other way
		z.player.thirdPerson.model.rotateX( 0.7853982 ); //Tilt legs down
	}
	else
	{
		let newPos = MELON.getPlayerPosition();
		MELON.groundMapObject( z.player.thirdPerson.model );
		
		MELON.me.three.controls.enablePan = true;
		MELON.me.three.controls.enableKeys = true;
		MELON.me.player.viewRange = 1;
		z.player.isFlying = false;
		z.player.thirdPerson.model.position.copy( MELON.getPlayerTarget() );
		z.player.thirdPerson.model.setScale( 0.02 );
		z.player.thirdPerson.model.lookAt( newPos );
		z.player.thirdPerson.model.rotateY( 3.141593 ); //Look other way
		z.player.thirdPerson.model.rotateX( Math.PI / 6 ); //Tilt legs down
		
		MELON.groundMapObject( z.player.thirdPerson.model );
	}
}

function placeStars()
{
	const starGeometry = new THREE.BufferGeometry();
	const starMaterial = new THREE.PointsMaterial( { color: 0xffffff } );
	const positions = [];
	for( let s = 0; s < z.galaxy.starCount; s++ )
	{
		const position = MELON.getRandomPositionInRange(z.galaxy.center, z.galaxy.starRange);
		positions.push( position.x );
		positions.push( position.y );
		positions.push( position.z );
	}
	starGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	starGeometry.name = 'StarField';
	MELON.me.three.scene.add( new THREE.Points( starGeometry, starMaterial ) );
}





