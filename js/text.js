//const TypeWriter = function(txtElement, words, wait = 3000){
//    this.txtElement = txtElement;
//    this.words = words;
//    this.txt = "";
//    this.wordIndex = 0;
//    this.wait = parseInt(wait, 10);
//    this.type();
//    this.isDeleting = false;
//};
//
///*Type Method*/
//TypeWriter.prototype.type = function(){
//    const current = this.wordIndex % this.words.length;                         //current index of the word
//    
//    const fullTxt = this.words[current];                                        //get full text of the current word
//    
//    if(this.isDeleting){                                                        //remove char
//        this.txt = fullTxt.substring(0, this.txt.length - 1);
//    } else{                                                                     //add char
//        this.txt = fullTxt.substring(0, this.txt.length + 1);
//    }
//    
//    this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;         //insert txt into element
//    
//    let typeSpeed = 300;                                                        //initial type speed
//    if(this.isDeleting){
//        typeSpeed /= 2;
//    }
//    
//    if(!this.isDeleting && this.txt === fullTxt){                               //if word is complete
//        typeSpeed = this.wait;                                                  //pause at the end
//        this.isDeleting = true;
//    } else if(this.isDeleting && this.txt === ""){
//        this.isDeleting = false;                                                //stop deleting
//        this.wordIndex++;                                                       //and go to the next word
//        typeSpeed = 500;
//    }
//    
//    setTimeout(() => this.type(), typeSpeed);
//};
//
//

/*Class*/

class TypeWriter{
    constructor(txtElement, words, wait = 0){
        this.txtElement = txtElement;
        this.words = words;
        this.txt = "";
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }
    
    type(){
        const current = this.wordIndex % this.words.length;                     //current index of the word
    
        const fullTxt = this.words[current];                                    //get full text of the current word
    
        if(this.isDeleting){                                                    //remove char
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else{                                                                 //add char
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }
    
        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;     //insert txt into element
    
        let typeSpeed = 300;                                                    //initial type speed
        if(this.isDeleting){
            typeSpeed /= 5;
        }
    
        if(!this.isDeleting && this.txt === fullTxt){                           //if word is complete
            typeSpeed = this.wait;                                              //pause at the end
            this.isDeleting = true;
        } else if(this.isDeleting && this.txt === ""){
            this.isDeleting = false;                                            //stop deleting
            this.wordIndex++;                                                   //and go to the next word
            typeSpeed = 700;
        }
    
        setTimeout(() => this.type(), typeSpeed);
    }
}

//init on DOM Load
document.addEventListener("DOMCOntentLoaded", start );

//init App
function start(){
    const txtElement = document.querySelector(".txt-type");
    const words = JSON.parse(txtElement.getAttribute("data-words"));
    const wait = txtElement.getAttribute("data-wait");
    //init TypeWriter
    new TypeWriter(txtElement, words, wait);
}
