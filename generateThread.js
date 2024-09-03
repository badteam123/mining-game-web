function checkForBlock(array, x, y, z, bruh) {
  if(x < 0 || x >= bruh){
    return false;
  }
  if(y < 0 || y >= bruh){
    return false;
  }
  if(z < 0 || z >= bruh){
    return false;
  }
  if (array[x][y][z] != "air") {
    return true;
  }
  return false;
}

self.onmessage = function (e) {

  const perlin2D = new PerlinNoise2D(e.data.seed);
  const perlin3D = new PerlinNoise3D(e.data.seed);

  //boise.seed(e.data.seed);

  var returnData = {
    x: e.data.x,
    y: e.data.y,
    z: e.data.z,
    blocks: []
  };

  for(let x=0; x<e.data.chunkSize; x++){
    returnData.blocks.push([]);
    for(let y=0; y<e.data.chunkSize; y++){
      returnData.blocks[x].push([]);
      for(let z=0; z<e.data.chunkSize; z++){
        returnData.blocks[x][y].push([]);
      }
    }
  }

  // this.addBlockRaw(x, y, z, "grass");
  // returnData.blocks.push({ x: x, y: y, z: z, type: "grass" });

  for (let x = e.data.x * e.data.chunkSize; x < (e.data.x * e.data.chunkSize) + e.data.chunkSize; x++) {
    for (let z = e.data.z * e.data.chunkSize; z < (e.data.z * e.data.chunkSize) + e.data.chunkSize; z++) {
      //boise.seed(123);
      let groundHeight = (Math.round(perlin2D.noise(x * e.data.ground.scale + 100, z * e.data.ground.scale + 100) * e.data.ground.height) + e.data.ground.offset);
      for (let y = e.data.y * e.data.chunkSize; y < (e.data.y * e.data.chunkSize) + e.data.chunkSize; y++) {

        let x2 = x - (e.data.x * e.data.chunkSize);
        let y2 = y - (e.data.y * e.data.chunkSize);
        let z2 = z - (e.data.z * e.data.chunkSize);

        if (perlin3D.noise(x * e.data.cave.scaleHoriz + 1246, y * e.data.cave.scaleVert + 1285, z * e.data.cave.scaleHoriz + 1983) < e.data.cave.threshold) {
          // grass
          if (y === groundHeight) {
            returnData.blocks[x2][y2][z2].push("grass");
          }

          // dirt
          else if (y < groundHeight && y > groundHeight - 3) {
            returnData.blocks[x2][y2][z2].push("dirt");
          }

          // stone
          else if (y <= groundHeight - 3) {
            returnData.blocks[x2][y2][z2].push("stone");
          }

          // air
          else {
            returnData.blocks[x2][y2][z2].push("air");
          }
        } else {
          // also air
          returnData.blocks[x2][y2][z2].push("air");
        }

      }
    }
  }

  let vertices = [];
  let indices = [];
  let UVs = [];

  let totalIndices = 0;

  for (let b = 0; b < e.data.chunkSize; b++) {
    for (let c = 0; c < e.data.chunkSize; c++) {
      for (let d = 0; d < e.data.chunkSize; d++) {

        if(returnData.blocks[b][c][d] != "air"){
          let x2 = (e.data.x * e.data.chunkSize);
          let y2 = (e.data.y * e.data.chunkSize);
          let z2 = (e.data.z * e.data.chunkSize);

          let block = {x: x2+b, y:y2+c, z:z2+d};

          switch (returnData.blocks[b][c][d]) {
            case "grass":
              block.lx = 0.0;
              block.ly = 0.9;
              break;
            case "dirt":
              block.lx = 0.1;
              block.ly = 0.9;
              break;
            case "stone":
              block.lx = 0.2;
              block.ly = 0.9;
              break;
          }

          block.hx = block.lx + 0.1;
          block.hy = block.ly + 0.1;

          // Back (z-)
          if (!checkForBlock(returnData.blocks, block.x, block.y, block.z - 1, e.data.chunkSize)) {
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
          if (!checkForBlock(returnData.blocks, block.x, block.y, block.z + 1, e.data.chunkSize)) {
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
          if (!checkForBlock(returnData.blocks, block.x - 1, block.y, block.z, e.data.chunkSize)) {
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
          if (!checkForBlock(returnData.blocks, block.x + 1, block.y, block.z, e.data.chunkSize)) {
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
          if (!checkForBlock(returnData.blocks, block.x, block.y - 1, block.z, e.data.chunkSize)) {
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
          if (!checkForBlock(returnData.blocks, block.x, block.y + 1, block.z, e.data.chunkSize)) {
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

  returnData.vertices = new Float32Array(vertices);
  returnData.indices = new Uint16Array(indices);
  returnData.UVs = new Float32Array(UVs);

  self.postMessage(returnData);
};

class PerlinNoise2D {
  constructor(seed = 0) {
    this.p = new Uint8Array(512);
    this.perm = new Uint8Array(512);
    this.seed(seed);
  }

  seed(seed) {
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }

    for (let i = 0; i < 256; i++) {
      let j = (seed + 31 * i) & 255;
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
      this.perm[i] = this.perm[i + 256] = this.p[i];
    }
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    let h = hash & 15;
    let u = h < 8 ? x : y;
    let v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y) {
    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    let u = this.fade(x);
    let v = this.fade(y);

    let a = this.perm[X] + Y;
    let aa = this.perm[a];
    let ab = this.perm[a + 1];
    let b = this.perm[X + 1] + Y;
    let ba = this.perm[b];
    let bb = this.perm[b + 1];

    return this.lerp(v, this.lerp(u, this.grad(this.perm[aa], x, y),
      this.grad(this.perm[ba], x - 1, y)),
      this.lerp(u, this.grad(this.perm[ab], x, y - 1),
        this.grad(this.perm[bb], x - 1, y - 1)));
  }
}

class PerlinNoise3D {
  constructor(seed = 0) {
    this.p = new Uint8Array(512);
    this.perm = new Uint8Array(512);
    this.seed(seed);
  }

  seed(seed) {
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }

    for (let i = 0; i < 256; i++) {
      let j = (seed + 31 * i) & 255;
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
      this.perm[i] = this.perm[i + 256] = this.p[i];
    }
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    let h = hash & 15;
    let u = h < 8 ? x : y;
    let v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y, z) {
    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;
    let Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    let u = this.fade(x);
    let v = this.fade(y);
    let w = this.fade(z);

    let a = this.perm[X] + Y;
    let aa = this.perm[a] + Z;
    let ab = this.perm[a + 1] + Z;
    let b = this.perm[X + 1] + Y;
    let ba = this.perm[b] + Z;
    let bb = this.perm[b + 1] + Z;

    return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.perm[aa], x, y, z),
      this.grad(this.perm[ba], x - 1, y, z)),
      this.lerp(u, this.grad(this.perm[ab], x, y - 1, z),
        this.grad(this.perm[bb], x - 1, y - 1, z))),
      this.lerp(v, this.lerp(u, this.grad(this.perm[aa + 1], x, y, z - 1),
        this.grad(this.perm[ba + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.perm[ab + 1], x, y - 1, z - 1),
          this.grad(this.perm[bb + 1], x - 1, y - 1, z - 1))));
  }
}
