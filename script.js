import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://threejs.org/examples/jsm/loaders/RGBELoader.js';

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap; 

document.body.appendChild(renderer.domElement);
document.body.style.overflow='hidden';
scene.background = new THREE.Color( 'skyblue' );

function setEnvironment(){
    new RGBELoader()
        .setPath( './' )
        .load( 'environment.hdr', function ( texture ) {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;
    })
}

function setPlane(){
    const planegeometry = new THREE.PlaneGeometry( window.innerHeight*10,window.innerWidth );
    const planematerial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( planegeometry, planematerial );

    plane.receiveShadow = true;
    scene.add( plane );

    plane.rotation.x=Math.PI/2;
    plane.position.y=0;
}


function setLight(){
    let ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
	scene.add(ambientLight);

    const pointLight = new THREE.PointLight( 0xffffff, 12, 1000 );
    pointLight.position.set( -500, 500, 500 );
    pointLight.castShadow = true;
	pointLight.shadow.camera.near = 0.1;
	pointLight.shadow.camera.far = 1000;

    pointLight.shadow.bias = -0.0001;
    pointLight.shadow.mapSize.width = 1024*4;
    pointLight.shadow.mapSize.height = 1024*4;
    scene.add( pointLight )

}

// setEnvironment()
// setPlane()
setLight()


renderer.shadowMap.enabled = true;

camera.position.set( 0, 0, 30 );

var GLTF_loader=new GLTFLoader();
GLTF_loader.load( './loto.glb', function(geometry)  {
    geometry.scene.position.x=0
    geometry.scene.position.y=0
    geometry.scene.position.z=0
    geometry.scene.name='loto'

    scene.add(geometry.scene);

    let model = scene.getObjectByName('loto')
    // console.log(model)
    scene.getObjectByName('longcau').rotation.x=Math.PI;

}, undefined, function ( error ) {

	console.error( error );

});


window.onresize=()=>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect=window.innerWidth / window.innerHeight;
}

var flags={hide: true, play: true, quay: true, auto: false, repl: true}
var vol={quay: Math.PI}
var step={
    quay: 0.2
}

var markNumber=[]

function initMark(){
    for(var i=1;i<=90;i++){
        markNumber[i]=false
    }
}

initMark()

function hideNumber(){
    if(flags.hide){
        for(var i=1;i<=90;i++){
            scene.getObjectByName(i+'').visible=false
        }
        flags.hide=false
    }
}

function showNumberAndAudio(){
    var num = getNumber()+''

    var x=scene.getObjectByName(num).position.x
    var y=scene.getObjectByName(num).position.y
    var z=scene.getObjectByName(num).position.z

    scene.getObjectByName(num).position.set(20,-3,0)
    scene.getObjectByName(num).rotation.y+=Math.PI
    scene.getObjectByName(num).visible=true

    let audio = document.createElement('audio')
    audio.id='id'+num
    let source = document.createElement('source')
    source.src = `./music/${num}.mp3`
    source.type = 'audio/mp3'
    audio.appendChild(source)
    document.body.appendChild(audio)
    audio.play()
    audio.onended=()=>{
       scene.getObjectByName(num).rotation.y-=Math.PI
       scene.getObjectByName(num).position.x=x
       scene.getObjectByName(num).position.y=y
       scene.getObjectByName(num).position.z=z

       flags.play=true
       if(flags.auto) document.querySelector('.play').click()

       
       document.querySelector('#bg_audio2').play()
    }
}

function updateQuay(){
    if(flags.quay){
        if(vol.quay && scene.getObjectByName('longcau').rotation.x<vol.quay){
            scene.getObjectByName('longcau').rotation.x+=step.quay
        }
        if(scene.getObjectByName('longcau').rotation.x>vol.quay-step.quay && scene.getObjectByName('longcau').rotation.x!=vol.quay) {
            flags.quay=false
            document.querySelector('#bg_audio1').pause()
            document.querySelector('#bg_audio2').pause()
            showNumberAndAudio()
        }
    }
}

function getNumber(){
    var num=Math.round(Math.random()*89+1)
    while(markNumber[num]){
        num=Math.round(Math.random()*89+1)
    }
    markNumber[num]=true
    return num
}

document.querySelector('input#auto').onclick=function(){
    flags.auto=!flags.auto
}

document.querySelector('.congnangdacdi button').onclick=function(){
    if(flags.repl){
        let or = Math.round(Math.random()*44+1)
        var curNumSpan = document.querySelector('#numId_'+or)
        let curNum = curNumSpan.innerHTML
        let replNum

        markTicketNumber[curNum] = false
        do{
            replNum=Math.round(Math.random()*89+1)
        }while(markTicketNumber[replNum])
        markTicketNumber[replNum] = true

        curNumSpan.innerHTML=replNum
        curNumSpan.classList.add('replace_num') 

        flags.repl=false
    }
}

document.querySelector('.play').onclick=()=>{
    if(flags.play){
        vol.quay += 6*Math.PI

        flags.quay=true
        flags.play=false
    }
}

setTimeout(()=>{
    document.querySelector('#bg_audio1').play()
},6000)

document.querySelector('#bg_audio1').onended=function(){
    document.querySelector('#bg_audio2').play()
}

function game(){
    requestAnimationFrame(game)
    renderer.render(scene, camera)
 
    hideNumber()
    updateQuay()
}

game()