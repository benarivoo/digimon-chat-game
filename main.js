const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let agumonImg = new Image();
agumonImg.src = 'agumon.png';

// Agumon position
let agumonX = 350;
let agumonY = 300;
let agumonSpeed = 4;
let facingRight = false; // default: looking left

// Chat response
let chatResponse = '';
let userInputField = document.getElementById('userInput');

// Movement keys
let keys = {};

// Load image and start game loop
agumonImg.onload = () => {
  requestAnimationFrame(gameLoop);
};

// === Key Handling ===
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// === Game Loop ===
function gameLoop() {
  update();
  drawScene();
  requestAnimationFrame(gameLoop);
}

function update() {
    if (keys['ArrowLeft']) {
      agumonX -= agumonSpeed;
      facingRight = false;
    }
    if (keys['ArrowRight']) {
      agumonX += agumonSpeed;
      facingRight = true;
    }
    if (keys['ArrowUp']) agumonY -= agumonSpeed;
    if (keys['ArrowDown']) agumonY += agumonSpeed;
  }
  

function drawScene() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Save context
ctx.save();

if (facingRight) {
    ctx.translate(agumonX + 100, agumonY);
    ctx.scale(-1, 1);
    ctx.drawImage(agumonImg, 0, 0, 100, 100);
} else {
    ctx.drawImage(agumonImg, agumonX, agumonY, 100, 100);
}

ctx.restore();

if (chatResponse) {
    drawSpeechBubble(agumonX, agumonY, chatResponse);;
}
}
  
  

function drawSpeechBubble(x, y, text) {
    ctx.font = '16px Arial';
    const words = text.split(' ');
    const maxLineWidth = 220;
    const lineHeight = 20;
  
    let lines = [];
    let currentLine = '';
  
    for (let word of words) {
      const testLine = currentLine + word + ' ';
      if (ctx.measureText(testLine).width < maxLineWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      }
    }
    if (currentLine) lines.push(currentLine.trim());
  
    // Calculate dynamic width based on longest line
    let maxWidth = lines.reduce((max, line) => {
      return Math.max(max, ctx.measureText(line).width);
    }, 0) + 20;
  
    let bubbleHeight = lines.length * lineHeight + 20;
  
    // Bubble background
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y - bubbleHeight - 10, maxWidth, bubbleHeight);
    ctx.strokeRect(x, y - bubbleHeight - 10, maxWidth, bubbleHeight);
  
    // Draw each line
    ctx.fillStyle = 'black';
    lines.forEach((line, i) => {
      ctx.fillText(line, x + 10, y - bubbleHeight + 10 + i * lineHeight);
    });
  }
  

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

async function sendMessage() {
    const userMessage = userInputField.value.trim();
    if (!userMessage) return;
  
    const response = await fetch('https://digimon-api-u2n3.onrender.com/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage, form: 'Agumon' })
    });
  
    const data = await response.json();
    chatResponse = data.response || "Error: " + data.error;
    userInputField.value = '';
    drawScene(); // <-- add this line to trigger redraw
  }