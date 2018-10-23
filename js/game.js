

class Game{
    constructor(){
        this.debug=false;
        this.money=0;
        this.today=new Date(); // backup of the date, to compare
        this.todayPosix=this.today.getTime(); // posix
        
        // default 5min=24h
        this.minForADay=5;
        // on scope l'incrément du timer pour pouvoir le changer à la volée
        this.timerIncr=()=>(86400/(this.minForADay*60)*1000);
        
        this.UI=new Interface(this);
        this.items=new Items(this);
        this.cities=new Cities(this);
        this.timer=new Timer(this);
        
        this.current={
            city:'centralCity'
            ,day:this.today.getDate()
            ,month:this.today.getMonth()
            ,year:this.today.getFullYear()
            ,dayPassed:0
            ,money:20
            ,cart:[]
            ,pocketAmnt:0
            ,pocketCapacity:50
            ,transport:'feet'
        }        
    }
}

function Tools(){
    return {
        createElement:(param)=>{
            let type='div';
            if(param && param.type){
               type=param.type; 
            }
            let a=document.createElement(type);
            if(param && param.attr && typeof param.attr==='object'){
                for(var attr in param.attr){
                    let pattr=param.attr[attr];
                    a.setAttribute(attr,pattr);
                }
            }
            
            if(param.html && param.html.length){
                a.innerHTML=param.html;
            }
            return a;
        }
        ,padWithZero:(n)=>n<10?'0'+n:n
    }
}

let d;
window.onload=()=>{


        
    let g=d=new Game();
    g.UI.init();
    g.timer.start();
    
}