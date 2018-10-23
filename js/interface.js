class Interface{
    constructor(game){
        this.game=game;
        this.tool=Tools();
        this.body=document.querySelector('body');
        
    }
    
    init(){
        let handler=this.tool.createElement({
            attr:{
                id:'handler'
            }
        });
        
        this.header=this.tool.createElement({
            attr:{
                id:'header'
            }
        });
        
        handler.appendChild(this.header);
        this.main=this.tool.createElement({
            attr:{
                id:'main'
            }
        });
        
        handler.appendChild(this.main);
        this.body.appendChild(handler);
        
        this.bank();
        this.timer();
        this.citySelector();
        this.hud();
        this.market();
        this.cart();
        
        
    }
    
    humanizeTime(s){
        if(!s){
            console.log('humanizeTime : parametre manquant');
        }
        let tdd=new Date(s);
        return tdd.toLocaleDateString()+' '+tdd.toLocaleTimeString();
    }
    
    timer(){
        this.timerBox=this.tool.createElement({
            attr:{
                id:'timer'
            }
        });
        this.header.appendChild(this.timerBox);
        // premier affichage
        this.timerBox.innerHTML=this.userFriendlyTime(this.game.today);
        
        // toute les secondes on refresh
        this.game.timer.timerObserver.second.push(()=>{
            this.timerBox.innerHTML=this.userFriendlyTime();
        });
    }
    
    userFriendlyTime(mixedTime=false){
        if(!mixedTime){
            mixedTime=this.game.todayPosix;
        }
        let d=new Date(mixedTime);
        let conv=(n)=>this.tool.padWithZero(n);
        let date=conv((d.getDate()));
        let m=conv(d.getMonth());
        let y=conv(d.getYear()-100);
        let h=conv(d.getHours());
        let mi=conv(d.getMinutes());
        let s=conv(d.getSeconds());
        
        return `<span>${date}/${m}/${y}</span> <span>${h}:${mi}</span>`;
            
    }
    
    market(){
        
        if(!this.marketNode){
            this.marketNode=this.tool.createElement({
                attr:{
                    id:'marketbox'
                }
                ,html:`
                    <div id="marketselect"></div>
                    <div id="marketplace"></div>
                `
            });
            this.main.appendChild(this.marketNode);  
        }
        this.marketSelector();
        this.marketList();
        
        if(this.game.debug){
            this.debugParam();
        }
            
            
    }
    
    marketSelector(){
        
        this.activeMarket='drug';
        this.marketPlaces={
            drug:{
                displayName:'Marché noir'
                
            }
            ,misc:{
                displayName:'Carouf City'
                
            }
            ,weapon:{
                displayName:'Armurerie'
                
            }
        };
        
        let selectBar=this.marketNode.querySelector('#marketselect');
        let place=this.marketNode.querySelector('#marketplace');
        
        for(let marketType in this.marketPlaces){
            let market=this.marketPlaces[marketType];
            market.type=marketType;
            let activeClass=marketType===this.activeMarket?' active':'';
            
            // les sélecteurs 
            let sel=this.tool.createElement({
                attr:{
                    class:'m_goto'+activeClass
                }
                ,html:market.displayName
            });
            
            ((s,mt)=>{
                s.addEventListener('click',()=>{
                    if(mt!==this.activeMarket){
                        this.marketPlaces[this.activeMarket].placeNode.classList.remove('active');
                        selectBar.querySelector('.m_goto.active').classList.remove('active');
                        s.classList.add('active');
                        this.activeMarket=mt;
                        this.marketPlaces[this.activeMarket].placeNode.classList.add('active');
                        this.marketList();
                    }
                });
                
            })(sel,marketType);
            
            
            selectBar.appendChild(sel);
            
            // les conteneurs des marketList
            let cont=this.tool.createElement({
                attr:{
                    class:'mp_cont'+activeClass
                }
                ,html:market.displayName
            });
            market.placeNode=cont;
            place.appendChild(cont);
            
        }
    }
    
    bank(){
        if(!this.bankNode){
            this.bankNode=this.tool.createElement({
                attr:{
                    id:'bank'
                }
            });
            
            this.header.appendChild(this.bankNode);  
        }
        this.bankNode.innerHTML=`
            <div id="bankamnt">
                <span>${(this.game.current.money).toFixed(2)}</span>
                <span>Cr.</span>
            </div>
        `;
    }
    
    hud(){
        let hudNode=this.tool.createElement({
            attr:{
                id:'hud'
            }
        });
        
        this.pockets=this.tool.createElement({
            attr:{
                id:'pockets'
                ,class:'hud_elem'
            }
            ,html:'<span class="fas fa-briefcase"></span><span id="pvgauge"><span id="pvamnt"></span>/</span><span id="pvtotal"></span></span>'
        });
        hudNode.appendChild(this.pockets);
        this.refreshPocketVol();
        
        this.header.appendChild(hudNode);
    }
    
    refreshPocketVol(amnt=this.game.current.pocketAmnt,total=this.game.current.pocketCapacity){
        let amntNode=this.pockets.querySelector('#pvamnt');
        
        amntNode.classList.remove('dryqty');
        if((total-amnt)<=5 && amnt>0){
            amntNode.classList.add('dryqty');
        }
        amntNode.innerHTML=amnt;
        this.pockets.querySelector('#pvtotal').innerHTML=total;
    }
    
    citySelector(){
        this.cityBox=this.tool.createElement({
            attr:{
                id:'cities'
            }
        });
        let cities=this.game.cities.cities;
        for(let c in cities){
            
            // la classe active
            let cAct='';
            if(c==this.game.current.city){
                cAct+=' active';
            }
            
            // on créer le bouton
            let city=cities[c];
            let node=this.tool.createElement({
                attr:{
                    class:'gotocity'+cAct
                }
            });
            
            node.innerHTML='<span class="fas fa-building"></span> '+city.displayName;
            
            // au click sur un lien ville
            ((n,cityCode,cityObj)=>{
                n.addEventListener('click',()=>{
                    
                    // on met à jour la ville, vers où on va
                    this.game.current.city=cityCode;
                    
                    // la popin de transport
                    let modal=this.modal({
                       title:'En route vers '+cityObj.displayName 
                    });
                    
                    let tCode=this.game.current.transport;
                    
                    let tData=this.game.items.transports[tCode];
                    
                    let tIcon=`${tCode} fas fa-${tData.ico}`;
                    
                    // on avance dans le temps
                    let transport=this.game.timer.fastForward(tData.duration);
                    
                    
                    modal.body.innerHTML=`
                        <div id="transportstage">
                            <div class="fas fa-building"></div>
                            <div class="perso ${tIcon}"></div>
                            <div class="fas fa-building"></div>
                        </div>
                    `;
                    
                    transport.then(()=>{
                        modal.closeModal();
                        this.marketList();
                        this.cart();
                        this.cityBox.querySelector('.active').classList.remove('active');
                        n.classList.add('active');
                        
                        if(this.game.debug){
                            this.debugParam();
                        }
                    });
                });
                
            })(node,c,city);
            this.cityBox.appendChild(node);
        }
        this.header.appendChild(this.cityBox);
    }
    
    modal(param=false){
        
        let title='';
        if(param.title && param.title.length)
            title=param.title;
        
        let closeBtnHTML='';
        let bottomClose='';
        if(param.closeBtn===true){
            closeBtnHTML='<div class="mch_close fas fa-times"></div>';
            bottomClose='<div class="mchb_close"><span class="btn">FERMER</span></div>';
        }
        
        let modal=this.tool.createElement({
            attr:{id:'modalhandler'}
            ,html:`
                <div class="modalcont">
                    <div class="mc_head">
                        <div class="mch_title">${title}</div>
                        ${closeBtnHTML}
                        
                    </div>
                    <div class="mc_body"></div>
                    ${bottomClose}
                
                </div>
            `
        });
        
        let closeModal=()=>{
            this.body.removeChild(modal);
        }
        
        if(closeBtnHTML.length){
            modal.querySelector('.mch_close').addEventListener('click',()=>{
                closeModal();
            });
            modal.querySelector('.mchb_close').addEventListener('click',()=>{
                closeModal();
            });
        }
        
        this.body.appendChild(modal);
        return {
            body:modal.querySelector('.mc_body')
            ,closeModal:closeModal
        }
    }
        
    debugParam(){
        let data=this.game.cities.getData();
        let box=document.querySelector('#paramdebug');
        if(!box){
            box=this.tool.createElement({
                attr:{
                    id:'paramdebug'
                }
            });
            
            this.body.appendChild(box);  
        }
        box.innerHTML='';
        for(let p in data){
            let n=this.tool.createElement();
            n.innerHTML='<div>'+p+' : '+data[p]+'</div>';
            box.appendChild(n);
        }
        
        console.log("DEBUG",data);
    }
    
    marketList(){
        let items=this.game.items.getAll();
        // vente authorisé uniquement sur le marché noir
        let authorizedSell=this.activeMarket!=='misc' && this.activeMarket!=='weapon';
        
        
        let sellCol='';
        if(authorizedSell)
            sellCol=`<div class="pl_sellprice">VENTE</div>`;
        
        
        let list=this.tool.createElement({
            attr:{
                class:'marketlist'
            }
            ,html:`
                <div class="priceline marketheader">
                    <div class="pl_name"></div>
                    <div class="pl_buyprice">ACHAT</div>
                    ${sellCol}
                    <div class="pl_qty"></div>
                    <div class="pl_unit"></div>
                    <div class="pl_pockvol"><span class="fas fa-briefcase"></span></div>
                    <div class="pl_buy"></div>
                    <div class="pl_buya"></div>
                </div>
            `
        });
        
        this.buyAllBtns=[];
        
        let errorModal=(ok)=>{
            let errorBox=this.modal({
                title:'Dommage !'
                ,closeBtn:true
            });
            let msg='Une erreur est survenue';
            if(ok.reason==='money'){
                msg=`Vous n'avez pas assez d'argent`;
            }
            if(ok.reason==='space'){
                msg=`Vous n'avez pas assez de poche`;
            }
            errorBox.body.innerHTML=msg;
        }
        
        
        for(let d in items){
            let it=items[d];
            let itType=it.type;
             
            // ça prend dans les poches ?
            let isRoomed=it.type==='weapon' && it.isAmmo || it.type!=='weapon';
            if(itType===this.activeMarket){
                let line=this.tool.createElement({
                    attr:{
                        class:'priceline'
                    }
                });


                // on va chercher les prix

                // prix d'achat pour tout sauf les armes

                let buyPrice=this.game.items.items[it.code].basePrice;
                if(itType!=='weapon'){
                    buyPrice=this.game.cities.getPrice(d,'buy');
                }

                // prix de vente (pas pour les boutiques, ni armurerie)
                let sellPrice='';
                if(authorizedSell){
                    sellPrice=this.game.cities.getPrice(d,'sell');
                }

                // valeur Achat Max
                let buyAllAmnt=()=>Math.floor(this.game.current.money/buyPrice);

                // colonne vente
                let sellCol='';
                if(authorizedSell)
                    sellCol=`<div class="pl_sellprice">${sellPrice}</div>`;

                // colonne taille
                let pRoomCol='<div class="pl_pockvol"></div>';
                if(isRoomed)
                    pRoomCol=`<div class="pl_pockvol">${it.pocketVol}</div>`;

                line.innerHTML=`
                    <div class="pl_name">${it.displayName}</div>

                    <div class="pl_buyprice">${buyPrice}</div>
                        ${sellCol}
                    <div class="pl_qty"><input type="type" value="1"></div>
                    <div class="pl_unit">${it.unit}</div>
                    ${pRoomCol}
                    <div class="pl_buy">
                        <div class="pl_buyqty pl_buybtn btn">Acheter</div>
                    </div>
                    <div class="pl_buya">
                        <div class="pl_buyall pl_buybtn btn">Ach. max (${buyAllAmnt()})</div>
                    </div>
                `;

                ///////// Acheter la quantité
                let buyBtn=line.querySelector('.pl_buyqty');
                let qtyInp=line.querySelector('.pl_qty input');
                ((b,i,qi)=>{
                    b.addEventListener('click',()=>{

                        let ok=this.game.items.buy(i,parseInt(qi.value),parseFloat(buyPrice));
                        if(ok.status){
                            // recalcul des lignes achat Max
                            this.refreshBuyAllBtn();
                            return;
                        }
                        // erreur
                        errorModal(ok);
                    });

                })(buyBtn,it,qtyInp);

                ///////// Acheter le max selon argent
                let buyAllBtn=line.querySelector('.pl_buyall');
                let that=this;
                // stockage des lignes achat Max pour refresh ultérieur
                this.buyAllBtns.push({node:buyAllBtn,cb:function(){
                    let baqty=Math.floor(that.game.current.money/buyPrice);

                    this.node.innerHTML=`Ach. max (${baqty})`;
                }});
                
                // au click
                ((b,i)=>{
                    b.addEventListener('click',()=>{
                        let qi=buyAllAmnt();
                        if(qi>0){
                            let ok=this.game.items.buy(i,qi,parseFloat(buyPrice));
                            if(ok){
                                // on met le compteur à 0 pour ce bouton
                                b.innerHTML='Ach. max (0)';
                                // recalcul des lignes achat Max
                                this.refreshBuyAllBtn();
                                return;
                            }
                            // erreur
                            errorModal(ok);
                        }
                        // erreur
                        errorModal({reason:'money'});
                    });

                })(buyAllBtn,it);

                list.appendChild(line);
            }
             
        }
        this.marketPlaces[this.activeMarket].placeNode.innerHTML='';
        this.marketPlaces[this.activeMarket].placeNode.appendChild(list);
    }
    
    refreshBuyAllBtn(){
        for(let i=0;i<this.buyAllBtns.length;i++){
            this.buyAllBtns[i].cb();
        }
    }
    
    cart(){
        if(!this.cartNode){
            this.cartNode=this.tool.createElement({
                attr:{
                    id:'cart'
                }
            });
            
            this.main.appendChild(this.cartNode);  
        }
        
        this.cartNode.innerHTML=``;
        for(let i=0,len=this.game.current.cart.length;i<len;i++){
            
            // données produit
            let prod=this.game.current.cart[i];
            let prodBaseData=this.game.items.items[prod.code];
            
            // volume total
            let totalVol='';
            if(prodBaseData.pocketVol){
                let tv=prod.qty*prodBaseData.pocketVol;
                totalVol=`
                <div class="cp_weig"><span class="fas fa-briefcase"></span> ${tv}</div>`;
            }
            
            // vente authorisée uniquement pour les drogues
            let authorizedSell=prod.type!=='misc' && prod.type!=='weapon';
            
            // nom de la ville
            let productCity=this.game.cities.cities[prod.city];
            let currentCity=this.game.cities.cities[this.game.current.city];
            let cityName=productCity.displayName;

            // date d'achat d'achat
            let d=this.userFriendlyTime(prod.buyTime);
            
            // Total crédits
            let totalCR=(prod.qty*prod.price).toFixed(2);
            
            // Bouton vente inactif sur la même tranche de temps dans la même ville
            let inactiveClass='';
            if(
                parseInt(prod.timestamp)===parseInt(this.game.current.timeSlice) 
                && prod.city===this.game.current.city
            ){
                inactiveClass=' inactive';
            }
            
            // classe du liseret coloré
            let cartPColor=` cp_cpc_${prod.type}`;
            
            // profit de vente 
            let profitCol='';
            if(authorizedSell){
                let currentTotal=currentCity.currentPrices.sell[prod.code]*prod.qty;
                let profit=(currentTotal-totalCR).toFixed(2);
                let pWay=profit<0?'neg':'pos';
                profitCol=`<div class="cp_profit">Profit : <span class="${pWay}">${profit} Cr.</span></div>`;
            }
            
            
            let pNode=this.tool.createElement({
                attr:{
                    class:'cart_prod'+cartPColor
                }
            });            
            pNode.innerHTML=`
                
                <div class="cp_phead">
                    <div class="cp_name">${prodBaseData.displayName} ${totalCR} Cr.</div>
                    <div class="cp_headaction">
                        <div class="cp_habtn cp_delfromcart fas fa-trash"></div>
                    </div>
                </div>
                <div class="cp_info">
                    <div class="cp_mon">${prod.qty} ${prodBaseData.unit} x ${prod.price} Cr.</div>
                    ${totalVol}
                    <div class="cp_cityname">${cityName}<br>${d}</div>
                    ${profitCol}
                </div>
                <div class="cp_action">
                    <div class="cp_sellqty">
                        <input type="text" value="1">
                    </div>
                    <div class="cpa_btn"></div>
                </div>
            `;

            let btnContainer=pNode.querySelector('.cpa_btn');
            let qtyInp=pNode.querySelector('.cp_sellqty input');
            
            
            let delBtn=pNode.querySelector('.cp_delfromcart');
            ((n,cartIndex)=>{
                n.addEventListener('click',()=>{
                    this.game.items.deleteFromCart(cartIndex);
                });
            })(delBtn,i);            
            
            if(prod.type==='misc'){
                
                // Bouton Utiliser
                let useBtnQty=this.tool.createElement({
                    attr:{
                        class:`cp_usebtn btn${inactiveClass}`
                    }
                    ,html:'Utiliser'
                });
                
                btnContainer.appendChild(useBtnQty);
                
                ((s,qi,cartIndex)=>{
                    s.addEventListener('click',()=>{
                        alert("USE");
                    });

                })(useBtnQty,qtyInp,i);
            }
            
            
            if(prod.type==='drug'){
                
                // Bouton vendre
                let sellBtnQty=this.tool.createElement({
                    attr:{
                        class:(`cp_sellbtn btn${inactiveClass}`)
                    }
                    ,html:'Vendre'
                });
                
                btnContainer.appendChild(sellBtnQty);
                
                ((s,qi,cartIndex)=>{
                    s.addEventListener('click',()=>{
                        if(!inactiveClass.length){
                            this.game.items.sell(parseInt(qi.value),cartIndex);
                            // recalcul des lignes d'achat
                            this.refreshBuyAllBtn();
                        }
                    });

                })(sellBtnQty,qtyInp,i);

                // bouton Tout Vendre
                let sellBtnQtyAll=this.tool.createElement({
                    attr:{
                        class:`cp_sellbtn btn${inactiveClass}`
                    }
                    ,html:`Tout vendre (${prod.qty})`
                });
                
                btnContainer.appendChild(sellBtnQtyAll);
                
                ((s,qi,cartIndex)=>{
                    s.addEventListener('click',()=>{
                        if(!inactiveClass.length){
                            this.game.items.sell(parseInt(qi),cartIndex);
                            // recalcul des lignes d'achat
                            this.refreshBuyAllBtn();
                        }
                    });

                })(sellBtnQtyAll,prod.qty,i);
                
                
            }
            

            
            this.game.current.cart[i].node=pNode;
            this.cartNode.appendChild(pNode);
        }
        
    }
}