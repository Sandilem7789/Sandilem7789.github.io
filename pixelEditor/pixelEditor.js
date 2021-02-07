/*Pixel Editor*/
class Picture{                                                                  //class picture..
    constructor(width, height, pixels){                                         //is an object that stores width height and pixels
        this.width = width;                                                     //width of the picture
        this.height = height;                                                   //height of the picture
        this.pixels = pixels;                                                   //array of pixels row by row
    }
    static empty(width, height, color){
        let pixels = new Array(width * height).fill(color);                     //the pixels are stored in an array row by row from top to bottom like, think of a matrix
        return new Picture(width, height, pixels);
    }
    pixel(x, y){                                                                //position of the pixel on the canvas
        return this.pixels[x + y * this.width];                                 //position in the array
    }
    draw(pixels){                                                               //this method updates a bunch of pixels at a time: it expects an updated object with x, y, and color properties to draw a new picture
        let copy = this.pixels.slice();                                         //slice without arguments is used to copy the entire pixels array
        for(let {x, y, color} of pixels){                                       //the slicing starts at 0 of the pixels array and ends at the aarays length
            copy[x + y * this.width] = color;                                   //color of the pixel
        }
        return new Picture(this.width, this.height, copy);                      //copying the picture
    }
}

function updateState(state, action){                                            //this function is for updating a state, the action argument is for the action(function) that must implemented. 
    return Object.assign({}, state, action);
}

function elt(type, props, ...children){                                         //this function is for creating html programitacally with ease
    let dom = document.createElement(type);                                     //the argument 'type' goes here.
    if(props) Object.assign(dom, props);                                        //props: Properties, these are functions that will be associate with the company at hand
    for(let child of children){                                                 //the three dot before the argument "children" means that there may be many children, to the functtion
        if(typeof child !== "string") dom.appendChild(child);                   
        else dom.appendChild(document.createTextNode(child));                   
    }
    //console.log(dom);
    return dom;
}


/*The Canvas*/
var scale = 10;                                                               //size of the pixel(10 x 10)

class PictureCanvas{
    constructor(picture, pointerDown){
        this.dom = elt("canvas", {                                              //creating the canvas element using the 'elt' function
            onmousedown: event => this.mouse(event, pointerDown),               //when the pointer device is a mouse
            ontouchstart: event => this.touch(event, pointerDown)               //when the pointer device is a touchscreen
        });
        this.syncState(picture);
    }
    syncState(picture){
        if(this.picture === picture) return;
        if(this.picture !== undefined){ 
           //console.log("Picture.pixels\n", picture.pixels);
           //console.log("This.Picture.pixels\n", this.picture.pixels);
        };
        this.picture = picture;
        drawPicture(this.picture, this.dom, scale);
    }
}

/*Function for Drawing the Picture*/
function drawPicture(picture, canvas, scale){
    canvas.width = picture.width * scale;
    canvas.height = picture.height * scale;
    let cx = canvas.getContext("2d");
    for(let y = 0; y < picture.height; y++){
        for(let x = 0; x < picture.width; x++){
            cx.fillStyle = picture.pixel(x, y);
            cx.fillRect(x * scale, y * scale, scale, scale);
        }
    }
}

PictureCanvas.prototype.mouse = function(downEvent, onDown){                    //when the pointer device is a mouse
    if(downEvent.button !== 0) return;
    let pos = pointerPosition(downEvent, this.dom);
    let onMove = onDown(pos);
    if(!onMove) return;
    let move = moveEvent => {
        if(moveEvent.buttons == 0){
            this.dom.removeEventListener("mousemove", move);
        }
        else{
            let newPos = pointerPosition(moveEvent, this.dom);
            pos = newPos;
            onMove(newPos);
        }
    };
    this.dom.addEventListener("mousemove", move);
};

function pointerPosition(pos, domNode){
    let rect = domNode.getBoundingClientRect();
    return {x: Math.floor((pos.clientX - rect.left) / scale),
            y: Math.floor((pos.clientY - rect.top) / scale)};
}

/*To prevent panning on a touchstart event*/
PictureCanvas.prototype.touch = function(startEvent, onDown){                   //when the pointer device is fingure(touch screen)
    let pos = pointerPosition(startEvent.touches[0], this.dom);
    let onMove = onDown(pos);
    startEvent.preventDefault();
    if(onMove) return;
    let move = moveEvent => {
        let newPos = pointerPosition(moveEvent.touches[0], this.dom);
        if(newPos.x == pos.x && newPos.y == pos.y) return;
        pos = newPos;
        onMove(newPos);
    };
    let end = () => {
        this.dom.removeEventListener("touchmove", move);
        this.dom.removeEventListener("touchmove", end);
    };
    this.dom.addEventListener("touchmove", move);
    this.dom.addEventListener("touchmove", end);
};                                                                              //for touch event 'clientX' and 'clientY' are not directly available on the event object

/*The Application*/
class PixelEditor{                                                              //the main component of the application: is a shell around the canvas with a set of tools on it
    constructor(state, config){
        let {tools, controls, dispatch} = config;                               //argument config must be an objet
        this.state = state;
        
        this.canvas = new PictureCanvas(state.picture, pos => {                 //pos: ponter handler, calls the aproprietly with the apropriate arguments
            let tool = tools[this.state.tool];                                  //all tools are stored in an array, so that they are updated when the state changes
            let onMove = tool(pos, this.state, dispatch);
            if(onMove) return pos => onMove(pos, this.state, dispatch);
        });
        this.controls = controls.map(
                Control => new Control(state, config));
        this.dom = elt("div", {
        //ctrl + z and shortcuts: exercize 19.1
            tabIndex: 0,
            onkeydown: event => this.keyDown(event, config)
        }, this.canvas.dom, elt("br"),
                 ...this.controls.reduce(                                       //this call introduce spaces between the DOM elements so that..
                        (a, c) => a.concat(" ", c.dom), []));                   //they dont look pressed together
    }
    //ctrl + Z and tool shortcuts
    keyDown(event, config){
        if(event.key === "z" && (event.ctrlKey || event.metaKey)){
            event.preventDefault();
            config.dispatch({undo: true});
        } else if(!event.ctrlKey && !event.metaKey && !event.altKey){
            for(let tool of Object.keys(config.tools)){
                if(tool[0] === event.key){
                    event.preventDefault();
                    config.dispatch({tool});
                    return;
                }
            }
        }
    }
    syncState(state){
        this.state = state;
        this.canvas.syncState(state.picture);
        for(let ctrl of this.controls) ctrl.syncState(state);
    }
}

class ToolSelect{
    constructor(state, {tools, dispatch}){
        this.select = elt("select", {
            onchange: () => dispatch({tool: this.select.value})
        }, ...Object.keys(tools).map(name => elt("option", {
            selected: name == state.tool
        }, name)));
        this.dom = elt("label", null, "🖌 Tool: ", this.select);
    }
    syncState(state){ this.select.value = state.tool;  }
}

/*Color Control*/
class ColorSelect{
    constructor(state, {dispatch}){
        this.input = elt("input", {                                             //this input tag
            type: "color",                                                      //of type color creates a color picker
            value: state.color,                                                 //current color on the color picker
            onchange: () => dispatch({color: this.input.value})
        });
        this.dom = elt("label", null, "🎨 Color: ", this.input);
    }
    syncState(state){ this.input.value = state.color; }
}

/*Drawing Tools*/
function draw(pos, state, dispatch){
    function drawPixel({x, y}, state){
        let drawn = {x, y, color: state.color};
        dispatch({picture: state.picture.draw([drawn])});
    }
    drawPixel(pos, state);
    return drawPixel;
}



/*Drawing a Rectangle*/
function rectangle(start, state, dispatch){
    function drawRectangle(pos){
        let xStart = Math.min(start.x, pos.x);
        let yStart = Math.min(start.y, pos.y);
        let xEnd = Math.max(start.x, pos.x);
        let yEnd = Math.max(start.y, pos.y);
        let drawn = [];
        for(let y = yStart; y <= yEnd; y++){
            for(let x = xStart; x <= xEnd; x++){
                drawn.push({x, y, color: state.color});
            }
        }
        dispatch({picture: state.picture.draw(drawn)});
    }
    drawRectangle(start);
    return drawRectangle;
}

/*Filling connected Pixels, like Paint.exe*/
const around = [{dx: -1, dy: 0}, {dx: 1, dy: 0},
                {dx: 0, dy: -1}, {dx: 0, dy: 1}];
            
function fill({x, y}, state, dispatch){
    let targetColor = state.picture.pixel(x, y);
    let drawn = [{x, y, color: state.color}];
    for(let done = 0; done < drawn.length; done++){
        for(let {dx, dy} of around){
            let x = drawn[done].x + dx, y = drawn[done].y + dy;
            if (x >= 0 && x < state.picture.width &&
                y >= 0 && y < state.picture.height &&
                state.picture.pixel(x, y) == targetColor &&
                !drawn.some(p => p.x == x && p.y == y)){
                drawn.push({x, y, color: state.color});
            }
        }
    }
    dispatch({picture: state.picture.draw(drawn)});
}

/*Color Picker*/
function pick(pos, state, dispatch){
    dispatch({color: state.picture.pixel(pos.x, pos.y)});
}

/*Saving and Loading*/
//Saving
class SaveButton{
    constructor(state){
        this.picture = state.picture;
        this.dom = elt("button", {
            onclick: () => this.save()
        }, "💾 Save");
    }
    save(){
        let canvas = elt("canvas");
        drawPicture(this.picture, canvas, 1);
        let link = elt("a", {
            href: canvas.toDataURL(),
            download: "pixelart.png"
        });
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
    syncState(state){
        this.picture = state.picture;
    }
}

//Loading
class LoadButton{
    constructor(_, {dispatch}){
        this.dom = elt("button", {                                              //when this button is pressed function startLoad is going to be loaded
            onclick: () => startLoad(dispatch)
        }, "📁 Load");
    }
    syncState(){}
}

function startLoad(dispatch){                                                   //function for loading a file into the editor
    let input = elt("input", {
        type: "file",
        onchange: () => finishLoad(input.files[0], dispatch)
    });
    document.body.appendChild(input);
    input.click();
    input.remove();
}

function finishLoad(file, dispatch){
    if(file == null) return;
    let reader = new FileReader();
    reader.addEventListener("load", () => {
        let image = elt("img",{
            onload: () => dispatch({picture: pictureFromImage(image)
            }),
            src: reader.result
        });
    });
    reader.readAsDataURL(file);
}

/*Getting pixels by Drawing the loaded picture to the canvas*/
function pictureFromImage(image){
    let width = Math.min(100, image.width);                                     //the image is limited to a 100 by 100..
    let height = Math.min(100, image.height);                                   //sincer anything bigger will slow down the interface and look huge
    let canvas = elt("canvas", {width, height});
    let cx = canvas.getContext("2d");
    cx.drawImage(image, 0, 0);                                                  //draiwng the picture to a canvas element
    let pixels = [];
    let {data} = cx.getImageData(0, 0, width, height);                          //once the picture is on a canvas then we have access to it
    
    function hex(n){
        return n.toString(16).padStart(2, "0");                                 //n.toString(16) will produce a string representaition in base 16, padStart will add a zero when necessary
    }
    for(let i = 0; i < data.length; i += 4){
        let [r, g, b] = data.slice(i, i + 3);
        pixels.push("#" + hex(r) + hex(g) + hex(b));                            //pushing the image data to pixels array
    }
    return new Picture(width, height, pixels);                                  //now we have the image
}

/*Undo History*/
function historyUpdateState(state, action){
    if(action.undo == true){                                                    //when the action is undo, the function takes the most recent picture from history and makes it the current picture
        if(state.done.length == 0) return state;                                //done array keeps previous versions of the picture
        return Object.assign({}, state, {
            picture: state.done[0],
            done: state.done.slice(1),
            doneAt: 0                                                           //tracks the time at wich we last stored a picture in the history
        });
    }else if(action.picture && state.doneAt < Date.now() - 1000){               //otherwise if the action contains a new picture
        return Object.assign({}, state, action, {
            done: [state.picture, ...state.done],
            doneAt: Date.now()
        });
    }else{
        return Object.assign({}, state, action);
    }
}

/*Undo Button*/
class UndoButton{                                                               //this button component doesnt do much
    constructor(state, {dispatch}){                                             //it dispatches undo actions when clicked...
        this.dom = elt("button", {
            onclick: () => dispatch({undo: true}),
            disabled: state.done.length == 0
        }, "⮪ Undo");
    }
    syncState(state){
        this.dom.disabled = state.done.length == 0;                            //..and disables itself when theres nothing to undo
    }
}

/*Lets Draw*/

/*First there needs to be a state set up...*/
var startState = {
    tool: "draw",
    color: "#999ff9",
    picture: Picture.empty(60, 30, "#f0f0f0"),                                  //this is where the size of the canvas comes from
    done: [],
    doneAt: 0
};

/*..and some Tools*/
var baseTools = {draw, fill, rectangle, pick};

/*..and some Controls*/
var baseControls = [
    ToolSelect, ColorSelect, SaveButton, LoadButton, UndoButton
];

function startPixelEditor({state = startState,
                           tools = baseTools, 
                           controls = baseControls}){
    let app = new PixelEditor(state, {
        tools, 
        controls,
        dispatch(action){
            state = historyUpdateState(state, action);
            app.syncState(state);
        }
    });
    return app.dom;
    }