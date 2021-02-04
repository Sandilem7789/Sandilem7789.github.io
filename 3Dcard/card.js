/* Movement Animation */                                                        //class and div are not the same remember that
const card = document.querySelector(".card");                                   //binding the card variable to the card class(div)
const container = document.querySelector(".container");                         //binding the container variable to the container class(div)

/* Items */
const title = document.querySelector(".title");                                 //binding the title class to the title class(div)
const sneaker = document.querySelector(".sneaker img");                         //binding the sneaker variable to the the sneaker image
const purchase = document.querySelector(".purchase button");                    //binding the purchase variable to the purchase button
const discription = document.querySelector(".info h3");                         //binding the discription variable to the info class written in h3 element
const sizes = document.querySelector(".sizes");                                 //binding the sizes variable to the sizes class
const circle = document.querySelector(".circle");                               //binding the circle variable to the circle class



/* Moving Card Around */
container.addEventListener("mousemove", (e) => {                                //event handler that listens for the movement of the mouse
    let xAxis = (window.innerWidth / 2 - e.pageX) / 22;                         //dividing by 22 limits the rotation about the x axis which is good in our case
    let yAxis = (window.innerHeight / 2 - e.pageY) / 20;                        //here we are limiting the rotation about the y axis
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;         //we use the transform method to rotate the card on which every thind is located
    
});

/* Animate In */
container.addEventListener("mouseenter", (e) => {                               //event handler that listens for the mouse to enter the vicinity of the card
    card.style.transition = "none";                                             //no transition style
    //popout
    sneaker.style.transform = "translateZ(180px) rotateZ(-405deg)";             //bring the sneaker 180px forward and rotate it 405 degrees counter clockwise, ends in a 45 degrees angle(360 + 45 = 405)
    title.style.transform = "translateZ(180px) translateY(22px)";               //move the title forwards by 180px, move down by 22px to make wayt for the zoomed sneaker
    discription.style.transform = "translateZ(170px)";                          //move the discription forwards by 170px
    sizes.style.transform = "translateZ(160px)";                                //move forwards the sizes div by 160px
    purchase.style.transform = "translateZ(120px) translateY(-30px)";           //move forwards the purchase button by 120px and move it up a bit by 30px
    circle.style.width = "15rem";                                               //increse the width of the circle behing the sneaker(would be nice if it was the logo)
    circle.style.height = "15rem";                                              //increase the height of the circle, we dont want an elipse
    circle.style.borderRadius = "100%";                                         //make the border radius 100% so that it is a circle, thats how u turn a rect to circ
    card.style.background = "linear-gradient(to top,white,lightpink";           //set the background to be a linear gradient
});


/* Animate Out */
container.addEventListener("mouseleave", (e) => {                               //this event listener returns things to their initial state when the mouse leaves the card/container
    card.style.transition = "all 0.7s ease";                                    //setting the rate at which thing go back to their initial state in this case its 0.7 seconds
    card.style.transform = `rotateY(0deg) rotateX(0deg)`;                       //reseting the rotations of the card
    //popback
    sneaker.style.transform = "translateZ(0px) rotateZ(0deg)";                  //putting the image back to its initial orientation
    title.style.transform = "translateZ(0px) translateY(0px)";                  //and the title
    discription.style.transform = "translateZ(0px)";
    sizes.style.transform = "translateZ(0px)";
    purchase.style.transform = "translateZ(0px) translateY(0px)";
    circle.style.width = "0rem";
    circle.style.height = "0rem";
    circle.style.borderRadius = "100px";
    card.style.background = "linear-gradient(to top,white, whitesmoke";
});