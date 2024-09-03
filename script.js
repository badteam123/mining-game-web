//----------------------------------------------
// Scene Setup
// 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.01, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(40, 100, 16);
scene.add(sunLight);
scene.add(sunLight.target);
sunLight.target.position.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const playerLight = new THREE.PointLight(0xffc996, 0, 12);
scene.add(playerLight);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

//----------------------------------------------
// Model Loading
// (HAS TO BE URLS_!_!__! DON'T FUCKING USE LOCAL FILES OR I WILL CALL PUTIN)

let models = {
    handdrill: {
        url: "https://cdn.statically.io/gh/badteam123/assets/main/models/lowpoly/drill.glb"
    }
}

const loader = new THREE.GLTFLoader();
for (let m in models) {
    loader.load(models[m].url, function (gltf) {
        models[m].model = gltf.scene;
        scene.add(models[m].model);
    });
    console.log(m + " model loaded");
}

//----------------------------------------------
// Service Workers for Chunk Generation
//

const generator = new Worker('generateThread.js');
var generatorReady = true;

const generator2 = new Worker('generateThread.js');
var generator2Ready = true;

//----------------------------------------------
// Variables
//

const playerHeight = 1.8;
const playerWidth = playerHeight * 0.3;
const halfHeight = playerHeight * 0.5;
const halfWidth = playerWidth * 0.5;
const stepHeight = 0.6;

const speed = 0.00007;
const gravity = 0.000024;
const jumpHeight = 0.008;
const dampening = 0.012;

var caveLight = 0;

var world = new World();

const perlin2D = new PerlinNoise2D(world.seed);
const perlin3D = new PerlinNoise3D(world.seed);

var mouse = {
    l: false,
    r: false,
    m: false
}

var player = {
    x: 0,
    y: 0,
    z: 0,
    xVel: 0,
    yVel: 0,
    zVel: 0,
    r: 0,
    t: 0,

    camera: {
        x: 0,
        y: 0,
        z: 0,
    },

    facing: {
        x: 0,
        y: 0,
        z: 0,
        chunkX: 0,
        chunkY: 0,
        chunkZ: 0,
        block: null,
        ray: new THREE.Raycaster()
    },

    health: {
        current: 10,
        max: 10
    },

    inventory: {
        items: [],
        selected: 0
    }
};

player.chunk = {
    x: world.gc(player.x),
    y: world.gc(player.y),
    z: world.gc(player.z)
}

let hudsprites = {};

var smoothFps = 0;

var texSheet;

//----------------------------------------------
// Our Shit Code
//

function setup() {

    var cnv = createCanvas(window.innerWidth, window.innerHeight);
    cnv.position(0, 0);
    pixelDensity(1);
    noSmooth();
    frameRate(9999999);

    texSheet = new THREE.TextureLoader().load(`assets/texsheet.png`);
    texSheet.magFilter = THREE.NearestFilter;
    texSheet.minFilter = THREE.NearestFilter;
    texSheet.wrapS = THREE.RepeatWrapping;
    texSheet.wrapT = THREE.RepeatWrapping;
 
    world.generateNearby();

    world.compile();

}

function draw() {

    if (deltaTime > 60) {
        deltaTime = 60;
    }

    let inValidChunk = false;

    if (world.chunk[world.gc(player.x)]) {
        if (world.chunk[world.gc(player.x)][world.gc(player.y)]) {
            if (Array.isArray(world.chunk[world.gc(player.x)][world.gc(player.y)][world.gc(player.z)])) {
                inValidChunk = true;
            }
        }
    }

    if (inValidChunk) {
        switch (-keyIsDown(87) + keyIsDown(83) + (keyIsDown(65) * 10) + -(keyIsDown(68) * 10) + 11) {
            case 11://no
                break;
            case 10://W
                player.zVel -= (Math.cos(player.r) * speed) * deltaTime;
                player.xVel -= (Math.sin(player.r) * speed) * deltaTime;
                break;
            case 20://WD
                player.zVel -= (Math.cos(player.r + (PI * 0.25)) * speed) * deltaTime;
                player.xVel -= (Math.sin(player.r + (PI * 0.25)) * speed) * deltaTime;
                break;
            case 21://D
                player.zVel -= (Math.cos(player.r + (PI * 0.5)) * speed) * deltaTime;
                player.xVel -= (Math.sin(player.r + (PI * 0.5)) * speed) * deltaTime;
                break;
            case 22://SD
                player.zVel -= (Math.cos(player.r + (PI * 0.75)) * speed) * deltaTime;
                player.xVel -= (Math.sin(player.r + (PI * 0.75)) * speed) * deltaTime;
                break;
            case 12://S
                player.zVel -= (Math.cos(player.r + (PI)) * speed) * deltaTime;
                player.xVel -= (Math.sin(player.r + (PI)) * speed) * deltaTime;
                break;
            case 2://SA
                player.zVel -= (Math.cos(player.r + (PI * 1.25)) * speed) * deltaTime;
                player.xVel -= (Math.sin(player.r + (PI * 1.25)) * speed) * deltaTime;
                break;
            case 1://A
                player.zVel -= (Math.cos(player.r + (PI * 1.5)) * speed) * deltaTime;
                player.xVel -= (Math.sin(player.r + (PI * 1.5)) * speed) * deltaTime;
                break;
            case 0://WA
                player.zVel -= (Math.cos(player.r + (PI * 1.75)) * speed) * deltaTime;
                player.xVel -= (Math.sin(player.r + (PI * 1.75)) * speed) * deltaTime;
                break;
        }

        if (keyIsDown(32) && player.onGround) {
            player.yVel += jumpHeight;
            player.onGround = false;
        }

        if(Math.abs(player.yVel) > 0.02){
            player.yVel = lerp(player.yVel, 0, 0.01*deltaTime);
        }

        world.collide();

        if (player.xVel != 0) {
            player.x += (player.xVel) * deltaTime;
        }
        if (player.zVel != 0) {
            player.z += (player.zVel) * deltaTime;
        }
        if (player.yVel != 0) {
            player.y += (player.yVel) * deltaTime;
        }

        player.xVel = lerp(player.xVel, 0, (deltaTime * dampening));
        player.zVel = lerp(player.zVel, 0, (deltaTime * dampening));

        if (!isNaN(gravity * deltaTime)) {
            if (Math.abs(player.yVel - (gravity * deltaTime)) <= 0.000005) {
                player.yVel = 0;
            } else if (Math.abs(gravity * deltaTime) > 0.000006) {
                player.yVel -= gravity * deltaTime;
            }
        }
    } else {
        player.xVel = 0;
        player.yVel = 0;
        player.zVel = 0;
    }

    let prevChunk = JSON.parse(JSON.stringify(player.chunk));

    player.chunk = {
        x: world.gc(player.x),
        y: world.gc(player.y),
        z: world.gc(player.z)
    }

    if (prevChunk.x != player.chunk.x || prevChunk.y != player.chunk.y || prevChunk.z != player.chunk.z) {
        let xdiff = Math.round(player.chunk.x) - Math.round(prevChunk.x);
        let ydiff = Math.round(player.chunk.y) - Math.round(prevChunk.y);
        let zdiff = Math.round(player.chunk.z) - Math.round(prevChunk.z);

        for (let x = -world.renderDistance - (Math.max(xdiff, 0)); x < world.renderDistance + 1 - (Math.min(xdiff, 0)); x++) {
            for (let y = -world.renderDistance - (Math.max(ydiff, 0)); y < world.renderDistance + 1 - (Math.min(ydiff, 0)); y++) {
                for (let z = -world.renderDistance - (Math.max(zdiff, 0)); z < world.renderDistance + 1 - (Math.min(zdiff, 0)); z++) {
                    if (x + prevChunk.x >= world.renderDistance || x + prevChunk.x <= -world.renderDistance ||
                        y + prevChunk.y >= world.renderDistance || y + prevChunk.y <= -world.renderDistance ||
                        z + prevChunk.z >= world.renderDistance || z + prevChunk.z <= -world.renderDistance) {

                        if (!world.doesChunkExist(player.chunk.x + x, player.chunk.y + y, player.chunk.z + z)) {
                            world.update.push([player.chunk.x + x, player.chunk.y + y, player.chunk.z + z]);
                        }

                    }

                    if(x < -world.renderDistance || y < -world.renderDistance || z < -world.renderDistance || x > world.renderDistance || y > world.renderDistance || z > world.renderDistance){
                        if (world.doesChunkExist(player.chunk.x + x, player.chunk.y + y, player.chunk.z + z)) {
                            world.unloadChunk(player.chunk.x + x, player.chunk.y + y, player.chunk.z + z);
                        }
                    } else {
                        if (world.doesChunkExist(player.chunk.x + x, player.chunk.y + y, player.chunk.z + z)) {
                            world.loadChunk(player.chunk.x + x, player.chunk.y + y, player.chunk.z + z);
                        }
                    }
                }
            }
        }

    }

    if (generatorReady) {
        if (world.update.length >= 1) {
            if (!world.doesChunkExist(world.update[0][0], world.update[0][1], world.update[0][2])) {
                generatorReady = false;
                generator.postMessage({
                    chunkSize: world.chunkSize,
                    x: world.update[0][0],
                    y: world.update[0][1],
                    z: world.update[0][2],
                    cave: world.cave,
                    ground: world.ground,
                    seed: world.seed
                });
                world.update.shift();
            } else {
                world.update.shift();
            }
        }
    }

    if (generator2Ready) {
        if (world.update.length >= 1) {
            if (!world.doesChunkExist(world.update[0][0], world.update[0][1], world.update[0][2])) {
                generator2Ready = false;
                generator2.postMessage({
                    chunkSize: world.chunkSize,
                    x: world.update[0][0],
                    y: world.update[0][1],
                    z: world.update[0][2],
                    cave: world.cave,
                    ground: world.ground,
                    seed: world.seed
                });
                world.update.shift();
            } else {
                world.update.shift();
            }
        }
    }

    camera.rotateX(-player.t);
    camera.rotateY(-player.r);

    let rotateCam = 0;
    let tiltCam = 0;

    rotateCam = (round(-movedX, 4) * 0.003);
    tiltCam = (round(movedY, 4) * 0.003);

    player.r += (rotateCam * deltaTime) / 8;
    player.t -= (tiltCam * deltaTime) / 8;

    if (player.t >= 1.45) {
        player.t = 1.45;
    } else if (player.t <= -1.45) {
        player.t = -1.45;
    }

    if (player.r > Math.PI) {
        player.r -= Math.PI * 2;
    } else if (player.r < -Math.PI) {
        player.r += Math.PI * 2;
    }
    camera.rotateY(player.r);
    camera.rotateX(player.t);

    if (isNaN(smoothFps)) {
        smoothFps = 60;
    }
    if (deltaTime != undefined) {
        smoothFps = lerp(smoothFps, (1000 / deltaTime), 0.01);
    }

    

    player.camera = {
        x: player.x,
        y: player.y + (halfHeight / 2),
        z: player.z
    }

    hud();

    camera.position.x = player.camera.x;
    camera.position.y = player.camera.y;
    camera.position.z = player.camera.z;
    camera.aspect = window.innerWidth / window.innerHeight;

    updateBlockFacing();

    camera.updateProjectionMatrix();

}

function updateBlockFacing() {

    player.facing.ray = new THREE.Raycaster()
    player.facing.ray.setFromCamera(new THREE.Vector2(0, 0), camera);
    let intersects = player.facing.ray.intersectObjects(scene.children, true);

    if (intersects.length >= 1) {
        player.facing.x = Math.round(intersects[0].point.x - (intersects[0].face.normal.x * 0.5));
        player.facing.y = Math.round(intersects[0].point.y - (intersects[0].face.normal.y * 0.5));
        player.facing.z = Math.round(intersects[0].point.z - (intersects[0].face.normal.z * 0.5));

        player.facing.chunkX = world.gc(player.facing.x);
        player.facing.chunkY = world.gc(player.facing.y);
        player.facing.chunkZ = world.gc(player.facing.z);
    }

}

function windowResized() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    resizeCanvas(window.innerWidth, window.innerHeight);
}

document.addEventListener("mousedown", function (event) {
    if (event.button === 0) { // Left mouse button
        requestPointerLock();
        world.removeBlock(player.facing.x, player.facing.y, player.facing.z);
        mouse.l = true;
    }
    if (event.button === 2) { // Right mouse button
        mouse.r = true;
    }
    if (event.button === 1) { // Middle mouse button
        mouse.m = true;
    }
});

document.addEventListener("mouseup", function (event) {
    if (event.button === 0) { // Left mouse button
        mouse.l = false;
    }
    if (event.button === 2) { // Right mouse button
        mouse.r = false;
    }
    if (event.button === 1) { // Middle mouse button
        mouse.m = false;
    }
});

generator.onmessage = function (e) {
    world.processChunk(e.data);
    generatorReady = true;
}

generator2.onmessage = function (e) {
    world.processChunk(e.data);
    generator2Ready = true;
}