/*THE CANVAS*/
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let particleArray; //particles are stored here

/* POSITION OF THE MOUSE */
let mouse = {
    x: null,
    y: null,
    radius: (canvas.height / 80) * (canvas.width / 80) //this is going to be used to form a circle around the pointer
};

window.addEventListener("mousemove",
    function(event) {
        mouse.x = event.x; //updates x with the value of where the pointer is on the canvas
        mouse.y = event.y; //updates y with the value of where the pointer is on the canvas
    });

/*CREATE PARTICLE*/
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x; //x value of the particle
        this.y = y; //y value of the particle
        this.directionX = directionX; //x direction
        this.directionY = directionY; //y direction
        this.size = size;
        this.color = color;
    }
    draw() { //draws the individual particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); //drawing a circle
        ctx.fillStyle = this.color; //color that we are going to fill the circle with
        ctx.fill(); //filling the circle
    }
    update() { //updates when the particle bounces against the wall off the screen
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
            //this.size *= 0.9 ;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
            //this.size *= 1.03 ;
        }

        /*SPACE AROUND THE CURSOR*/
        let dx = mouse.x - this.x; //x-difference between mouse pointer and particle
        let dy = mouse.y - this.y; //y-difference between mouse pointer and particle
        let distance = Math.sqrt(dx * dx + dy * dy); //calculating the distance around the cursor (dx^2 + dy^2)^(1/2) from physics

        /*PARTICLE BOUNCING OFF THE EDGE OF THE SCREEN*/
        if (distance < mouse.radius + this.size) { //if the distance is less than the radius plus the size of the particle
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) { //if the x-mouse pos  is less than the x-particle pos AND x-particle pos is less canvas width -the particle size
                this.x += 1.5; //bounce!!
                //this.size *= 1.01;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 1.5;
                //this.size *= 1.02;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                this.y += 1.5;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 1.5;
            }
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

/*THE CONNECTING LINE BETWEEN PARTICLES*/
function connect() { //this is the connecting line between particles
    let opacityValue = 1;
    for (let a = 0; a < particleArray.length; a++) {
        for (let b = 0; b < particleArray.length; b++) {
            let distance = ((particleArray[a].x - particleArray[b].x) *
                    (particleArray[a].x - particleArray[b].x)) //difference between x-values of two particles: dx^2
                +
                ((particleArray[a].y - particleArray[b].y) *
                    (particleArray[a].y - particleArray[b].y)); //difference between x-values of two particles: dy^2

            if (distance < (canvas.width / 9) * (canvas.height / 5)) {
                opacityValue = 1 - (distance / 2000) + 0.5;
                let r = 120;
                ctx.strokeStyle = "rgba(40, 120, 0," + opacityValue + ")"; //color of connecting line
                //RGB (5, 56, 107
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particleArray[a].x, particleArray[a].y);
                ctx.lineTo(particleArray[b].x, particleArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function init() {
    particleArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 6500;
    console.log(numberOfParticles);
    for (let i = 0; i < numberOfParticles * 1.5; i++) {
        let size = (Math.random() * 5) + 2;

        let x = (Math.random() *
            ((innerWidth - size * 2) - (size * 2)) + size * 2);

        let y = (Math.random() *
            ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 2) - 0.5;
        let directionY = (Math.random() * 2) - 0.5;
        let color = "#187246"; //color of particles

        particleArray.push(
            new Particle(x, y, directionX, directionY, size, color)
        );
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
    }
    connect();
}


window.addEventListener("resize",
    function() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = ((canvas.height / 80) * (canvas.width / 80));
        particleArray[10].color = "black";
        console.log(particleArray[1].color);
        init();
    });

window.addEventListener("mouseout",
    function() {
        mouse.x = undefined;
        mouse.y = undefined;

    });

init();
animate();
start();