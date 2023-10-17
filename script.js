const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerImage = new Image();
playerImage.src = "/assets/player.png";
const enemyImage = new Image();
enemyImage.src = "/assets/enemy.png";
const bulletImage = new Image();
bulletImage.src = "/assets/bullet.png";
const bgImage = new Image();
bgImage.src = "/assets/bg.png";

const bgMusic = new Audio("/assets/bg.mp3");
const playerShootSound = new Audio("/assets/shoot.mp3");
const enemyDieSound = new Audio("/assets/enemy.mp3");
bgMusic.loop = true;

let isMuted = false;

function toggleMute() {
	isMuted = !isMuted;
	bgMusic.muted = isMuted;
	playerShootSound.muted = isMuted;
	enemyDieSound.muted = isMuted;
}

function drawPlayer(x, y) {
	const playerWidth = 50;
	const playerHeight = 50;

	ctx.save();
	let skew = 0;
	if (player.moving.right) skew = -0.2;
	else if (player.moving.left) skew = 0.2;

	ctx.transform(1, 0, skew, 1, x, y);
	ctx.drawImage(playerImage, 0, 0, playerWidth, playerHeight);

	if (playerHit) {
		ctx.fillStyle = "rgba(255, 192, 203, 0.5)";
		ctx.fillRect(0, 0, playerWidth, playerHeight);
	}
	ctx.restore();
}

function drawTextWithBackground(text, x, y, padding = 5) {
	const metrics = ctx.measureText(text);
	const width = metrics.width + 2 * padding;
	const height = 20 + 2 * padding;

	ctx.fillStyle = "black";
	ctx.fillRect(x - padding, y - 16 - padding, width, height);
	ctx.fillStyle = "white";
	ctx.fillText(text, x, y);
}

function drawEnemy(x, y) {
	const enemyWidth = 40;
	const enemyHeight = 40;
	ctx.drawImage(enemyImage, x, y, enemyWidth, enemyHeight);
}

function drawBullet(x, y) {
	const bulletWidth = 5;
	const bulletHeight = 10;
	ctx.drawImage(bulletImage, x, y, bulletWidth, bulletHeight);
}

let player = {
	x: 375,
	y: 525,
	speed: 7,
	bullets: [],
	lives: 3,
	moving: { right: false, left: false, up: false, down: false },
};
let enemies = [];
let score = 0;
let level = 1;
let boosterCount = 10;
let timeLeft = 60;
let playerHit = false;
let playerHitTimer = 0;
let gameState = "start";

document.addEventListener("keydown", function (e) {
	switch (e.key) {
		case "ArrowRight":
			player.moving.right = true;
			break;
		case "ArrowLeft":
			player.moving.left = true;
			break;
		case "ArrowUp":
			player.moving.up = true;
			break;
		case "ArrowDown":
			player.moving.down = true;
			break;
		case " ":
			player.bullets.push({ x: player.x + 22, y: player.y, speed: 5 });
			playerShootSound.currentTime = 0;
			playerShootSound.play();
			if (boosterCount > 0) {
				player.bullets.push({ x: player.x, y: player.y, speed: 5 });
				player.bullets.push({ x: player.x + 45, y: player.y, speed: 5 });
				boosterCount--;
			}
			break;
	}
});

document.addEventListener("keyup", function (e) {
	switch (e.key) {
		case "ArrowRight":
			player.moving.right = false;
			break;
		case "ArrowLeft":
			player.moving.left = false;
			break;
		case "ArrowUp":
			player.moving.up = false;
			break;
		case "ArrowDown":
			player.moving.down = false;
			break;
	}
});

function drawLives() {
	ctx.fillStyle = "white";
	ctx.font = "16px Courier New";
	for (let i = 0; i < player.lives; i++) {
		ctx.fillText("♥", canvas.width - 30 * (i + 1), 40);
	}
}

function drawStartScreen() {
	ctx.fillStyle = "#333";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.font = "48px Courier New";
	ctx.textAlign = "center";
	ctx.fillText("Start Game", canvas.width / 2, canvas.height / 2);
	ctx.font = "24px Courier New";
	ctx.fillStyle = "#D32F2F";
	ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 25, 200, 50);
	ctx.fillStyle = "white";
	ctx.fillText("Start", canvas.width / 2, canvas.height / 2);
	ctx.fillStyle = "gray";
	ctx.fillRect(canvas.width - 80, 10, 70, 30);
	ctx.fillStyle = "white";
	ctx.fillText(isMuted ? "Unmute" : "Mute", canvas.width - 70, 32);
}

canvas.addEventListener("click", function (event) {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	if (gameState === "start") {
		if (
			x > canvas.width / 2 - 100 &&
			x < canvas.width / 2 + 100 &&
			y > canvas.height / 2 - 25 &&
			y < canvas.height / 2 + 25
		) {
			gameState = "running";
			bgMusic.play();
			render();
		}
		if (x > canvas.width - 80 && x < canvas.width - 10 && y > 10 && y < 40) {
			toggleMute();
			render();
		}
	} else if (gameState === "gameover") {
		if (
			x > canvas.width / 2 - 100 &&
			x < canvas.width / 2 + 100 &&
			y > canvas.height / 2 + 50 &&
			y < canvas.height / 2 + 100
		) {
			resetGame();
			gameState = "start";
			render();
		}
	}
});

function spawnEnemy() {
	const x = Math.random() * (canvas.width - 40);
	enemies.push({ x: x, y: 0, speed: 1 + level * 0.5 });
}

function gameOverScreen() {
	gameState = "gameover";
	ctx.fillStyle = "#333";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.font = "48px Courier New";
	ctx.textAlign = "center";
	ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);
	ctx.font = "24px Courier New";
	ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
	ctx.fillStyle = "#D32F2F";
	ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 50, 200, 50);
	ctx.fillStyle = "white";
	ctx.fillText("Try Again", canvas.width / 2, canvas.height / 2 + 85);
	bgMusic.pause();
	bgMusic.currentTime = 0;
}

function resetGame() {
	gameState = "running";
	player = {
		x: 375,
		y: 525,
		speed: 7,
		bullets: [],
		lives: 3,
		moving: { right: false, left: false, up: false, down: false },
	};
	enemies = [];
	score = 0;
	level = 1;
	timeLeft = 60;
	playerHit = false;
	playerHitTimer = 0;
}

function checkCollisions() {
	for (let i = enemies.length - 1; i >= 0; i--) {
		let enemy = enemies[i];
		if (
			enemy.x < player.x + 50 &&
			enemy.x + 40 > player.x &&
			enemy.y < player.y + 50 &&
			enemy.y + 40 > player.y
		) {
			player.lives--;
			playerHit = true;
			playerHitTimer = 10;
			enemies.splice(i, 1);
			if (player.lives <= 0) {
				gameOverScreen();
				return;
			}
		}
		for (let j = player.bullets.length - 1; j >= 0; j--) {
			let bullet = player.bullets[j];
			if (
				bullet.x < enemy.x + 40 &&
				bullet.x + 5 > enemy.x &&
				bullet.y < enemy.y + 40 &&
				bullet.y + 10 > enemy.y
			) {
				enemyDieSound.play();
				score++;
				enemies.splice(i, 1);
				player.bullets.splice(j, 1);
				break;
			}
		}
	}
}

setInterval(() => {
	spawnEnemy();
}, 2000 / level);

let bgPosY1 = 0;
let bgPosY2 = -canvas.height;
const bgSpeed = 0.05;

function gameLoop() {
	if (gameState === "gameover") {
		return;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the moving background
	ctx.drawImage(bgImage, 0, bgPosY1, canvas.width, canvas.height);
	ctx.drawImage(bgImage, 0, bgPosY2, canvas.width, canvas.height);

	bgPosY1 += bgSpeed;
	bgPosY2 += bgSpeed;

	// Reset the background positions when they go out of the canvas
	if (bgPosY1 >= canvas.height) {
		bgPosY1 = -canvas.height;
	}
	if (bgPosY2 >= canvas.height) {
		bgPosY2 = -canvas.height;
	}

	ctx.font = "16px Courier New";
	ctx.textAlign = "start";
	if (player.moving.right && player.x + 50 < canvas.width)
		player.x += player.speed;
	if (player.moving.left && player.x > 0) player.x -= player.speed;
	if (player.moving.up && player.y > 0) player.y -= player.speed;
	if (player.moving.down && player.y + 50 < canvas.height)
		player.y += player.speed;
	for (let bullet of player.bullets) {
		bullet.y -= bullet.speed;
		drawBullet(bullet.x, bullet.y);
	}
	for (let enemy of enemies) {
		enemy.y += enemy.speed;
		drawEnemy(enemy.x, enemy.y);
	}
	drawPlayer(player.x, player.y);
	if (playerHitTimer > 0) {
		playerHitTimer--;
		if (playerHitTimer === 0) {
			playerHit = false;
		}
	}
	checkCollisions();
	drawTextWithBackground(`Score: ${score}`, 700, 20);
	drawTextWithBackground(`Level: ${level}`, 20, 20);
	drawTextWithBackground(`${timeLeft}s`, 150, 20);
	drawLives();
	requestAnimationFrame(gameLoop);
}

function render() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (gameState === "start") {
		drawStartScreen();
	} else if (gameState === "running") {
		gameLoop();
	} else if (gameState === "gameover") {
		gameOverScreen();
	}
}

render();

setInterval(() => {
	if (level < 100) {
		level++;
		timeLeft = 60;
	}
}, 60000);

setInterval(() => {
	if (timeLeft > 0) timeLeft--;
}, 1000);
