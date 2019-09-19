import utils from './utils';

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;


addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init();
});

function Star(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.shatterCount = 0;
    this.velocity = {
        x: utils.randomIntFromRange(-25, 25),
        y: 3
    };
}

Star.prototype.friction = 0.5;
Star.prototype.gravity = 1;

Star.prototype.draw = function () {
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.shadowColor = '#E3EAEF';
    c.shadowBlur = 20;
    c.fill();
    c.closePath();
    c.restore();
};

Star.prototype.update = function () {
    this.draw();

    if (this.y + this.radius + this.velocity.y >= canvas.height - groundHeight) {
        this.velocity.y = -this.velocity.y * this.friction;
        this.shatter();
    } else {
        this.velocity.y += this.gravity;
    }

    if (this.x + this.radius + this.velocity.x > canvas.width ||
        this.x - this.radius <= 0) {
        this.velocity.x = -this.velocity.x * this.friction;
        this.shatter();
    }
    this.y += this.velocity.y;
    this.x += this.velocity.x;
};

Star.prototype.shatter = function () {
    this.radius -= 3;
    for (let i = 0; i < 8; i += 1) {
        miniStars.push(new MiniStar(this.x, this.y, 3, 'red'));
    }
};


MiniStar.prototype.gravity = 0.1;
MiniStar.prototype.friction = 0.8;

function MiniStar(x, y, radius, color) {
    Star.call(this, x, y, radius, color);
    this.ttl = 100;
    this.opacity = 1;

    const initalYVelocity = utils.randomIntFromRange(-15, 15);
    const initialXVelocity = utils.randomIntFromRange(-8, 8);

    this.velocity = {
        y: initalYVelocity,
        x: initialXVelocity
    };
}

MiniStar.prototype.draw = function() {
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = `rgba(227, 234, 239, ${this.opacity})`;
    c.shadowColor = '#E3EAEF';
    c.shadowBlur = 20;
    c.fill();
    c.closePath();
    c.restore();
};

MiniStar.prototype.update = function () {
    this.draw();

    if (this.y + this.radius + this.velocity.y > canvas.height - groundHeight) {
        this.velocity.y = -this.velocity.y * this.friction;
    } else {
        this.velocity.y += this.gravity;
    }

    this.y += this.velocity.y;
    this.x += this.velocity.x;
    this.ttl -= 1;
    this.opacity -= (1 / this.ttl);
};


function createMountainRange(mountainAmount, height, color) {
    const mountainWidth = canvas.width / mountainAmount;
    for (let i = 0; i < mountainAmount; i += 1) {
        c.beginPath();
        c.moveTo(i * mountainWidth, canvas.height);
        c.lineTo(i * mountainWidth + mountainWidth + 350, canvas.height);
        c.lineTo(i * mountainWidth + mountainWidth / 2, canvas.height - height);
        c.lineTo(i * mountainWidth - 350, canvas.height);
        c.fillStyle = color;
        c.fill();
        c.closePath();
    }
}

function createGround() {
    c.fillStyle = '#182028';
    c.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}


// Implementation

const backgroundGradient = c.createLinearGradient(0, 0, 0, canvas.height);
backgroundGradient.addColorStop(0, '#171e26');
backgroundGradient.addColorStop(1, '#3f586b');

let stars;
let miniStars;
let backgroundStars;
let frameTick = 0;
let randomSpawnRate = 75;
let groundHeight = canvas.height * 0.10;

function init() {
    stars = [];
    miniStars = [];
    backgroundStars = [];

    for (let i = 0; i < 150; i += 1) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 3;
        backgroundStars.push(new Star(x, y, radius, 'white'));
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    c.fillStyle = backgroundGradient;
    c.fillRect(0, 0, canvas.width, canvas.height);

    backgroundStars.forEach((bgStar, index) => {
        bgStar.draw();
        bgStar.x += 0.5;
        bgStar.y -= 0.1;

        if (bgStar.x > canvas.width) {
            backgroundStars.splice(index, 1);
            const x = -5;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 3;
            const newStar = new Star(x, y, radius, 'white');
            backgroundStars.push(newStar);
        }
    });

    createMountainRange(1, canvas.height * 0.6, '#384551');
    createMountainRange(2, canvas.height * 0.5, '#2B3843');
    createMountainRange(3, canvas.height * 0.3, '#26333E');

    createGround();

    stars.forEach((star, index) => {
        star.update();
        if (star.radius < 0) {
            stars.splice(index, 1);
        }
    });

    miniStars.forEach((miniStar, index) => {
        miniStar.update();
        if (miniStar.ttl < 0) {
            miniStars.splice(index, 1);
        }
    });

    frameTick += 1;

    if (frameTick % randomSpawnRate === 0) {
        const radius = utils.randomIntFromRange(6, 10);
        const x = Math.max(radius, Math.random() * canvas.width - radius);
        stars.push(new Star(x, -100, radius, 'white'));
        randomSpawnRate = utils.randomIntFromRange(200, 400);
    }
}

init();
animate();
