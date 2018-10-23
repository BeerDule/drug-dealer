class Items{
    constructor(game){
        this.game=game;
        this.sellsForbidden=[
            'misc'
            ,'weapon'
        ];
        
        /**
            item.type = le code marché sur lequel on le trouvera
        
        **/
        this.items={
            // Drogues
            weed:{
                displayName:"Weed"
                ,basePrice:9.5
                ,unit:'g'
                ,type:'drug'
                ,code:'weed'
                ,pocketVol:3
            }
            ,shit:{
                displayName:"Shit"
                ,basePrice:6.25
                ,unit:'g'
                ,type:'drug'
                ,code:'shit'
                ,pocketVol:2
                
            }
            ,mushroom:{
                displayName:"Champignons"
                ,basePrice:20
                ,unit:'g'
                ,type:'drug'
                ,code:'mushroom'
                ,pocketVol:2
                
            }
            ,meth:{
                displayName:"Crystal Meth"
                ,basePrice:35
                ,unit:'g'
                ,type:'drug'
                ,code:'meth'
                ,pocketVol:1
                
            }
            ,lsd:{
                displayName:"LSD"
                ,basePrice:10
                ,unit:'blot'
                ,type:'drug'
                ,code:'lsd'
                ,pocketVol:0.5
                
            }
            ,cocain:{
                displayName:"Cocaïne"
                ,basePrice:50
                ,unit:'g'
                ,type:'drug'
                ,code:'cocain'
                ,pocketVol:1
                
            }
            ,xtc:{
                displayName:"Ecstasy"
                ,basePrice:12
                ,unit:'pill'
                ,type:'drug'
                ,code:'xtc'
                ,pocketVol:0.5
                
            }
            ,heroin:{
                displayName:"Heroïne"
                ,basePrice:90
                ,unit:'g'
                ,type:'drug'
                ,code:'heroin'
                ,pocketVol:1
                
            }
            
            // produits Mini-market
            ,flour:{
                displayName:"Farine"
                ,basePrice:1
                ,unit:'kg'
                ,type:'misc'
                ,code:'flour'
                ,pocketVol:4
                
            }
            ,egg:{
                displayName:"Œuf"
                ,basePrice:0.15
                ,unit:'egg'
                ,type:'misc'
                ,code:'egg'
                ,pocketVol:1
                
            }
            ,sugar:{
                displayName:"Sucre"
                ,basePrice:1.60
                ,unit:'kg'
                ,type:'misc'
                ,code:'sugar'
                ,pocketVol:4
                
            }
            ,chocolat:{
                displayName:"Chocolat"
                ,basePrice:2.50
                ,unit:'tab'
                ,type:'misc'
                ,code:'chocolat'
                ,pocketVol:2
                
            }
            ,butter:{
                displayName:"Beurre"
                ,basePrice:1.40
                ,unit:'250g'
                ,type:'misc'
                ,code:'butter'
                ,pocketVol:2
                
            }
            
            // armes
            
            ,bbbat:{
                displayName:"Batte de Base-ball"
                ,basePrice:80
                ,unit:'pce'
                ,type:'weapon'
                ,code:'bbbat'
            }
            ,knife:{
                displayName:"KA-BAR"
                ,basePrice:150
                ,unit:'pce'
                ,type:'weapon'
                ,code:'knife'
            }
            
            ,handgun:{
                displayName:"P938"
                ,basePrice:850
                ,unit:'pce'
                ,type:'weapon'
                ,code:'handgun'
                ,mag:7
                ,ammu:'c9mm'
            }
            
            ,machinegun:{
                displayName:"AR15"
                ,basePrice:1750
                ,unit:'pce'
                ,type:'weapon'
                ,code:'machinegun' 
                ,mag:30
                ,ammu:'nato228'
            }
            
            ,shotgun:{
                displayName:"M4 H20"
                ,basePrice:2260
                ,unit:'pce'
                ,type:'weapon'
                ,code:'shotgun'
                ,mag:6
                ,ammu:'cal12'
            }
            
            ,c9mm:{
                displayName:"Cartouche 9mm"
                ,basePrice:2
                ,unit:'pce'
                ,type:'weapon'
                ,code:'c9mm'
                ,isAmmo:true
                ,pocketVol:1
            }
            
            ,cal12:{
                displayName:"Cartouche Cal.12"
                ,basePrice:2
                ,unit:'pce'
                ,type:'weapon'
                ,code:'cal12'
                ,isAmmo:true
                ,pocketVol:1
            }
            
            ,nato228:{
                displayName:"Cartouche 5.56"
                ,basePrice:7.5
                ,unit:'pce'
                ,type:'weapon'
                ,code:'nato228'
                ,isAmmo:true
                ,pocketVol:1 
            }
            
        };
        
        this.transports={
            feet:{
                ico:'walking' // font awesome icon
                ,duration:120 // minutes in game
                ,price:0
                ,active:true
            }
            ,bicycle:{
                ico:'bicycle'
                ,duration:60
                ,price:2500
                ,active:false
            }
            ,moto:{
                ico:'motorcycle'
                ,duration:30
                ,price:8000
                ,active:false
            }
            ,car:{
                ico:'car-side'
                ,duration:30
                ,price:50000
                ,active:false
            }
            ,helico:{
                ico:'helicopter'
                ,duration:10
                ,price:420000
                ,active:false
            }
        }
    }
    
    buy(prod,qty,price){
        let prodData=this.items[prod.code];
        let total=price*qty;
        let totalVol=this.items[prod.code].pocketVol*qty;
        
        //////////// les conditions d'achat
        
        // assez d'argent
        let haveEnoughMoney=total<this.game.current.money;
        // ce n'est pas un flinge
        let isNotAGun=prodData.type==='weapon' && prodData.isAmmo || prodData.type!=='weapon';
        // il reste de la place dans les poches
        let leftEmptySpace=(this.game.current.pocketCapacity-(totalVol+this.game.current.pocketAmnt))>=0;
        
        // si on a assez d'argent et qu'on peut le mettre dans le panier
        if(haveEnoughMoney && ((isNotAGun && leftEmptySpace) || !isNotAGun)){
            
            // on soustrait la transaction au total
            this.game.current.money-=total;
            
            // gère les poches
            if(isNotAGun){
                this.game.current.pocketAmnt+=totalVol;
            }
            
            // on met le pochon dans le panier
            this.game.current.cart.push({
                city:this.game.current.city
                ,timestamp:this.game.current.timeSlice
                ,buyTime:this.game.todayPosix
                ,price:price
                ,qty:qty
                ,code:prod.code
                ,type:prod.type
                ,totalVol:totalVol
            });
            
            // refresh
            this.game.UI.bank();
            this.game.UI.cart();
            this.game.UI.refreshPocketVol();
            return {status:true};
        }
        let reason=false;
        // raison de non achat, dans l'ordre du moins important au plus important
        if(!haveEnoughMoney)
            reason='money';
        
        if(haveEnoughMoney && isNotAGun && leftEmptySpace)
            reason='space';
        
        
        return {status:false,reason:reason};
    }
    
    sell(qty,cartIndex){
        // les données produit
        let prod=this.game.current.cart[cartIndex];
        let prodData=this.items[prod.code];
        
        // calcul du prix de vente selon la ville
        let price=this.game.cities.cities[this.game.current.city].currentPrices.sell[prod.code];
        
        // si ce qu'on essaye de vendre est possible en quantité dispo sur le pochon
        if(qty<=prod.qty){
            // prix total
            let totalPrice=price*qty;
            
            // on diminue la quantité
            prod.qty-=qty;
            
            // on ajoute le résultat de la vente au total
            this.game.current.money+=totalPrice;
            
            // si on gère les poches
            if(prodData.pocketVol){
                let totalVol=this.items[prod.code].pocketVol*qty;
                this.game.current.pocketAmnt-=totalVol;
            }
            
            // si on a plus de produit, on le dégage du panier
            if(!prod.qty){
                this.game.current.cart.splice(cartIndex,1);
            }
            
            // refresh
            this.game.UI.bank();
            this.game.UI.cart();
            this.game.UI.refreshPocketVol();
        }
        
    }
    
    deleteFromCart(cartIndex){
        let prod=this.game.current.cart[cartIndex];
        let totalVol=this.items[prod.code].pocketVol*prod.qty;
        this.game.current.pocketAmnt-=totalVol;
        
        this.game.current.cart.splice(cartIndex,1);
        this.game.UI.cart();
        this.game.UI.refreshPocketVol();
    }
    
    getAll(){
        let o=Object.assign({},this.items);
        return o;
    }
}