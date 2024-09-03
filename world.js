class World {
    constructor() {
        this.chunk = {};
        this.chunkModel = {};
        this.chunkSize = 8;
        this.update = [];
        this.renderDistance = 3;
        this.seed = Math.random();

        this.ground = {
            height: 6,
            offset: -5,
            scale: 0.07
        },

            this.cave = {
                scaleHoriz: 0.06,
                scaleVert: 0.12,
                threshold: 0.3
            }

    }

    generate(xc, yc, zc) {

        let alreadyExists = false;
        if (this.chunk[xc]) {
            if (this.chunk[xc][yc]) {
                if (Array.isArray(this.chunk[xc][yc][zc])) {
                    alreadyExists = true;
                }
            }
        }

        if (!alreadyExists) {

            this.ensureChunkExists(xc, yc, zc);

            for (let x = xc * this.chunkSize; x < (xc * this.chunkSize) + this.chunkSize; x++) {
                for (let z = zc * this.chunkSize; z < (zc * this.chunkSize) + this.chunkSize; z++) {
                    let groundHeight = (Math.round(perlin2D.noise(x * this.ground.scale + 100, z * this.ground.scale + 100) * this.ground.height) + this.ground.offset);
                    for (let y = yc * this.chunkSize; y < (yc * this.chunkSize) + this.chunkSize; y++) {

                        if (perlin3D.noise(x * this.cave.scaleHoriz + 1246, y * this.cave.scaleVert + 1285, z * this.cave.scaleHoriz + 1983) < this.cave.threshold) {
                            // grass
                            if (y === groundHeight) {
                                this.addBlock(x, y, z, "grass");
                            }

                            // dirt
                            if (y < groundHeight && y > groundHeight - 3) {
                                this.addBlock(x, y, z, "dirt");
                            }

                            // stone
                            if (y <= groundHeight - 3) {
                                this.addBlock(x, y, z, "stone");
                            }
                        }

                    }
                }
            }
        }

        this.compileChunk(xc, yc, zc);

    }

    collide() {

        let blocksToCheck = [];

        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                for (let z = -1; z <= 1; z += 2) {
                    let exists = false;
                    let check = [Math.round(player.x + (halfWidth * x)), Math.round(player.y + (halfHeight * y)), Math.round(player.z + (halfWidth * z))];

                    for(let i = 0; i < blocksToCheck.length; i++){
                        if(check[0] === blocksToCheck[i][0] && check[1] === blocksToCheck[i][1] && check[2] === blocksToCheck[i][2]){
                            exists = true;
                        }
                    }

                    if (!exists) {
                        blocksToCheck.push([check[0], check[1], check[2]]);
                    }
                }
            }
        }

        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                for (let z = -1; z <= 1; z += 2) {
                    let exists = false;
                    let check = [Math.round(player.x + (halfWidth * x) + (player.xVel * deltaTime)), Math.round(player.y + (halfHeight * y) + (player.yVel * deltaTime)), Math.round(player.z + (halfWidth * z) + (player.zVel * deltaTime))];

                    for(let i = 0; i < blocksToCheck.length; i++){
                        if(check[0] === blocksToCheck[i][0] && check[1] === blocksToCheck[i][1] && check[2] === blocksToCheck[i][2]){
                            exists = true;
                        }
                    }

                    if (!exists) {
                        blocksToCheck.push([check[0], check[1], check[2]]);
                    }
                }
            }
        }

        //console.log(blocksToCheck.length)

        player.onGround = false;

        for (let c = 0; c < blocksToCheck.length; c++) {
            let chk = this.gc(blocksToCheck[c][0], blocksToCheck[c][1], blocksToCheck[c][2]);
            if (this.chunk[chk[0]]) {
                if (this.chunk[chk[0]][chk[1]]) {
                    if (Array.isArray(this.chunk[chk[0]][chk[1]][chk[2]])) {
                        let x2 = blocksToCheck[c][0] - (chk[0]*this.chunkSize);
                        let y2 = blocksToCheck[c][1] - (chk[1]*this.chunkSize);
                        let z2 = blocksToCheck[c][2] - (chk[2]*this.chunkSize);
                        this.chunk[chk[0]][chk[1]][chk[2]][x2][y2][z2].collideFloor();
                    }
                }
            }
        }

        for (let c = 0; c < blocksToCheck.length; c++) {
            let chk = this.gc(blocksToCheck[c][0], blocksToCheck[c][1], blocksToCheck[c][2]);
            if (this.chunk[chk[0]]) {
                if (this.chunk[chk[0]][chk[1]]) {
                    if (Array.isArray(this.chunk[chk[0]][chk[1]][chk[2]])) {
                        let x2 = blocksToCheck[c][0] - (chk[0]*this.chunkSize);
                        let y2 = blocksToCheck[c][1] - (chk[1]*this.chunkSize);
                        let z2 = blocksToCheck[c][2] - (chk[2]*this.chunkSize);
                        this.chunk[chk[0]][chk[1]][chk[2]][x2][y2][z2].collide();
                    }
                }
            }
        }

    }

    gc(x, y, z) {
        x += 0.5;
        y += 0.5;
        z += 0.5;
        if (arguments.length === 3) {
            return [Math.floor(x / this.chunkSize), Math.floor(y / this.chunkSize), Math.floor(z / this.chunkSize)];
        } else if (arguments.length === 1) {
            return Math.floor(x / this.chunkSize);
        }
    }

    ensureChunkExists(x, y, z){
        if (!this.chunk[x]) {
            this.chunk[x] = {};
        }
        if (!this.chunk[x][y]) {
            this.chunk[x][y] = {};
        }
        if (!Array.isArray(this.chunk[x][y][z])) {

            let chunkX = x * this.chunkSize;
            let chunkY = y * this.chunkSize;
            let chunkZ = z * this.chunkSize;

            this.chunk[x][y][z] = [];
            for(let x2 = 0; x2 < this.chunkSize; x2++){
                this.chunk[x][y][z].push([]);
                for(let y2 = 0; y2 < this.chunkSize; y2++){
                    this.chunk[x][y][z][x2].push([]);
                    for(let z2 = 0; z2 < this.chunkSize; z2++){
                        this.chunk[x][y][z][x2][y2].push(new Block(x2+chunkX, y2+chunkY, z2+chunkZ, "air"));
                    }
                }
            }
        }
        if (!this.chunkModel[x]) {
            this.chunkModel[x] = {};
        }
        if (!this.chunkModel[x][y]) {
            this.chunkModel[x][y] = {};
        }
        if (!this.chunkModel[x][y][z]) {
            this.chunkModel[x][y][z] = {};
        }
    }

    doesChunkExist(x, y, z){
        if (this.chunk[x]) {
            if (this.chunk[x][y]) {
                if (Array.isArray(this.chunk[x][y][z])) {
                    return true;
                }
            }
        }
        return false;
    }

    addBlock(x, y, z, tex) {
        let ch = this.gc(x, y, z);

        this.ensureChunkExists();

        let x2 = x - (ch[0]*this.chunkSize);
        let y2 = y - (ch[1]*this.chunkSize);
        let z2 = z - (ch[2]*this.chunkSize);


        this.chunk[ch[0]][ch[1]][ch[2]][x2][y2][z2] = new Block(x, y, z, tex);
    }

    removeBlock(x, y, z) {
        let ch = this.gc(x, y, z);

        if (this.chunk[ch[0]]) {
            if (this.chunk[ch[0]][ch[1]]) {
                if (Array.isArray(this.chunk[ch[0]][ch[1]][ch[2]])) {
                    let temp = this.chunk[ch[0]][ch[1]][ch[2]].length;
                    for (let b = temp - 1; b >= 0; b--) {
                        if (this.chunk[ch[0]][ch[1]][ch[2]][b].x === x && this.chunk[ch[0]][ch[1]][ch[2]][b].y === y && this.chunk[ch[0]][ch[1]][ch[2]][b].z === z) {
                            this.chunk[ch[0]][ch[1]][ch[2]].splice(b, 1);
                        }
                    }
                    this.compileChunk(ch[0], ch[1], ch[2]);
                }
            }
        }
    }

    unloadChunk(x, y, z){
        scene.remove(this.chunkModel[x][y][z].model);
        this.chunkModel[x][y][z].rendered = false;
    }

    loadChunk(x, y, z){
        if(!this.chunkModel[x][y][z].rendered){
            scene.add(this.chunkModel[x][y][z].model);
            this.chunkModel[x][y][z].rendered = true;
        }
    }

    addBlockRaw(x, y, z, tex) {
        let ch = this.gc(x, y, z);
        this.chunk[ch[0]][ch[1]][ch[2]][x][y][z] = new Block(x, y, z, tex);
    }

    generateNearby() {

        let ch = this.gc(player.x, player.y, player.z);

        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let y = -this.renderDistance; y <= this.renderDistance; y++) {
                for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                    if(x === 0 && z === 0){
                        this.generate(ch[0] + x, ch[1] - y, ch[2] + z); 
                    } else {
                        this.update.push([ch[0] + x, ch[1] - y, ch[2] + z]);
                    }
                }
            }
        }

    }

    checkForBlock(x, y, z) {

        let cx = Math.floor(x/this.chunkSize);
        let cy = Math.floor(y/this.chunkSize);
        let cz = Math.floor(z/this.chunkSize);

        let bx = x%this.chunkSize;
        let by = y%this.chunkSize;
        let bz = z%this.chunkSize;

        if(this.doesChunkExist(cx, cy, cz)){
            //let block = this.chunk[cx][cy][cz];
            //if (block.type != "air") {
                //return true;
            //}
        }
        return false;
    }

    compile() {
        for (let x in this.chunk) {
            for (let y in this.chunk[x]) {
                for (let z in this.chunk[x][y]) {

                    this.compileChunk(x, y, z);
                    
                }
            }
        }
    }

    compileChunk(x, y, z) {

        if (this.chunkModel[x][y][z].model === undefined) {

        } else {
            scene.remove(this.chunkModel[x][y][z].model);
            this.chunkModel[x][y][z].model.geometry.dispose();
            this.chunkModel[x][y][z].model.material.dispose();
        }
        let vertices = [];
        let indices = [];
        let UVs = [];

        let totalIndices = 0;

        let chunk = this.chunk[x][y][z];

        for (let b = 0; b < this.chunkSize; b++) {
            for (let c = 0; c < this.chunkSize; c++) {
                for (let d = 0; d < this.chunkSize; d++) {
                    let block = chunk[b][c][d];

                    

                    if(block.type != "air"){
                        // Back (z-)
                    if (!this.checkForBlock(block.x, block.y, block.z - 1)) {
                        vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
                        vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
                        vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
                        vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
                        UVs.push(block.lx, block.ly);
                        UVs.push(block.lx, block.hy);
                        UVs.push(block.hx, block.hy);
                        UVs.push(block.hx, block.ly);
                        indices.push(0 + totalIndices, 1 + totalIndices, 2 + totalIndices, 0 + totalIndices, 2 + totalIndices, 3 + totalIndices);
                        totalIndices += 4;
                    }


                    // Front (z+)
                    if (!this.checkForBlock(block.x, block.y, block.z + 1)) {
                        vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
                        vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
                        vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
                        vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
                        UVs.push(block.lx, block.ly);
                        UVs.push(block.lx, block.hy);
                        UVs.push(block.hx, block.hy);
                        UVs.push(block.hx, block.ly);
                        indices.push(0 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices);
                        totalIndices += 4;
                    }

                    // Left (x-)
                    if (!this.checkForBlock(block.x - 1, block.y, block.z)) {
                        vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
                        vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
                        vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
                        vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
                        UVs.push(block.hx, block.hy);
                        UVs.push(block.lx, block.hy);
                        UVs.push(block.lx, block.ly);
                        UVs.push(block.hx, block.ly);
                        indices.push(2 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices);
                        totalIndices += 4;
                    }

                    // Right (x+)
                    if (!this.checkForBlock(block.x + 1, block.y, block.z)) {
                        vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
                        vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
                        vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
                        vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
                        UVs.push(block.hx, block.hy);
                        UVs.push(block.lx, block.hy);
                        UVs.push(block.lx, block.ly);
                        UVs.push(block.hx, block.ly);
                        indices.push(0 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices, 2 + totalIndices);
                        totalIndices += 4;
                    }

                    // Bottom (y-)
                    if (!this.checkForBlock(block.x, block.y - 1, block.z)) {
                        vertices.push(block.x - 0.5, block.y - 0.5, block.z - 0.5);
                        vertices.push(block.x - 0.5, block.y - 0.5, block.z + 0.5);
                        vertices.push(block.x + 0.5, block.y - 0.5, block.z + 0.5);
                        vertices.push(block.x + 0.5, block.y - 0.5, block.z - 0.5);
                        UVs.push(block.lx, block.ly);
                        UVs.push(block.lx, block.hy);
                        UVs.push(block.hx, block.hy);
                        UVs.push(block.hx, block.ly);
                        indices.push(0 + totalIndices, 3 + totalIndices, 2 + totalIndices, 0 + totalIndices, 2 + totalIndices, 1 + totalIndices);
                        totalIndices += 4;
                    }

                    // Top (y+)
                    if (!this.checkForBlock(block.x, block.y + 1, block.z)) {
                        vertices.push(block.x - 0.5, block.y + 0.5, block.z + 0.5);
                        vertices.push(block.x - 0.5, block.y + 0.5, block.z - 0.5);
                        vertices.push(block.x + 0.5, block.y + 0.5, block.z - 0.5);
                        vertices.push(block.x + 0.5, block.y + 0.5, block.z + 0.5);
                        UVs.push(block.lx, block.hy);
                        UVs.push(block.lx, block.ly);
                        UVs.push(block.hx, block.ly);
                        UVs.push(block.hx, block.hy);
                        indices.push(1 + totalIndices, 3 + totalIndices, 2 + totalIndices, 1 + totalIndices, 0 + totalIndices, 3 + totalIndices);
                        totalIndices += 4;
                    }
                    }

                }
            }   
        }

        let vertices2 = new Float32Array(vertices);
        let indices2 = new Uint16Array(indices);
        let UVs2 = new Float32Array(UVs);

        let geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(UVs2, 2));
        geometry.setIndex(new THREE.BufferAttribute(indices2, 1));

        geometry.computeVertexNormals();

        let material = new THREE.MeshStandardMaterial({ map: texSheet, side: THREE.FrontSide });
        this.chunkModel[x][y][z].model = new THREE.Mesh(geometry, material);

        scene.add(this.chunkModel[x][y][z].model);
        this.chunkModel[x][y][z].rendered = true;
    }

    processChunk(data){

        console.log(data);

        this.ensureChunkExists(data.x, data.y, data.z);

        let cx = data.x * this.chunkSize;
        let cy = data.y * this.chunkSize;
        let cz = data.z * this.chunkSize;

        for(let x=0; x<this.chunkSize; x++){
            for(let y=0; y<this.chunkSize; y++){
                for(let z=0; z<this.chunkSize; z++){
                    this.chunk[data.x][data.y][data.z][x][y][z] = new Block(x+cx, y+cy, z+cz, data.blocks[x][y][z]);
                }
            }
        }

        let geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(data.vertices, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(data.UVs, 2));
        geometry.setIndex(new THREE.BufferAttribute(data.indices, 1));

        geometry.computeVertexNormals();

        let material = new THREE.MeshStandardMaterial({ map: texSheet, side: THREE.FrontSide });
        this.chunkModel[data.x][data.y][data.z].model = new THREE.Mesh(geometry, material);

        scene.add(this.chunkModel[data.x][data.y][data.z].model);

    }
}