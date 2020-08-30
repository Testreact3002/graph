const coords = (ctx, width, height, hpad, vpad ) => {
       ctx.lineWidth= 2;	   
       ctx.beginPath();
       ctx.moveTo(width - hpad,height-vpad);
       ctx.lineTo(hpad,height - vpad );
       ctx.lineTo(hpad,vpad);	   
       ctx.stroke();
}

const point = (ctx, x, y) => {
         ctx.fillStyle='white';
         ctx.arc(x,y, 10 , 0, Math.PI*2);
         ctx.fill();
}

const tr = (t,from,to) => from + (to - from) * t*t;

class GraphCanvas extends HTMLCanvasElement {
     	
   constructor(){
       super();
       this.addEventListener('click', this.onclick);
       this.render=this.render.bind(this);
       this.ctx = this.getContext('2d');
       
       this.width=this.scrollWidth;
       this.height=this.scrollHeight;
       this.hpad=35;
       this.vpad=30;
       this.tl = 1000;
       this.aspect=(this.height-2*this.vpad)/(this.width-2*this.hpad);
       this.getData().then((data)=>{
	 this.arr = data;      
         this.drawStatic(this.ctx,this.width,this.height,this.hpad,this.vpad, this.h0, this.arr);
         requestAnimationFrame(this.render);
       })	       
   }
  get h0() {
     return (this.width - 2 * this.hpad)/12; 
  }	
  getData(){
     return new Promise ( function(resolve){	  
     const min = 2;
     const maxMinusOne = 9;
     let arr = []; 
     arr = new Array(Math.floor(Math.random()*maxMinusOne + min));
     for(let i = 0; i< arr.length; i++){
       arr[i] = Math.random();
     }
     resolve(arr);
     });	     
  }

  drawStatic(ctx, width, height, hpad, vpad, h0, arr){
       coords(ctx, width, height, hpad, vpad);
       ctx.lineWidth = 1;
       ctx.beginPath();
       const h = (width - 2 * hpad - 2*h0)/(arr.length-1);
       let x0,y0,x1,y1;
       ctx.moveTo(x0 = hpad+h0, y0 = height - (height - 2*vpad)*arr[0] - vpad);
       for(let i = 1; i< arr.length; i++){
         ctx.lineTo(x1=h*(i)+hpad+h0, y1=height - (height - 2*vpad)*arr[i] - vpad);
	 ctx.closePath();      
	 ctx.stroke();      
	 point(ctx,x0,y0);      
	 ctx.beginPath();      
	 ctx.moveTo(x0=x1,y0=y1);
       }
       ctx.closePath();	  
       point(ctx,x0,y0);	  
  }
  drawAnimate(ctx, width, height, hpad, vpad, h0, arr, arr2, transforms, t){
       ctx.clearRect(0,0,width,height);
       coords(ctx, width, height, hpad, vpad);
       
       ctx.lineWidth = 1;
       ctx.beginPath();
       const mw = width - 2 * hpad - 2*h0;
       const h1 = mw/(arr.length-1);
       const h2 = mw/(arr2.length-1);

       let x0,y0,x1,y1;
       ctx.moveTo(x0 = hpad+h0, y0 = height - (height - 2*vpad)*tr(t,arr[0],arr2[0]) - vpad);
       for(let i = 1; i< transforms.length; i++){
	 const fromX = transforms[i][0]*h1;
	 const fromY = arr[transforms[i][0]];
	 const toX = transforms[i][1]*h2;
	 const toY = arr2[transforms[i][1]];
	 x1 = hpad + h0 + tr(t, fromX, toX);
	 y1 = height - (height- 2*vpad) * tr(t, fromY, toY) -vpad      
         ctx.lineTo(x1, y1);
	 ctx.closePath();      
	 ctx.stroke();
	 point(ctx,x0,y0);
	 ctx.beginPath();      
	 ctx.moveTo(x0=x1,y0=y1);
       }
       ctx.closePath();	  
       point(ctx,x0,y0);
  }

  getTransforms(arr1, arr2){
     const width = 1000;	  
     const h1 = width/(arr1.length-1);
     const h2 = width/(arr2.length-1);
     let transforms ;
     let x1 = width; 
     let x2 = width;
     if(arr1.length > arr2.length){
       transforms  = new Array(arr1.length);
       x2 -= h2/2;	     
       for (let i = arr1.length-1, j = arr2.length - 1; i>-1; i--,x1-=h1){
         if(x1 < x2){
	    j--;
	    x2-=h2;   
         }
         transforms[i]=[i,j];
       }
     }else{
       transforms = new Array (arr2.length);
       x1 -= h1/2;	     
       for (let i = arr1.length-1, j = arr2.length - 1; j>-1; j--,x2-=h2){
	 if(x2 < x1){
           i--;
           x1-=h1;   
	 }
	 transforms[j]=[i,j];
       }
     }
	  
    return  transforms;
  }
  onclick(e){
    if(this.arr2===undefined){
      this.getData().then((data)=>{
         this.arr2 = data;
         this.transforms = this.getTransforms(this.arr, this.arr2);
         this.classList.add("graph--animated");
      });
      	    
    }

  }
  onresize(e){
    console.log('resize', this.scrollWidth,'×',this.scrollHeight);
     this.width=this.scrollWidth;
     this.height=this.scrollHeight;
    if(this.aspect*(this.width-2*35)<=this.height-2*this.vpad){
     this.vpad=(this.height - (this.width-2*35)*this.aspect)/2;
     this.hpad=35;	    
    }else{
       this.vpad = 30;
        do{
         this.hpad = (this.width - (this.height-2*this.vpad)/this.aspect)/2;
	}while(this.hpad<35 && this.vpad++ ) 
    }
    console.log(this.width, this.height, this.hpad, this.vpad);
    	  
  }
    
  render(ts){
      	  
      if(this.width!=this.scrollWidth || this.height!==this.scrollHeight){
         this.onresize(this); 
      }
          
      	  
      if(this.arr2){
	 if(this.t0 === undefined){
           this.t0 = ts;		 
	 }
	 const t = (ts - this.t0)/this.tl;
	 if(t<1-0.000001){
           this.drawAnimate(this.ctx,this.width,this.height,this.hpad,this.vpad,this.h0, this.arr, this.arr2, this.transforms, t);
	 }else{
            this.drawAnimate(this.ctx,this.width,this.height,this.hpad,this.vpad,this.h0, this.arr, this.arr2, this.transforms, 1);
            this.arr = this.arr2;
	    this.t0 = undefined;
            this.classList.remove("graph--animated");
            this.arr2 = undefined;
	 }
         
      }else{

       this.drawStatic(this.ctx,this.width,this.height,this.hpad,this.vpad,this.h0,this.arr);
      }
       requestAnimationFrame(this.render);
  }
}

customElements.define('graph-canvas', GraphCanvas, { extends: 'canvas' });

export default GraphCanvas;
