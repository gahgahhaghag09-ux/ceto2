import { petals as petalData } from "./petalData.js";
import { mobTypes } from "./mobs.js";
import { maps } from "./maps.js";
let currentMap = "main";
for (let f of maps.main.fills) {
  fillRect(f[0], f[1], f[2], f[3], f[4]);
}
let dragging = null;
let mobs = [];
let activePetals = [];
let drops = [];
let spawnTimer = 0;
let tx, ty;
let inputVx = 0;
let inputVy = 0;
let tries = 0;
let valid = false;
let playerHitCooldown = 0;
let rarityHpMultiplier = {
  common: 1,
  unusual: 3,
  rare: 9,
  epic: 27,
  legendary: 81,
  mythic: 243
};
let cachedBounds = {
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0
};
let player = {
  x: 400,
  y: 300,
  vx: 0,
  vy: 0,
  hp: 200
};
let playerRadius = 18;
function updateBounds() {
  const tiles = maps?.[currentMap]?.tiles;
  if (!tiles) return;

  let xs = [];
  let ys = [];

  for (let key in tiles) {
    let [x, y] = key.split(",").map(Number);
    xs.push(x);
    ys.push(y);
  }

  cachedBounds.minX = Math.min(...xs);
  cachedBounds.maxX = Math.max(...xs);
  cachedBounds.minY = Math.min(...ys);
  cachedBounds.maxY = Math.max(...ys);
}
function getSpawnRate() {
  let s = maps[currentMap]?.spawn ?? {
    baseSpawnRate: 40,
    spawnVariance: 3
  };

  return s.baseSpawnRate + mobs.length * s.spawnVariance;
}
function rebuildPetals() {
  activePetals = [];

  let i = 0;
  for (let s of slots) {
    if (s.petal) {
      activePetals.push({
        type: s.petal.type,
        angle: (i / maxEquip) * Math.PI * 2,
        dist: 60
      });
      i++;
    }
  }
}
function isMobBlocking(x, y) {
  for (let m of mobs) {
    let dx = x - m.x;
    let dy = y - m.y;
    let dist = Math.hypot(dx, dy);

    if (dist < playerRadius + m.r) {
      return true;
    }
  }
  return false;
}
let invButton = {
  x: 20,
  y: 0, // we’ll set this dynamically
  w: 60,
  h: 60
};
 function fillRect(x1, y1, x2, y2, value = 1) {
  let startX = Math.min(x1, x2);
  let endX = Math.max(x1, x2);
  let startY = Math.min(y1, y2);
  let endY = Math.max(y1, y2);

  let count = 0;

  if (!maps[currentMap]) {
  maps[currentMap] = { tiles: {} };
}

let map = maps[currentMap];
if (!map.tiles) map.tiles = {};

  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      map.tiles[`${x},${y}`] = value;
      count++;
    }
  }
}
let inventory = [

];
let equipped = [];
let maxEquip = 5;
let slots = [];

for (let i = 0; i < maxEquip; i++) {
  slots.push({
    x: 0,
    y: 0,
    w: 50,
    h: 50,
    petal: null
  });
}
let inventoryOpen = false;
let mapSize = 200;
let mapX = 20;
let mapY = 20;
let tileSize = 450;
let offsetX = 0;
let offsetY = 0;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let mouse = {
  x: 0,
  y: 0
};
let mouseX = 0;
let mouseY = 0;
canvas.addEventListener("mouseup", e => {
  if (!dragging) return;

  for (let s of slots) {
    if (
      mouseX > s.x && mouseX < s.x + s.w &&
      mouseY > s.y && mouseY < s.y + s.h
    ) {
      if (!s.petal) {
        s.petal = dragging;
      } else {
        inventory.push(s.petal);
        s.petal = dragging;
      }

      rebuildPetals(); // ✅ THIS LINE IS THE IMPORTANT PART

      dragging = null;
      return;
    }
  }

  inventory.push(dragging);
  dragging = null;
});
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();

  let mx = e.clientX - rect.left;
  let my = e.clientY - rect.top;

  for (let i = 0; i < inventory.length; i++) {
    let x = 20 + i * 60;
    let y = canvas.height - 80;

    if (
      mx > x && mx < x + 50 &&
      my > y && my < y + 50
    ) {
      dragging = {
        type: inventory[i].type
      };

      inventory.splice(i, 1);
      return;
    }
  }
});
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();

  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;

  mouseX = mouse.x;
  mouseY = mouse.y;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener("click", e => {
  let mx = e.clientX;
  let my = e.clientY;

  if (
    mx >= invButton.x &&
    mx <= invButton.x + invButton.w &&
    my >= invButton.y &&
    my <= invButton.y + invButton.h
  ) {
    inventoryOpen = !inventoryOpen;
  }
});

let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function isWall(x, y) {
  let mapObj = maps?.[currentMap]?.tiles;
  if (!mapObj) return false;

  let tx = Math.floor(x / tileSize);
  let ty = Math.floor(y / tileSize);

  return mapObj[`${tx},${ty}`] === 1;
}
function isColliding(x, y) {
  let r = playerRadius;

  let points = [
    [x - r, y],
    [x + r, y],
    [x, y - r],
    [x, y + r]
  ];

  for (let p of points) {
    if (isWall(p[0], p[1])) return true;
  }

  return false;
}
function getMapBounds() {
  const tiles = maps?.[currentMap]?.tiles;
  if (!tiles) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

  let xs = [];
  let ys = [];

  for (let key in tiles) {
    let [x, y] = key.split(",").map(Number);
    xs.push(x);
    ys.push(y);
  }

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}
function isMobColliding(x, y) {
  for (let m of mobs) {
    let dx = x - m.x;
    let dy = y - m.y;
    let dist = Math.hypot(dx, dy);

    // ignore tiny distances (prevents bugs)
    if (dist < 0.1) continue;

    if (dist < playerRadius + m.r) {
      return true;
    }
  }
  return false;
}
function update() {
  updateBounds();
  spawnTimer++;
    let worldMouseX = mouse.x - (canvas.width / 2 - player.x);
let worldMouseY = mouse.y - (canvas.height / 2 - player.y);
  let accel = 0.5;
  let friction = 0.9;

 let dx = worldMouseX - player.x;
let dy = worldMouseY - player.y;

let dist = Math.hypot(dx, dy);

let maxSpeed = 2;
let slowRadius = 150;

// 🎮 input strength based on distance (NOT velocity)
let inputSpeed = Math.min(dist / slowRadius, 1) * maxSpeed;

if (dist > 0) {
  inputVx = (dx / dist) * inputSpeed;
  inputVy = (dy / dist) * inputSpeed;
} else {
  inputVx = 0;
  inputVy = 0;
}

// ➕ ADD input to velocity (keeps knockback working)
player.vx += inputVx;
player.vy += inputVy;

// 🧱 clamp final velocity
let speed = Math.hypot(player.vx, player.vy);
if (speed > maxSpeed) {
  player.vx = (player.vx / speed) * maxSpeed;
  player.vy = (player.vy / speed) * maxSpeed;
}

player.vx += inputVx;
player.vy += inputVy;
let maxV = 1;
let nextX = player.x + player.vx;
let nextY = player.y + player.vy;

// X movement
if (!isColliding(nextX, player.y)) {
  player.x = nextX;
} else {
  player.vx = 0;
}

// Y movement
if (!isColliding(player.x, nextY)) {
  player.y = nextY;
} else {
  player.vy = 0;
}

// friction (VERY IMPORTANT)
player.vx *= 0.85;
player.vy *= 0.85;

for (let m of mobs) {
  if (m.hitCooldown > 0) {
    m.hitCooldown--;
  }
}
if (
  mobs.length < (maps[currentMap].spawn?.maxMobs ?? 50) &&
  spawnTimer >= getSpawnRate() &&
  Math.random() < (maps[currentMap]?.spawn?.spawnChance ?? 0.8)
) {

  spawnTimer = 0;

  let tx, ty;
  let tries = 0;
  let valid = false;

  while (tries < 20) {
  tx = Math.floor(Math.random() * (cachedBounds.maxX - cachedBounds.minX + 1)) + cachedBounds.minX;
  ty = Math.floor(Math.random() * (cachedBounds.maxY - cachedBounds.minY + 1)) + cachedBounds.minY;
   
    if (maps[currentMap]?.tiles?.[`${tx},${ty}`] !== 1) {
      valid = true;
      break;
    }

    tries++;
  }

  if (!valid) return;

   let spawnList = maps[currentMap]?.spawnList;

   // ===== RARITY PICK =====
let rarityList = maps[currentMap].rarities;

let totalR = 0;
for (let r of rarityList) totalR += r.weight;

let rr = Math.random() * totalR;

let rarity = "common";

for (let r of rarityList) {
  rr -= r.weight;
  if (rr <= 0) {
    rarity = r.rarity;
    break;
  }
}
if (!Array.isArray(spawnList) || spawnList.length === 0) {
  console.error("Invalid spawnList in map:", currentMap);
  return;
}

// total weight
let total = 0;
for (let s of spawnList) total += s.weight;

// pick random
let rand = Math.random() * total;

let chosen = spawnList[spawnList.length - 1].type; // fallback safety

for (let s of spawnList) {
  rand -= s.weight;
  if (rand <= 0) {
    chosen = s.type;
    break;
  }
}

let stats = mobTypes[chosen];

if (!stats) {
  console.error("Missing mob type:", chosen);
  return;
}
let typeData = mobTypes[chosen];

let rarityRadiusMultiplier = 1;

if (rarity === "unusual") rarityRadiusMultiplier = 1.1;
else if (rarity === "rare") rarityRadiusMultiplier = 1.3;
else if (rarity === "epic") rarityRadiusMultiplier = 1.6;
else if (rarity === "legendary") rarityRadiusMultiplier = 3;
else if (rarity === "mythic") rarityRadiusMultiplier = 5;

let finalR = typeData.r * rarityRadiusMultiplier;

 mobs.push({
  hitCooldown: 0,
  type: chosen,
  rarity: rarity,
  x: tx * tileSize + tileSize / 2,
  y: ty * tileSize + tileSize / 2,
  vx: 0,
  vy: 0,
 hp: stats.hp * (rarityHpMultiplier[rarity] ?? 1),
  dmg: stats.dmg,
  speed: stats.speed,
  r: finalR,

  //  AI 
  state: "idle",
  idleTime: typeData.idleTime,
  moveTime: typeData.moveTime,
  dir: Math.random() * Math.PI * 2
});
}
if (playerHitCooldown > 0) playerHitCooldown--;

for (let m of mobs) {

  // 1. AI 
  let typeData = mobTypes[m.type];

if (typeData.ai === "passive") {

    if (m.state === "idle") {
      m.idleTime--;

      if (m.idleTime <= 0) {
        m.state = "move";
        m.moveTime = 60;
        m.dir = Math.random() * Math.PI * 2;
      }

      m.vx = 0;
      m.vy = 0;
    }

    else if (m.state === "move") {
      m.moveTime--;

      m.vx = Math.cos(m.dir) * m.speed;
      m.vy = Math.sin(m.dir) * m.speed;

      let nextX = m.x + m.vx;
      let nextY = m.y + m.vy;

      if (!isWall(nextX, m.y)) m.x = nextX;
      else m.dir = Math.random() * Math.PI * 2;

      if (!isWall(m.x, nextY)) m.y = nextY;
      else m.dir = Math.random() * Math.PI * 2;

      if (m.moveTime <= 0) {
        m.state = "idle";
        m.idleTime = 100;
      }
    }
  }

  // 2. DAMAGE 
let dx = player.x - m.x;
let dy = player.y - m.y;
let dist = Math.hypot(dx, dy);

let hitRange = m.r + playerRadius;

if (dist < hitRange) {

  let nx = dx / (dist || 1);
  let ny = dy / (dist || 1);

  // always resolve overlap (prevents sticking)
  let overlap = hitRange - dist;

  player.x += nx * overlap * 0.5;
  player.y += ny * overlap * 0.5;

  m.x -= nx * overlap * 0.5;
  m.y -= ny * overlap * 0.5;

  // ONLY one real condition: hit cooldown
  if (playerHitCooldown <= 0 && m.hitCooldown <= 0) {

    // 🔥 DAMAGE FIRST (your idea, but correctly used)
    player.hp -= m.dmg;
    m.hp -= 10;

    // 🔥 THEN knockback (same event, not separate logic)
    let speed = Math.hypot(player.vx, player.vy);

    let strength = 6 + speed * 1.2;

   let kb = strength * 0.8;

// push into velocity instead of position
player.vx += nx * kb;
player.vy += ny * kb;

m.vx -= nx * kb * 0.8;
m.vy -= ny * kb * 0.8;

    playerHitCooldown = 10;
    m.hitCooldown = 10;

    console.log("HIT:", m.type);
  }
}
}
for (let p of activePetals) {
  p.angle += 0.05;
}
mobs = mobs.filter(m => {
  if (m.hp <= 0) {
    console.log("mob died");

    drops.push({
      x: m.x,
      y: m.y,
      type: "leaf",
      rarity: "common"
    });

    return false;
  }
  return true;
});
}
function draw() {
invButton.y = canvas.height - invButton.h - 20;
ctx.fillStyle = "#050505";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let camX = canvas.width / 2 - player.x;
let camY = canvas.height / 2 - player.y;

// =====================
// WORLD (CAMERA SPACE)
// =====================
ctx.save();
ctx.translate(camX, camY);

let tiles = maps?.[currentMap]?.tiles || {};

// tiles
let minX = Math.floor((player.x / tileSize) - 15);
let maxX = Math.floor((player.x / tileSize) + 15);
let minY = Math.floor((player.y / tileSize) - 15);
let maxY = Math.floor((player.y / tileSize) + 15);

for (let x = minX; x <= maxX; x++) {
  for (let y = minY; y <= maxY; y++) {
    let key = `${x},${y}`;
    if (tiles[key] === 1) {
      ctx.fillStyle = "#444";
      ctx.fillRect(
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize
      );
    }
  }
}

// mobs (IMPORTANT: still inside camera)
for (let m of mobs) {
  ctx.fillStyle = mobTypes[m.type].color;
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  ctx.fill();
}
for (let d of drops) {
  if (d.rarity === "common") ctx.fillStyle = "#7eef6d";
  else if (d.rarity === "unusual") ctx.fillStyle = "#ffe65d";
  else if (d.rarity === "rare") ctx.fillStyle = "#4d52e3";
  else if (d.rarity === "epic") ctx.fillStyle = "#861fde";
  else if (d.rarity === "legendary") ctx.fillStyle = "#de1f1f";
  else if (d.rarity === "mythic") ctx.fillStyle = "#1fdbde";
  else if (d.rarity === "ultra") ctx.fillStyle = "#ff2b75"
  
  ctx.beginPath();
  ctx.arc(d.x, d.y, 6, 0, Math.PI * 2);
  ctx.fill();
}
// player (WORLD)
let r = 20;
ctx.fillStyle = "#cfbb50";
ctx.beginPath();
ctx.arc(player.x, player.y, r + 3, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = "#ffe763";
ctx.beginPath();
ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
ctx.fill();

ctx.restore(); // ONLY ONCE

let offsetX = cachedBounds.minX * tileSize;
let offsetY = cachedBounds.minY * tileSize;
let radius = 20;
let mapWidth = (cachedBounds.maxX - cachedBounds.minX + 1) * tileSize;
let mapHeight = (cachedBounds.maxY - cachedBounds.minY + 1) * tileSize;
// fit inside minimap box
let mapScale = Math.min(
  mapSize / mapWidth,
  mapSize / mapHeight
);
 mapX = canvas.width - mapSize - 20;
 mapY = 20;

// background
ctx.fillStyle = "#fff";
ctx.fillRect(mapX, mapY, mapSize, mapSize);

// border
ctx.strokeStyle = "black";
ctx.strokeRect(mapX, mapY, mapSize, mapSize);

// walls

for (let key in tiles) {
  let [x, y] = key.split(",").map(Number);

  if (tiles[key] === 1) {
    ctx.fillStyle = "#000";

    ctx.fillRect(
      mapX + (x * tileSize - offsetX) * mapScale,
      mapY + (y * tileSize - offsetY) * mapScale,
      tileSize * mapScale,
      tileSize * mapScale
    );
  }
}
// button background
ctx.fillStyle = inventoryOpen ? "#888" : "#444";
ctx.fillRect(invButton.x, invButton.y, invButton.w, invButton.h);

// border
ctx.strokeStyle = "black";
ctx.strokeRect(invButton.x, invButton.y, invButton.w, invButton.h);

// simple icon (3 lines = inventory)
ctx.strokeStyle = "white";
ctx.lineWidth = 3;

for (let i = 0; i < 3; i++) {
  let y = invButton.y + 15 + i * 15;
  ctx.beginPath();
  ctx.moveTo(invButton.x + 15, y);
  ctx.lineTo(invButton.x + invButton.w - 15, y);
  ctx.stroke();
}
if (inventoryOpen) {
  for (let i = 0; i < inventory.length; i++) {
    let x = 20 + i * 60;
    let y = canvas.height - 80;

    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, 50, 50);

    let type = inventory[i].type;

    ctx.beginPath();
    ctx.arc(x + 25, y + 25, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}
// player
let px = mapX + (player.x - offsetX) * mapScale;
let py = mapY + (player.y - offsetY) * mapScale;

// outline
ctx.fillStyle = "black";
ctx.beginPath();
ctx.arc(px, py, 3, 0, Math.PI * 2);
ctx.fill();

// inside
ctx.fillStyle = "yellow";
ctx.beginPath();
ctx.arc(px, py, 2, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = "white";
ctx.font = "12px Arial";

for (let i = 0; i < slots.length; i++) {
  slots[i].x = canvas.width / 2 - (slots.length * 55) / 2 + i * 55;
  slots[i].y = canvas.height - 150;

  ctx.fillStyle = "#555";
  ctx.fillRect(slots[i].x, slots[i].y, 50, 50);

  if (slots[i].petal) {
    ctx.fillStyle = "yellow";
    ctx.fillText(slots[i].petal.type, slots[i].x + 5, slots[i].y + 30);
  }
}

for (let i = 0; i < inventory.length; i++) {
  let x = 20 + i * 60;
  let y = canvas.height - 80;

  ctx.fillStyle = "#333";
  ctx.fillRect(x, y, 50, 50);

  ctx.fillStyle = "white";
  ctx.fillText(inventory[i].type, x + 5, y + 30);
}
for (let i = drops.length - 1; i >= 0; i--) {
  let d = drops[i];

  let dx = player.x - d.x;
  let dy = player.y - d.y;
  let dist = Math.hypot(dx, dy);

  if (dist < 25) {
    inventory.push({
      type: d.type,
      rarity: d.rarity
    });

    drops.splice(i, 1);
  }
}
}
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop(); 
