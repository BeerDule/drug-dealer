class Cities{
    constructor(game){
        this.game=game;
        this.tool=Tools();
        
        this.commons={
            modifiers:{
                sell:(obj)=>{
                    // let bonus=obj.windDir<180?obj.windDir/180+1:1;
                    let p=parseInt(obj.presVar);
                    let bonus=p<0?p/100*-1:p/100+1
                    // let bonus=1;
                    let v=obj.temp/obj.defTemp*bonus;
                    return v;
                }
                ,buy:(obj)=>{
                    // let bonus=obj.windDir>180?obj.windDir/360+1:1;
                    let bonus=obj.windSpeed/10+1;
                    let v=obj.temp/obj.defTemp*bonus;
                    return v;
                }
                
                
            }
        }
        
        this.cities={
            centralCity:{
                dataJSON:city_centralcity
                ,displayName:'Central City'
                ,active:true
                // modifiers spécifiques à la ville
                ,modifiers:{
                    buy:{
                        pizza:(obj)=>{
                            return this.commons.modifiers.buy(obj)*1.5;
                        }
                    }
                }
                ,currentPrices:{}
            }
            ,highCity:{
                dataJSON:city_highcity
                ,displayName:'High Hills'
                ,active:true
                ,currentPrices:{}
                ,modifiers:{}
            }
            ,middleCity:{
                dataJSON:city_middlecity
                ,displayName:'Downtown'
                ,active:true
                ,currentPrices:{}
                ,modifiers:{}
            }
            ,oceanCity:{
                dataJSON:city_ocancity
                ,displayName:'Ocean Beach'
                ,active:true
                ,currentPrices:{}
                ,modifiers:{}
            }
            ,cabessaNegraIsland:{
                dataJSON:city_cabessanegraisland
                ,displayName:'South Island'
                ,active:true
                ,currentPrices:{}
                ,modifiers:{}
            }
        }
        this.processData();
    }
    
    // on traite le JSON brut pour remplir les villes
    // Donnée météo provenant de https://public.opendatasoft.com/explore/dataset/donnees-synop-essentielles-omm
    processData(){
        for(let p in this.cities){
            let city=this.cities[p];
            let json=JSON.parse(city.dataJSON);
            
            // on trie par date
            let temp=[];
            for(let i=0;i<json.length;i++){
                temp.push(json[i].fields);
            }
            temp.sort(this.arrayCompareDate);
            
            // on vide la mémoire inutile
            delete city.dataJSON;
            
            // on recréer une année devant nous
            let limit;
            let newYear=this.game.today.getFullYear()+1;
            city.data=new Map();
            
            for(let i=0;i<temp.length;i++){
                let u=new Date(temp[i].date);
                let ut=temp[i+1]?new Date(temp[i+1].date):false;
                // on reset l'année à la l'année actuelle
                u.setYear(this.game.today.getFullYear());
                
                
                // on exclu l'échance courante si la suivante est plus grande
                let nextTTIsGreater=ut && (ut.setYear(this.game.today.getFullYear()))>this.game.today;
                
                // si la date passant est inférieur à aujourd'hui, ça sera l'année prochaine
                if(u<this.game.today && !nextTTIsGreater){
                        u.setYear(newYear);
                }
                // on créer l'enrée
                city.data.set((u.getTime()),temp[i]);
            }            
        }
    } 
    
    // renvoi le prix d'un produit de la ville courante à un moment donné (ou pas)
    getPrice(productName,mode,timestamp=false){
        try{
            let d=this.getData(timestamp);
            let products=this.game.items.getAll();
            let product=products[productName];
            let city=this.cities[this.game.current.city];
            
            if(!product || !mode){
                throw 'GetPrice : manque product ou code';
            }
            let price;
            // si on a un modifieur pour ce produit dans cette ville
            if(city.modifiers[mode] && city.modifiers[mode][productName]){
                price=(product.basePrice * city.modifiers[mode](d)).toFixed(2);
            }
            
            // sinon on prend le modifieur commun
            if(this.commons.modifiers[mode]){
                price=(product.basePrice * this.commons.modifiers[mode](d)).toFixed(2);
            }
            
            if(!price)
                throw 'Aucun prix n\'a pu être calculé';
            
            // si pas de demande autre que la date actuelle, on encaisse les données
            if(!timestamp){
                if(!this.cities[this.game.current.city].currentPrices[mode]){
                    this.cities[this.game.current.city].currentPrices[mode]={};
                }
                this.cities[this.game.current.city].currentPrices[mode][productName]=parseFloat(price);
            }
            
            return price;
        }
        catch(e){
            console.log(e);
            return 0;
        }
    }
    
    getData(timestamp){
        try{
            let tmsp=this.game.todayPosix;
            if(timestamp){
                tmsp=timestamp;
            }
            
            let ttMap=this.cities[this.game.current.city].data;

            let searchGreater=true;
            for(let tt of ttMap.keys()){
                if(!searchGreater && tmsp<tt){
                    this.game.current.timeSlice=tmsp=tt;
                    break;
                }
                // on balaye l'année depuis le début, donc, on cherche quand le timestamp sera supérieur
                if(tmsp>tt && searchGreater){
                    searchGreater=false;
                }
            }
            
            // console.log('trouvé ' +this.game.UI.humanizeTime(new Date(tmsp)));
            
            let obj=this.cities[this.game.current.city].data.get(tmsp);
            return {
                // 20°C en Kelvin
                defTemp:293
                
                // variation pression en 3h (Pa)
                ,presVar:obj.tend
                
                // direction du vent (deg)
                ,windDir:obj.dd
                
                // Vitesse du vent moyen 10 mn (m/s)
                ,windSpeed:obj.ff
                
                // Température (K)
                ,temp:obj.t
        
                // Point de rosée (K)
                ,tempR:obj.td
        
                // Humidité (%)
                ,hum:obj.u
                
                // Température minimale du sol sur 12 heures (K)
                ,tempMin:obj.tminsol
                
                // Pression (Pa)
                ,pres:obj.pres 
            };          
        }
        catch(e){
            console.log(e);
        }
    }
    
    arrayCompareDate(a,b){
       return (new Date(a.date))-(new Date(b.date)); 
    }
    
    debugList(){
        let b='<div style="display:flex">';
        for(let p in this.cities){
            let city=this.cities[p];
            let json=JSON.parse(city.dataJSON);
            
            
            let temp=[];
            for(let i=0;i<json.length;i++){
                temp.push(json[i].fields);
            }
            temp.sort(this.arrayCompareDate);
            delete city.dataJSON;
            city.data=new Map();
            let a='<div><div>'+p+'</div>';
            let tem=false;
            for(let i=0;i<temp.length;i++){
                let u=new Date(temp[i].date);
                let borderb='';
                if(!tem){
                    tem=u.getDate();
                }else if(tem!==u.getDate()){
                    borderb="border-top:1px solid red";
                    tem=u.getDate();
                }
                a+='<div style="border-right:1px solid #000;'+borderb+'">'+this.game.UI.humanizeTime(u)+'</div>';
                city.data.set(u.getTime(),temp[i]);
            }
            a+='</div>';
            b+=a;
        }
        this.game.UI.body.innerHTML=b+'</div>';
    }
    
}