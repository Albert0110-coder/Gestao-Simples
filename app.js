(function(){
  function installPrimeLoginLogo(loginMark){
    if(!loginMark || document.querySelector('.prime-login-logo')) return;

    var source=new Image();
    source.onload=function(){
      try{
        var canvas=document.createElement('canvas');
        canvas.width=source.naturalWidth;
        canvas.height=source.naturalHeight;
        var ctx=canvas.getContext('2d',{willReadFrequently:true});
        ctx.drawImage(source,0,0);

        var image=ctx.getImageData(0,0,canvas.width,canvas.height);
        var data=image.data;
        var w=canvas.width,h=canvas.height,total=w*h;
        var seen=new Uint8Array(total);
        var queue=new Int32Array(total);
        var head=0,tail=0;

        function isBackground(i){
          var p=i*4,r=data[p],g=data[p+1],b=data[p+2];
          var max=Math.max(r,g,b),min=Math.min(r,g,b);
          return r>220 && g>220 && b>220 && (max-min)<22;
        }
        function push(i){
          if(i<0 || i>=total || seen[i] || !isBackground(i)) return;
          seen[i]=1;
          queue[tail++]=i;
        }

        for(var x=0;x<w;x++){push(x);push((h-1)*w+x);}
        for(var y=0;y<h;y++){push(y*w);push(y*w+w-1);}

        while(head<tail){
          var i=queue[head++],px=i%w,py=(i/w)|0;
          if(px>0)push(i-1);
          if(px<w-1)push(i+1);
          if(py>0)push(i-w);
          if(py<h-1)push(i+w);
        }

        for(var i=0;i<total;i++){
          if(seen[i]) data[i*4+3]=0;
        }
        ctx.putImageData(image,0,0);

        var minX=w,minY=h,maxX=-1,maxY=-1;
        for(var y=0;y<h;y++){
          for(var x=0;x<w;x++){
            if(data[(y*w+x)*4+3]>12){
              if(x<minX)minX=x;if(x>maxX)maxX=x;
              if(y<minY)minY=y;if(y>maxY)maxY=y;
            }
          }
        }

        if(maxX>=minX && maxY>=minY){
          var pad=8;
          minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);
          maxX=Math.min(w-1,maxX+pad);maxY=Math.min(h-1,maxY+pad);
          var out=document.createElement('canvas');
          out.width=maxX-minX+1;
          out.height=maxY-minY+1;
          out.className='prime-login-logo';
          out.setAttribute('role','img');
          out.setAttribute('aria-label','Prime');
          out.getContext('2d').drawImage(canvas,minX,minY,out.width,out.height,0,0,out.width,out.height);
          loginMark.replaceWith(out);
        }
      }catch(e){
        loginMark.textContent='P';
      }
    };
    source.onerror=function(){loginMark.textContent='P';};
    source.src='assets/prime-logo.jpg?v=3';
  }

  function applyPrimeBranding(){
    document.title='Prime';

    var appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(appleTitle)appleTitle.setAttribute('content','Prime');

    var style=document.createElement('style');
    style.textContent='.prime-login-logo{display:block;width:min(315px,88vw);height:auto;margin:0 auto 16px}.login h2{display:none}.login p{text-align:center;margin-top:0}.loginbox{overflow:hidden}.login .mark{margin:0 auto 16px!important}';
    document.head.appendChild(style);

    var headerMark=document.querySelector('header .brand .mark');
    if(headerMark)headerMark.textContent='P';

    var navMark=document.querySelector('.navbrand .mark');
    if(navMark)navMark.textContent='P';

    var navName=document.querySelector('.navbrand strong');
    if(navName)navName.textContent='Prime';

    var loginMark=document.querySelector('#loginScreen .mark');
    installPrimeLoginLogo(loginMark);

    var loginTitle=document.querySelector('#loginScreen h2');
    if(loginTitle){loginTitle.textContent='Prime';loginTitle.style.display='none';}

    var accountBrand=document.querySelector('#more .customerHero .muted');
    if(accountBrand)accountBrand.textContent='Prime';
  }

  applyPrimeBranding();

  var files=['core_v8.js?v=15','sales_v8.js?v=15','admin_v8.js?v=15','prime_custom_v9.js?v=15','prime_service_v10.js?v=15','prime_permissions_v11.js?v=15','prime_product_code_v12.js?v=15','prime_preview_v13.js?v=15','prime_assignment_v14.js?v=15','prime_product_picker_v15.js?v=15'];
  function load(i){
    if(i>=files.length)return;
    var s=document.createElement('script');
    s.src=files[i];s.async=false;
    s.onload=function(){load(i+1)};
    s.onerror=function(){var m=document.getElementById('loginMsg');if(m)m.textContent='Falha ao carregar o sistema. Atualize a página.';};
    document.head.appendChild(s);
  }
  load(0);
})();
