import { petalTypes } from "./petalData.js";
import { maps } from "./maps.js";
let currentMap = "main";
let dragging = null;
let petals = [];
function rebuildPetals() {
  petals = [];

  let i = 0;
  for (let s of slots) {
    if (s.petal) {
      petals.push({
        type: s.petal.type,
        angle: (i / maxEquip) * Math.PI * 2, // spread evenly
        dist: 60
      });
      i++;
    }
  }
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

  let map = maps?.[currentMap];
  if (!map) return;
  if (!map.tiles) map.tiles = {};

  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      map.tiles[`${x},${y}`] = value;
      count++;
    }
  }

  console.log(`Filled ${count} tiles`);
}
let inventory = [
  { type: "basic" },
  { type: "rose" },
  { type: "rice" }
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
  for (let i = 0; i < inventory.length; i++) {
    let x = 20 + i * 60;
    let y = canvas.height - 80;

    if (
      mouseX > x && mouseX < x + 50 &&
      mouseY > y && mouseY < y + 50
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
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  mouseX = e.clientX;
  mouseY = e.clientY;
});

fillRect(7,9,11,11); fillRect(9,8,11,7); fillRect(14,14,14,1); fillRect(14,-14,14,-1);
fillRect(-7,9,-11,11); fillRect(-9,8,-11,7); fillRect(-14,-14,-1,-14); fillRect(14,-14,1,-14);
fillRect(7,-9,11,-11); fillRect(9,-8,11,-7); fillRect(-14,-14,-14,-1); fillRect(-14,14,-14,1);
fillRect(-7,-9,-11,-11); fillRect(-9,-8,-11,-7); fillRect(14,14,1,14); fillRect(-14,14,-1,14);
fillRect(15,15,15,-15); fillRect(-15,-15,15,-15); fillRect(-15,-15,-15,15); fillRect(-15,15,15,15);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: 400,
  y: 300,
  vx: 0,
  vy: 0
};
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

function update() {
    console.log(maps[currentMap]);
    let worldMouseX = mouse.x - (canvas.width / 2 - player.x);
let worldMouseY = mouse.y - (canvas.height / 2 - player.y);
  let accel = 0.5;
  let friction = 0.9;

 let dx = worldMouseX - player.x;
let dy = worldMouseY - player.y;

let dist = Math.hypot(dx, dy);

let maxSpeed = 6;
let slowRadius = 150;

let speed = Math.min(dist / slowRadius, 1) * maxSpeed;

// target velocity
let targetVx = 0;
let targetVy = 0;

if (dist > 3) {
  targetVx = (dx / dist) * speed;
  targetVy = (dy / dist) * speed;
}

// smooth movement (this fixes turning)
let smooth = 0.5;

player.vx += (targetVx - player.vx) * smooth;
player.vy += (targetVy - player.vy) * smooth;

  player.vx *= friction;
  player.vy *= friction;

 let r = 20;

let nextX = player.x + player.vx;
let nextY = player.y + player.vy;

// horizontal collision (check left + right edges)
if (
  !isWall(nextX + r, player.y) &&
  !isWall(nextX - r, player.y)
) {
  player.x = nextX;
} else {
  player.vx = 0;
}

// vertical collision (check top + bottom edges)
if (
  !isWall(player.x, nextY + r) &&
  !isWall(player.x, nextY - r)
) {
  player.y = nextY;
} else {
  player.vy = 0;
}
for (let p of petals) {
  p.angle += 0.05;
}
for (let p of petals) {
  p.angle += 0.05;
}
}

function draw() {
    invButton.y = canvas.height - invButton.h - 20;
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let camX = canvas.width / 2 - player.x;
  let camY = canvas.height / 2 - player.y;

  ctx.save();
  ctx.translate(camX, camY);

 let tiles = maps?.[currentMap]?.tiles || {};

for (let key in tiles) {
  let [x, y] = key.split(",").map(Number);

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
  // player
let r = 20;

ctx.fillStyle = "#cfbb50";
ctx.beginPath();
ctx.arc(player.x, player.y, r + 3, 0, Math.PI * 2);
ctx.fill();

// yellow/white flower inside
ctx.fillStyle = "#ffe763";
ctx.beginPath();
ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
ctx.fill();

  ctx.restore();
let bounds = getMapBounds();
let offsetX = bounds.minX * tileSize;
let offsetY = bounds.minY * tileSize;

let radius = 40;

  // MINIMAP 
let mapWidth = (bounds.maxX - bounds.minX + 1) * tileSize;
let mapHeight = (bounds.maxY - bounds.minY + 1) * tileSize;

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

    // draw petal ONLY inside inventory
    if (type === "basic") ctx.fillStyle = "#ffffff";
    if (type === "rose") ctx.fillStyle = "#ff4d6d";
    if (type === "rice") ctx.fillStyle = "#f5f5f5";

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
}
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop(); 

