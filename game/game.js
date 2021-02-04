/* 
 *Platform Game
 */

/* Small Level */
let simpleLevelPlan = 
`......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;                                                        

//"." an empty space
//"#" solid wall
//"o" coins 
//"=" a block of lava that moves back and forth horizontally
//"+" lava
//"@" player
//"|" vertically moving blobs
//"v" driping lava
//"M" monster(Exercise 16.3)


/* Reading A level */
class Level{                                                                    //This class stores a level object
    constructor(plan){                                                          //every class has a constructor according to my current understanding
        let rows = plan.trim().split("\n").map(l => [...l]);                    //trim the white space and split the arrays when there is a new line, then put every character in an array, then holld all those arrays on rows array
        this.height = rows.length;                                              //the height of the array will be rows length since it has all the rows of the arrays
        this.width = rows[0].length;                                            //the width is the length of the first element of rows, which s an array
        this.startActors = [];                                                  //array of objects (for moving elements)
        
        this.rows = rows.map((row, y) => {                                      //mapping rows to row which is an array in the array rows, and y is the index: this will tell the y cordinate of the character in the polan
            return row.map((ch, x) => {                                         //mapping row to the array that it contains and x is the the index: this will tell the x cordinate of the character in the plan
                let type = levelChars[ch];                                      //maps background elements to strings and actor characters to classes
                if(typeof type == "string"){ 
                    return type;
                }                                                               //if the type is an actor class..
                this.startActors.push(
                type.create(new Vec(x, y), ch));                                //the actor class static create method creates a vector
                return "empty";                                                 //and returns empty for this background square
            });
        });
    }
}

/* Tracking the state of a running game */
class State{                                                                    //this is a persistent data structure, updating the game state creates a new state leaving the old one intact
    constructor(level, actors, status){                                         
        this.level = level;                                                     //levels change in all games
        this.actors = actors;                                                   //actor objects represent the state of every moving object in the game
        this.status = status;                                                   //status will switch to "lost" or "won" when the game has ended
    }
    static start(level){                                                        //when the game starts....
        return new State(level, level.startActors, "playing");                  //create a new state, status == "playing"
    }
    
    get player(){                                                               //getter
        return this.actors.find(a => a.type == "player");                       //returns the player object
    }
}

/* Used for two-dimensional values, position and size of actors */
class Vec{
    constructor(x, y){
        this.x = x; this.y = y;
    }
    plus(other){                                                                //position: this method is for movement
        return new Vec(this.x + other.x, this.y + other.y);                     //changing the cordinates
    }
    times(factor){                                                              //size: this method scales a vector by a given number..
        return new Vec(this.x * factor, this.y * factor);                       //..factor
    }
}

/* Actor get their own classes since their behaviors vary from each other*/
class Player{
    constructor(pos, speed){
        this.pos = pos;                                                         //positions
        this.speed = speed;                                                     //simulates momentum and gravity
    }
    get type(){                                                                 //getter method
        return "player";                                                        //type of actor
    }
    
    static create(pos){                                                         //static create method
        return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));           //creating a new instance of actor player at a new position
        
    }
}

Player.prototype.size = new Vec(0.8, 1.5);                                      //the size property is the same in all instances of player, so its stored in the prototype rather than at the instance.

class Lava{
    constructor(pos, speed, reset){                                             //position, speed, and reverting to the original position of actor "lava"
        this.pos = pos;                                                         //position
        this.speed = speed;                                                     //speed, simulating gravity
        this.reset = reset;                                                     //reverting to the original position
    }
    
    get type(){                                                                 //getter method for type of actor
        return "lava";                                                          //actor lava
    }
    
    static create(pos, ch){
        if(ch == "="){                                                          //this lava goes back and forth horizontally
            return new Lava(pos, new Vec(2, 0));                                //the only change in on the x-axis 
        }
        else if(ch == "|"){                                                     //this lava goes back and forth vertically
            return new Lava(pos, new Vec(0, 2));                                //the only change in cordinates is on the y
        }
        else if(ch == "v"){                                                     //this lava drips
            return new Lava(pos, new Vec(0, 3), pos);                           //dripping is a horizontal movement
        }
    }
}


/*Exercise 16.3: Adding a monster into the game*/
/*First Try*/
//class Monster{
//    constructor(pos, speed, reset){                                             //diet of this class: position, speed and reset
//        this.pos = pos;                                                         //position
//        this.speed = speed;                                                     //speed
//        this.reset = reset;                                                     //reset to the initial position
//    }
//    get type(){return "monster";}                                               //getting the type of our actor
//    
//    static create(pos, ch){
//        return new Monster(pos.plus(new Vec(0.5, 0)), new Vec(0, 0));           //spawn the monster
//    }
//}
//
//Monster.prototype.size = new Vec(1, 1);
//
//Monster.prototype.update = function(time, state){
//    let newPos = this.pos.plus(monsterSpeed.times(time));
//    if(!state.level.touches(newPos, this.size, "wall")){
//        return new Monster(newPos, monsterSpeed, this.reset);
//    }
//    else if(this.reset){
//        return new Monster(this.reset, monsterSpeed, this.reset);
//    }
//    else{
//        return new Monster(this.pos, monsterSpeed.times(-1));
//    }
//};
/*Keeping Score*/
let score = document.getElementById("score");                                   //binding variable score to the element score
score.style.background = "rgb(52, 166, 251)";                                   //programmtically setting score element background to be the same as the game's
score.style.maxWidth = "435px";                                                 //setting the maximum width
score.style.borderRadius = "5px";                                               //setting the border radius

/*From the solutions: and my additions (score and lives)*/
const monsterSpeed = 4;                                                         //the speed of themonster
let monstersKilled = 0;                                                         //this is no longer needed
let coins = 0;                                                                  //keeping the scoreof coins



class Monster{                                                                  //class monster
    constructor(pos){                                                           //diet of this class only the position as an argument
        this.pos = pos;                                                         //binding variables
    }
    get type(){                                                                 //getter for the type
        return "monster";                                                       //returns the type of actor
    }
    
    static create(pos){                                                         //this method can be called directly without instantiating the class
        return new Monster(pos.plus(new Vec(0, -1)));                           //returns the monster object and its position
    }
        
    update(time, state){                                                        //the update added directly, not thru the prototype: makes things more clear
        let player = state.player;                                              //checking the state of the player(dead or alive)
        let speed = (player.pos.x < this.pos.x ? -1 : 1) * time * monsterSpeed; //setting the speed including time so that it will be constantly updated
        let newPos = new Vec(this.pos.x + speed, this.pos.y);                   //another variable on updating the speed of the monster object
        if(state.level.touches(newPos, this.size, "wall")) return this;         //if the monster touches a wall it must stop (this stops the monster from going thru walls)
        else return new Monster(newPos);                                        //if its not a wall aluta continua lol
    }
    
    collide(state){                                                             //calling the collide method 
        let player = state.player;                                              //binding the variable player to the state of the player
        if(player.pos.y + player.size.y < this.pos.y + 0.5){                    //if the player hits the monster on the head thru jumping
            lives++;                                                            //get an additional life everytime you kill a monster
            let filtered = state.actors.filter(a => a != this);                 //fillter the monster out of the game
            return new State(state.level, filtered, state.status);              //return a state without the recently confronted monster 
            
        }
        else{                                                                   //otherwise...
            coins = 0;                                                          //the player loses all the collected coins
            console.log("Moster oblitarated you");                              //log this on the console (reminds me of gta online)
            return new State(state.level, state.actors, "lost");                //the player loses that round of the game
        }
    }
}

Monster.prototype.size = new Vec(1.2, 2);                                       //the size of the monster
Lava.prototype.size = new Vec(1, 1);                                            //this size of actor "lava" is stored in its prototype too

/* Reward System */
class Coin{                                                                     //actor coin class
    constructor(pos, basePos, wobble){                                          //the diet of this class: position, base position, wobble effect factor
        this.pos = pos;                                                         //assigning variables
        this.basePos = basePos;                                                 //...
        this.wobble = wobble;                                                   //...
    }
    
    get type(){                                                                 //getter: geting the type of the actor
        return "coin";                                                          //returns the type of the actor
    }
    
    static create(pos){                                                         //creating the coin and its position
        let basePos = pos.plus(new Vec(0.2, 0.1));                              //variable to be included
        return new Coin(basePos, basePos, Math.random() * Math.PI * 2);         //return coin in its wobbling glory
    }
}

Coin.prototype.size = new Vec(0.6, 1.6);                                        //the size of all actors is stored in their prototypes.

const levelChars = {
    "." : "empty", "#": "wall", "+" : "lava",                                   //empty space, solid wall, lava that doesnt move
    "@" : Player, "o" : Coin,                                                   //player and coin they both moving actors
    "=" : Lava, "|" : Lava, "v" : Lava,                                         //different kinds of moving lava
    "M" : Monster                                                               //Chapter 16.3: Creating a monster
};



/* Lets see if it works */
let simpleLevel = new Level(simpleLevelPlan);
//console.log(`${simpleLevel.width} by ${simpleLevel.height}`);

/*DRAWING: creating a display object*/
function elt(name, attrs, ...children){                                         //helper function for creating elements and giving them attributes and child nodes
    let dom = document.createElement(name);                                     //creating an element
    for(let attr of Object.keys(attrs)){                                        //giving the element atrributes
        dom.setAttribute(attr, attrs[attr]);
    }
    for(let child of children){
        dom.appendChild(child);                                                 //appending each child
    }
    return dom;                                                                 //return the DOM
}

class DOMDisplay{                                                               //creating the display object
    constructor(parent, level){                                                 //diet of this class is the parent and the level
        this.dom = elt("div", {class: "game"}, drawGrid(level));                //binding class to the created div with class name game and child drawGrid
        this.actorLayer = null;                                                 //actor layer array is empty for now
        parent.appendChild(this.dom);                                           //appending the child of argument parent
    }
    clear(){
        this.dom.remove();                                                      //think of this as rectClear
    }
}

var scale = 20;                                                                 //enlarging the game.

function drawGrid(level){                                                       //drawing the grid, which never changes
    return elt("table", {                                                       //creating element 'table' using the helper function elt
        class: "background",                                                    //class of the element
        style: `width: ${level.width * scale}px`                                //width dimension of the element
    },
    ...level.rows.map(row =>                                                    //mapping each row to a table row 'tr' element
        elt("tr", {style: `height: ${scale}px`},
        ...row.map(type => elt("td", {class: type})))));                        //each tr element has td element forming the image that we want
}

function drawActors(actors){                                                    //drawing the actors which change everytime the display is updated with a given state
    return elt("div", {}, ...actors.map(actor => {                              //return a div with no children and map the children to..
        let rect = elt("div", {class: `actor ${actor.type}`});                  //divs each with class atributes name after their types
        rect.style.width = `${actor.size.x * scale}px`;                         //programmaticaly styling setting the width (usually CSS)
        rect.style.height = `${actor.size.y * scale}px`;                        //setting the height
        rect.style.left = `${actor.pos.x * scale}px`;                           //..
        rect.style.top = `${actor.pos.y * scale}px`;                            //.. in all these stylings we are using the factor 'scale' to enlarge the cast of actors
        return rect;                                                            //return the modified rect
    }));
}

DOMDisplay.prototype.syncState = function(state){                               //adding method syncState to class display
    if(this.actorLayer) this.actorLayer.remove();                               //remember 'clearRect'
    this.actorLayer = drawActors(state.actors);                                 //then redraw the actors in a new state
    this.dom.appendChild(this.actorLayer);                                      //close the layer
    this.dom.className = `game ${state.status}`;                                //setting the class name of the actor to the state("won" or "lost") this is so that we can control this class thru CSS
    this.scrollPlayerIntoView(state);                                           //keep the player close to the center
};

/*Keeps the player on the viewport always*/
DOMDisplay.prototype.scrollPlayerIntoView = function(state){                    //the actual method that keeps the player close to the middle of the screen
    let width = this.dom.clientWidth;                                           //clientWidth, with of the element binded to 'dom'
    let height = this.dom.clientHeight;                                         //height of the element binded to 'dom'
    let margin = width/3;
    
    //the viewport
    let left = this.dom.scrollLeft, right = left + width;
    let top = this.dom.scrollTop, bottom = top + height;
    
    let player = state.player;
    let center = player.pos.plus(player.size.times(0.5)).times(scale);
    
    if(center.x < left + margin){
        this.dom.scrollLeft = center.x - margin;
    }
    else if(center.x > right - margin){
        this.dom.scrollLeft = center.x + margin - width;
    }
    
    if(center.y < top + margin){
        this.dom.scrollTop = center.y - margin;
    }
    else if(center.y > bottom - margin){
        this.dom.scrollTop = center.y + margin - height;
    }
};

//let simpleLevel = new Level(simpleLevelPlan);
//            let display = new DOMDisplay(document.body, simpleLevel);
//            display.syncState(State.start(simpleLevel));

/*Motion and Collision*/
Level.prototype.touches = function(pos, size, type){
    var xStart = Math.floor(pos.x);
    var xEnd = Math.ceil(pos.x + size.x);
    var yStart = Math.floor(pos.y);
    var yEnd = Math.ceil(pos.y + size.y);
    
    for(var y = yStart; y < yEnd; y++){
        for(var x = xStart; x < xEnd; x++){
            let isOutside = x < 0 || x >= this.width ||
                            y < 0 || y >= this.height;
            let here = isOutside ? "wall" : this.rows[y][x];                    //row instead of rows: caused an error
            if(here == type) return true;
        }
    }
    return false;
    
};

/* The State update method uses 'touches()' to *
 * know when the player is touching lava */
State.prototype.update = function(time, keys){
    let actors = this.actors.map(actor => actor.update(time, this, keys));
    let newState = new State(this.level, actors, this.status);
    
    //keeping score
    score.innerText = `Level: ${lev} \nLives: ${lives}\n    Coins ${coins}`;
    
    if(newState.status != "playing") return newState;
    
    let player = newState.player;
    if(this.level.touches(player.pos, player.size, "lava")){
        console.log("lost");
        coins = 0;
        monstersKilled = 0;
        return new State(this.level, actors, "lost");
    }
    
    //chapter 16.3: exercise
    //let monster = newState.monster;
    /*First attempt*/    
//    if(this.level.touches(player.pos, player.size, "monster")){                 //when the player touches the monster
//        console.log("Touched a monster");
//        return new State(this.level, actors, "lost");
//    }
    
    
    for(let actor of actors){
        if(actor != player && overlap(actor, player)){
            newState = actor.collide(newState);
        }
    }
    return newState;
};

function overlap(actor1, actor2){
    return actor1.pos.x + actor1.size.x > actor2.pos.x &&
            actor1.pos.x < actor2.pos.x + actor2.size.x &&
            actor1.pos.y + actor1.size.y > actor2.pos.y &&
            actor1.pos.y < actor2.pos.y + actor2.size.y;
}

Lava.prototype.collide = function(state){
    coins = 0;
    monstersKilled = 0;
    return new State(state.level, state.actors, "lost");
};

Coin.prototype.collide = function (state){
    coins++;
    let filtered = state.actors.filter(a => a != this);
    let status = state.status;
    if(!filtered.some(a => a.type == "coin")) status = "won";
    return new State(state.level, filtered, status);
};

/*Actor Updates*/
Lava.prototype.update = function(time, state){
    let newPos = this.pos.plus(this.speed.times(time));
    if(!state.level.touches(newPos, this.size, "wall")){
        return new Lava(newPos, this.speed, this.reset);
    }
    else if(this.reset){
        return new Lava(this.reset, this.speed, this.reset);
    }
    else{
        return new Lava(this.pos, this.speed.times(-1));
    }
};

/*Wobbling Coins*/
const wobbleSpeed = 8, wobbleDist = 0.07;

Coin.prototype.update = function(time){
    let wobble = this.wobble + time * wobbleSpeed;
    let wobblePos = Math.sin(wobble) * wobbleDist;
    return new Coin(this.basePos.plus(new Vec(0, wobblePos)),
                    this.basePos, wobble);
};

const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;
let dilated = 200000000;

let p = 1000;
let press = true;

Player.prototype.update = function(time, state, keys){
    let xSpeed = 0;
    let ySpeed = this.speed.y + time * gravity;
    if(keys.ArrowLeft) xSpeed -= playerXSpeed;
    if(keys.ArrowRight) xSpeed += playerXSpeed;
    if(keys.ArrowDown) ySpeed -= jumpSpeed/23.4;                                //cheat: Thrusters
    /*Exercise 16.2: Making the game pausable*/
    if(keys.Escape){                                                            //if Escape is pressed
        press = !press;                                                         //not gate
        time = dilated;
        if(press) {                                                             //if press is true, 
            p = Infinity;                                                       //p = is Infinity: This will pause the game
            console.log("Paused");
        }
        time = dilated;
        if(!press) p = 1000;                                                    //if press is fasle, p = 1000: This will resume the game
    }
    /*End of Exercize 16*/
    
    let pos = this.pos;
    let movedX = pos.plus(new Vec(xSpeed * time, 0));
    if(!state.level.touches(movedX, this.size, "wall")){
        pos = movedX;
    }
    
    let movedY = pos.plus(new Vec(0, ySpeed * time));
    if(!state.level.touches(movedY, this.size, "wall")){
        pos = movedY;
    }
    else if(keys.ArrowUp && ySpeed > 0){
        ySpeed = -jumpSpeed;
    }
    else{
        ySpeed = 0;
    }
    return new Player(pos, new Vec(xSpeed, ySpeed));
};

/*Listens to the state of Arrow Keys*/
function trackKeys(keys){
    let down = Object.create(null);
    function track(event){
        if(keys.includes(event.key)){
            down[event.key] = event.type == "keydown";
            event.preventDefault();
        }
    }
    window.addEventListener("keydown", track);
    window.addEventListener("keyup", track);
    return down;
}

const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp",
    "ArrowDown","Escape"]);

/*Function for Animation*/
function runAnimation(frameFunc){
    let lastTime = null;
    function frame(time){
        if(lastTime != null){
            let timeStep = Math.min(time - lastTime, 100)/p;                    //value of p changes when Escape is pressed(Exercise 16.2)
            if(frameFunc(timeStep) === false) return;                           //animation stops if the value of frame func is false.
        }
        lastTime = time;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}


/*Use async and promises*/
function runLevel(level, Display){
    let display = new Display(document.body, level);
    let state = State.start(level);
    let ending = 1;
    
    return new Promise(resolve => {
        runAnimation(time => {
            state = state.update(time, arrowKeys);
            display.syncState(state);
            if(state.status == "playing"){
                return true;
            }
            else if(ending > 0){
                ending -= time;
                return true;
            }
            else{
                display.clear();
                resolve(state.status);
                return false;
            }
        });
    });
}

/*Game over: Exercise 16.1*/
let lives = 3;
let lev = 0;
async function runGame(plans, Display){
    for(let level = 0; level < plans.length;){
        lev = level + 1;
        console.log(`Lives: ${lives}, Level ${level + 1}\n\n`);                 //tracks lives and level
        
        let status = await runLevel(new Level(plans[level]), Display);
        
        //Exersize 16.1: Game Over
        if(status === "lost"){
            lives--;
            if(lives <= 0){
                console.log("GAME OVER!!");
                level = 0;
                lives = 3;
            }
        }
        //end of excersize
        
        if(status === "won"){
            console.log(`Congrats you have completed level ${level + 1}`);
            level++;
        };
    }
}

/*Canvas version of the platform game*/
class CanvasDisplay{
    constructor(parent, level){                                                 //every class has this func, the arguments are the diet of the class
        this.canvas = document.createElement("canvas");                         //binding element canvas to this
        this.canvas.width = Math.min(600, level.width * scale);                 //setting the width of the canvas
        this.canvas.height = Math.min(450, level.height * scale);               //setting the height of the canvas
        parent.appendChild(this.canvas);
        
        this.cx = this.canvas.getContext("2d");
        console.log(this.canvas.height, level.height * scale);
//        if(level.height * scale > 450){
//            this.canvas.height = level.height * scale;
//            console.log(this.canvas.height);  
        
        this.flipPlayer = false;                                                //makes the player change direction depending on the key pressed
        
        this.viewport = {                                                       //the thing on which we are going to be viewing the game on (canvas)
            left: 0,                                                            //position attribute
            top: 0,                                                             //position attribute
            width: this.canvas.width / scale,                                   //dimension attribute
            height: this.canvas.height / scale                                  //dimension attribute
        };
    }
    clear(){                                                                    //we have to redraw the scen all the time when working with the canvas
        this.canvas.remove();                                                   //clearing the canvas
    }
}

CanvasDisplay.prototype.syncState = function(state){                            //This method computes a new viewport and then draw the game scene at the apropriate position
    this.updateViewport(state);                                                 //calls this function to update the vieport
    this.clearDisplay(state.status);                                            //this function clears anything that is on the screen                                                                                
    this.drawBackground(state.level);                                           //this one draws the background
    this.drawActors(state.actors);                                              //drws the player (and other actors: such as lava or coins)
                                                                                
};

CanvasDisplay.prototype.updateViewport = function(state){                       //methods that redraws the background on the canvas
    let view = this.viewport, margin = view.width / 3;
    let player = state.player;                                                  //our player
    let center = player.pos.plus(player.size.times(0.5));                       //the player must always be in the center
    
    if(center.x < view.left + margin){                                          //horizontal centering
        view.left = Math.max(center.x - margin, 0);
    }
    else if(center.x > view.left + view.width - margin){
        view.left = Math.min(center.x + margin - view.width,
                             state.level.width - view.width);
    }
    
    if(center.y < view.top + margin){                                           //vertical centering
        view.top = Math.max(center.y - margin, 0);                              //view.top value will not be less than zero, the lower bound is 0
    }
    else if(center.y > view.top + view.height - margin){
        view.top = Math.min(center.y + margin - view.height,
                            state.level.height - view.height);                  //upper bound is the height of the level
    }
};

/*Brighter Color: game = won, Darker Color: game = lost*/
CanvasDisplay.prototype.clearDisplay = function(status){
    if(status === "won"){                                                       //when the game is won brighten up the display
        this.cx.fillStyle = "rgb(68, 191, 255)";
    }
    else if(status === "lost"){                                                 //whne the game is lost dull it up a little
        this.cx.fillStyle = "rgb(44, 136, 214)";
    }
    else{                                                                       //this is when the status is "playing"
        this.cx.fillStyle = "rgb(54, 166, 251)";
    }
    this.cx.fillRect(0, 0, this.canvas.width,this.canvas.height);
};

/*Drawing the back ground using sprites*/
let otherSprites = document.createElement("img");
otherSprites.src = "img/sprites.png";

CanvasDisplay.prototype.drawBackground = function(level){                       //mehtod for drawing the background
    let {left, top, width, height} = this.viewport;                             //destructuring, viewport objects;
    let xStart = Math.floor(left);
    let xEnd = Math.ceil(left + width);
    let yStart = Math.floor(top);
    let yEnd = Math.ceil(top + height);
    
    for(let y = yStart; y < yEnd; y++){
        for(let x = xStart; x < xEnd; x++){
            let tile = level.rows[y][x];
            if(tile === "empty") continue;
            
            let screenX = (x - left) * scale;
            //bug: let screenY = (y + top) * scale;                             a bug that makes the player float a discernable amount above the floor
            let screenY = (y - top) * scale;                                    
            let tileX = tile === "lava" ? scale : 0;
            this.cx.drawImage(otherSprites, tileX, 0, scale, scale,
                                    screenX, screenY, scale, scale);
        }
    }
};

/*Function for changing the direction of the player*/
function flipHorizontally(context, around){
    context.translate(around, 0);
    context.scale(-1, 1);
    context.translate(-around, 0);
}

/*Drawing the player*/
let playerSprites = document.createElement("img");
playerSprites.src = "img/player.png";
const playerXOverlap = 4;

CanvasDisplay.prototype.drawPlayer = function(player, x, y, width, height){
    width += playerXOverlap * 2;
    x -= playerXOverlap;
    if(player.speed.x !== 0){
        this.flipPlayer = player.speed.x < 0;
    }
    
    let tile = 8;
    if(player.speed.y !== 0){
        tile = 9;
    }
    else if(player.speed.x !== 0){
        tile = Math.floor(Date.now() / 60) % 8;
    }
    
    this.cx.save();
    if(this.flipPlayer){
        flipHorizontally(this.cx, x + width / 2);
    }
    let tileX = tile * width;
    this.cx.drawImage(playerSprites, tileX, 0, width, height,
                                         x, y, width, height);
    this.cx.restore();
};

/*Draws all actors it also calls method drawPlayer to draw the player*/
CanvasDisplay.prototype.drawActors = function(actors){
    for(let actor of actors){
        let width = actor.size.x * scale;
        let height = actor.size.y * scale;
        let x = (actor.pos.x - this.viewport.left) * scale;
        let y = (actor.pos.y - this.viewport.top) * scale;
        if(actor.type === "player"){
            this.drawPlayer(actor, x, y, width, height);
        }
        else{
            let tileX = (actor.type === "coin" ? 2 : 1) * scale;
            this.cx.drawImage(otherSprites, tileX, 0, width, height,
                                              x,   y, width, height);
        }
    }
};