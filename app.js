(()=>{"use strict";const $=id=>document.getElementById(id),DB="bananaVisionMAXDB",STORE="media";let db,items=[],filter="all",current=0,rotation=0,zoom=1,slideTimer=null,lastTap=0,lastVideoTap=0,editRotation=0,editFlip=false,videoRotation=0,videoFit="contain",audioShuffle=false,audioRepeat=false;
const objectURLs=new Set();
function makeURL(blob){const u=URL.createObjectURL(blob);objectURLs.add(u);return u}
function releaseURL(u){if(u&&objectURLs.has(u)){URL.revokeObjectURL(u);objectURLs.delete(u)}}
function clearTempURLs(){for(const u of objectURLs)URL.revokeObjectURL(u);objectURLs.clear()}const kind=x=>x.type.startsWith("image/")?"photo":x.type.startsWith("video/")?"video":"audio",fmt=n=>Number.isFinite(n)?Math.floor(n/60)+":"+String(Math.floor(n%60)).padStart(2,"0"):"0:00";
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function openDB(){return new Promise((ok,no)=>{let r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:"id"})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
function all(){return new Promise((ok,no)=>{let r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>ok(r.result||[]);r.onerror=()=>no(r.error)})}
function put(x){return new Promise((ok,no)=>{let r=db.transaction(STORE,"readwrite").objectStore(STORE).put(x);r.onsuccess=ok;r.onerror=()=>no(r.error)})}
function url(x){return makeURL(x.blob)}
function draw(el,list){el.querySelectorAll("[data-object-url]").forEach(n=>releaseURL(n.dataset.objectUrl));el.innerHTML="";list.forEach(x=>{let i=items.findIndex(y=>y.id===x.id),b=document.createElement("button");b.className="tile";let k=kind(x),u=url(x);b.dataset.objectUrl=u;if(k==="photo"){let im=document.createElement("img");im.src=u;im.loading="lazy";b.append(im)}else if(k==="video"){let v=document.createElement("video");v.src=u;v.muted=true;v.preload="metadata";b.append(v)}else{let a=document.createElement("div");a.className="audio";a.textContent="♫";b.append(a)}let e=document.createElement("em");e.textContent=k.toUpperCase()+(x.favorite?" ♥":"");b.append(e);b.onclick=()=>open(i);el.append(b)})}
function render(){let q=$("search").value.toLowerCase(),a=items.filter(x=>(filter==="all"||kind(x)===filter||(filter==="favorite"&&x.favorite))&&(filter!=="favorite"||x.favorite)&&x.name.toLowerCase().includes(q)),s=$("sort").value;a.sort((x,y)=>s==="name"?x.name.localeCompare(y.name):s==="old"?x.added-y.added:s==="size"?y.size-x.size:y.added-x.added);draw($("grid"),a);draw($("favgrid"),items.filter(x=>x.favorite));$("status").textContent=items.length?`${a.length} shown · ${items.length} saved`:"Import photos, videos or music to begin.";let n=items.reduce((v,x)=>v+x.size,0);$("storage").textContent=`${items.length} items · ${(n/1048576).toFixed(1)} MB approx.`;populateSelects()}
function populateSelects(){
 ["imageSelect","infoSelect","advancedImageSelect"].forEach(id=>{let s=$(id),old=s.value;s.innerHTML="";let ph=document.createElement("option");ph.value="";ph.textContent="Select imported media…";s.append(ph);items.forEach(x=>{let o=document.createElement("option");o.value=x.id;o.textContent=x.name;s.append(o)});s.value=items.some(x=>x.id===old)?old:""});
 let ps=$("pdfPhotoSelect"),chosen=[...ps.selectedOptions].map(o=>o.value);ps.innerHTML="";
 items.filter(x=>kind(x)==="photo").forEach(x=>{let o=document.createElement("option");o.value=x.id;o.textContent=x.name;o.selected=chosen.includes(x.id);ps.append(o)});
 ["collageSelect","compareA","compareB","animationSelect"].forEach(id=>{
  const s=$(id);if(!s)return;const old=[...s.selectedOptions].map(o=>o.value),was=s.value;s.innerHTML="";
  items.filter(x=>kind(x)==="photo").forEach(x=>{let o=document.createElement("option");o.value=x.id;o.textContent=x.name;o.selected=old.includes(x.id)||x.id===was;s.append(o)});
 });
}
async function add(files){let list=[...files].filter(f=>/^(image|video|audio)\//.test(f.type));if(!list.length)return toast("No supported media selected");toast("Importing…");let failed=0;for(let f of list){try{await put({id:crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random(),name:f.name||"Media",type:f.type,size:f.size,added:Date.now(),favorite:false,blob:f})}catch(e){failed++;}}items=await all();render();toast(failed?`${list.length-failed} imported · ${failed} failed (storage limit?)`:`${list.length} imported successfully`)}
function page(id){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===id))}
function stopSlide(){if(slideTimer)clearInterval(slideTimer);slideTimer=null;$("slide").textContent="▶ Slideshow"}
function move(d){let a=items.filter(x=>filter==="favorite"?x.favorite:filter==="all"||kind(x)===filter);if(!a.length)a=items;let p=a.findIndex(x=>x.id===items[current]?.id),n=a[(p+d+a.length)%a.length];if(n)open(items.findIndex(x=>x.id===n.id))}
function open(i){if(i<0||!items[i])return;releaseURL($("viewer").dataset.objectUrl);current=i;let x=items[i],k=kind(x),u=url(x);$("viewer").dataset.objectUrl=u;$("viewer").classList.add("open");$("title").textContent=x.name;$("photo").style.display=k==="photo"?"block":"none";$("video").style.display=k==="video"?"block":"none";$("audio").style.display=k==="audio"?"block":"none";$("photoTools").style.display=k==="photo"?"flex":"none";$("videoTools").style.display=k==="video"?"flex":"none";$("audioTools").style.display=k==="audio"?"flex":"none";$("editPanel").style.display="none";$("video").pause();$("audio").pause();$("video").removeAttribute("src");$("audio").removeAttribute("src");$("video").load();$("audio").load();if(k==="photo")$("photo").src=u;if(k==="video"){
 $("video").src=u;videoRotation=0;videoFit="contain";$("video").style.transform="rotate(0deg)";
 $("video").style.objectFit="contain";$("video").loop=false;$("video").muted=false;
 $("loopVideo").textContent="Loop: Off";$("muteVideo").textContent="Mute";$("fitVideo").textContent="Fit: Contain";
 $("clipStart").value="0";$("clipEnd").value="";
 $("video").onloadedmetadata=()=>{$("duration").textContent=fmt($("video").duration);$("clipEnd").placeholder=String(Math.floor($("video").duration*10)/10);$("clipStatus").textContent=`Duration ${fmt($("video").duration)} · Trim export support depends on this browser.`}
}if(k==="audio"){
 $("audio").src=u;$("audioTrackName").textContent=x.name;$("audioTrackTime").textContent="0:00 / 0:00";
 $("audioSeek").value=0;$("audioStart").value="0";$("audioEnd").value="";
 $("audio").onloadedmetadata=()=>{$("audioTrackTime").textContent=`0:00 / ${fmt($("audio").duration)}`;$("audioEnd").placeholder=String(Math.floor($("audio").duration*10)/10);$("audioToolStatus").textContent=`Duration ${fmt($("audio").duration)} · WAV export is available if this browser can decode the file.`}
}$("fav").textContent=x.favorite?"♥":"♡";rotation=0;zoom=1;editRotation=0;editFlip=false;$("photo").style.filter="none";$("photo").style.transform="scale(1) rotate(0deg)";transform();stopSlide()}
function transform(){
 const p=$("photo"),stage=$("stage");
 if(!p||!stage)return;
 const w=stage.clientWidth,h=stage.clientHeight;
 p.style.transform=`scale(${zoom}) rotate(${rotation}deg)`;
 if(rotation%180){p.style.maxWidth=Math.max(0,h-12)+"px";p.style.maxHeight=Math.max(0,w-12)+"px"}
 else{p.style.maxWidth="100%";p.style.maxHeight="100%"}
}
function close(){stopSlide();$("video").pause();$("audio").pause();$("video").style.transform="rotate(0deg)";$("viewer").classList.remove("open");releaseURL($("viewer").dataset.objectUrl);$("viewer").dataset.objectUrl=""}
async function favorite(){let x=items[current];x.favorite=!x.favorite;await put(x);items=await all();$("fav").textContent=x.favorite?"♥":"♡";render()}
async function share(){let x=items[current];try{let f=new File([x.blob],x.name,{type:x.type});if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f]});else{let a=document.createElement("a");a.href=url(x);a.download=x.name;a.click();toast("Download started")}}catch(e){if(e.name!=="AbortError")toast("Share unavailable")}}
function download(blob,name){let a=document.createElement("a"),u=URL.createObjectURL(blob);a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),3000)}
$("import").onclick=()=>$("picker").click();$("picker").onchange=e=>{add(e.target.files);e.target.value=""};
document.querySelectorAll(".filters button").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll(".filters button").forEach(x=>x.classList.toggle("on",x===b));render()});$("search").oninput=render;$("sort").onchange=render;
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{page(b.dataset.page);if(b.dataset.page==="files")fileManagerRender()});$("theme").onclick=()=>document.body.classList.toggle("light");
$("close").onclick=close;$("fav").onclick=favorite;$("share").onclick=share;
$("rotate").onclick=()=>{rotation=(rotation+90)%360;transform()};$("zoom").onclick=()=>{zoom=zoom>1?1:2.5;transform()};
$("slide").onclick=()=>{if(slideTimer)stopSlide();else{slideTimer=setInterval(()=>move(1),3500);$("slide").textContent="Ⅱ Stop"}};
$("edit").onclick=()=>{let show=$("editPanel").style.display!=="flex";$("editPanel").style.display=show?"flex":"none";if(show){editRotation=0;editFlip=false;applyFilter()}};
function editorFilter(){return `brightness(${$("brightness").value}%) contrast(${$("contrast").value}%) saturate(${$("saturation").value}%) ${$("photoFilter").value==="none"?"":$("photoFilter").value}`}
function applyFilter(){
 $("photo").style.filter=editorFilter();
 $("photo").style.transform=`scale(${zoom}) rotate(${(rotation+editRotation)%360}deg) ${editFlip?"scaleX(-1)":""}`;
}
["brightness","contrast","saturation","photoFilter"].forEach(id=>$(id).addEventListener("input",applyFilter));
$("editRotate").onclick=()=>{editRotation=(editRotation+90)%360;applyFilter()};
$("editFlip").onclick=()=>{editFlip=!editFlip;applyFilter()};
$("resetEdit").onclick=()=>{$("brightness").value=100;$("contrast").value=100;$("saturation").value=100;$("photoFilter").value="none";$("resizeWidth").value="";$("resizeHeight").value="";$("overlayText").value="";$("overlaySize").value=36;editRotation=0;editFlip=false;applyFilter();toast("Editor settings reset")};
$("saveEdit").onclick=()=>{
 let x=items[current];if(!x||kind(x)!=="photo")return toast("Open a photo first");
 let im=new Image(),u=url(x);im.onload=()=>{
  try{
   const sw=im.naturalWidth,sh=im.naturalHeight,rot=((rotation+editRotation)%360+360)%360;
   let rw=parseInt($("resizeWidth").value,10),rh=parseInt($("resizeHeight").value,10);
   if(!Number.isFinite(rw)||rw<1)rw=sw;if(!Number.isFinite(rh)||rh<1)rh=sh;
   if(rw>12000||rh>12000||rw*rh>40000000){releaseURL(u);return toast("Resize is too large for this device")}
   const swap=rot===90||rot===270,ow=swap?rh:rw,oh=swap?rw:rh;
   const c=document.createElement("canvas");c.width=ow;c.height=oh;
   const ctx=c.getContext("2d");if(!ctx){releaseURL(u);return toast("Canvas is unavailable")}
   ctx.save();ctx.translate(ow/2,oh/2);ctx.rotate(rot*Math.PI/180);ctx.scale(editFlip?-1:1,1);
   ctx.filter=editorFilter();ctx.drawImage(im,-rw/2,-rh/2,rw,rh);ctx.restore();ctx.filter="none";
   const txt=$("overlayText").value.trim();if(txt){const size=Number($("overlaySize").value)||36;ctx.font=`bold ${size}px system-ui`;ctx.textAlign="center";ctx.textBaseline="bottom";ctx.lineWidth=Math.max(2,size/12);ctx.strokeStyle="rgba(0,0,0,.75)";ctx.fillStyle="#fff";ctx.strokeText(txt,ow/2,oh-size*.55);ctx.fillText(txt,ow/2,oh-size*.55)}
   const type=$("editFormat").value;
   c.toBlob(b=>{releaseURL(u);if(!b)return toast("Export failed on this browser");const ext=b.type==="image/png"?"png":b.type==="image/webp"?"webp":"jpg";download(b,`edited-${x.name.replace(/\.[^.]+$/,"")}.${ext}`);toast("Edited image exported")},type,.92);
  }catch(err){releaseURL(u);toast("Could not edit this image on this device")}
 };
 im.onerror=()=>{releaseURL(u);toast("This image format cannot be decoded")};im.src=u;
};
$("play").onclick=()=> $("video").paused?$("video").play().catch(()=>toast("Tap play to start")):$("video").pause();
$("back").onclick=()=>{$("video").currentTime=Math.max(0,$("video").currentTime-10)};$("forward").onclick=()=>{$("video").currentTime=Math.min($("video").duration||Infinity,$("video").currentTime+10)};$("speed").onchange=()=>{$("video").playbackRate=Number($("speed").value)};
$("seek").oninput=()=>{let v=$("video");if(v.duration)$("elapsed").textContent=fmt(v.duration*Number($("seek").value)/1000)};$("seek").onchange=()=>{let v=$("video");if(v.duration)v.currentTime=v.duration*Number($("seek").value)/1000};
$("video").ontimeupdate=()=>{let v=$("video");if(v.duration){$("seek").value=v.currentTime/v.duration*1000;$("elapsed").textContent=fmt(v.currentTime);$("duration").textContent=fmt(v.duration)}};$("video").onended=()=>move(1);

$("loopVideo").onclick=()=>{$("video").loop=!$("video").loop;$("loopVideo").textContent=$("video").loop?"Loop: On":"Loop: Off"};
$("muteVideo").onclick=()=>{$("video").muted=!$("video").muted;$("muteVideo").textContent=$("video").muted?"Unmute":"Mute"};
$("rotateVideo").onclick=()=>{videoRotation=(videoRotation+90)%360;$("video").style.transform=`rotate(${videoRotation}deg)`};
$("fitVideo").onclick=()=>{videoFit=videoFit==="contain"?"cover":"contain";$("video").style.objectFit=videoFit;$("fitVideo").textContent=`Fit: ${videoFit==="contain"?"Contain":"Cover"}`};
$("snapshotVideo").onclick=()=>{
 const v=$("video");if(!v.videoWidth||!v.videoHeight)return toast("Wait for video to load");
 const swap=videoRotation%180!==0,w=swap?v.videoHeight:v.videoWidth,h=swap?v.videoWidth:v.videoHeight;
 const c=document.createElement("canvas");c.width=w;c.height=h;const ctx=c.getContext("2d");
 ctx.translate(w/2,h/2);ctx.rotate(videoRotation*Math.PI/180);ctx.drawImage(v,-v.videoWidth/2,-v.videoHeight/2);
 c.toBlob(b=>{if(b)download(b,"banana-vision-frame.jpg");else toast("Frame capture failed")}, "image/jpeg",.92);
};
$("markStart").onclick=()=>{const v=$("video");$("clipStart").value=Math.max(0,v.currentTime).toFixed(1)};
$("markEnd").onclick=()=>{const v=$("video");$("clipEnd").value=Math.max(0,v.currentTime).toFixed(1)};
$("exportClip").onclick=async()=>{
 const v=$("video"),start=Number($("clipStart").value),end=$("clipEnd").value===""?v.duration:Number($("clipEnd").value);
 if(!Number.isFinite(v.duration)||!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>v.duration){$("clipStatus").textContent="Valid start/end range enter karein.";return}
 const capture=v.captureStream||v.mozCaptureStream;
 if(!capture||!window.MediaRecorder){$("clipStatus").textContent="Is browser mein direct clip export supported nahi hai. iPhone par iOS limitation ho sakti hai.";return}
 let stream,rec,chunks=[],timer;
 try{
  stream=capture.call(v);
  const mime=["video/mp4;codecs=avc1","video/webm;codecs=vp9","video/webm"].find(t=>MediaRecorder.isTypeSupported(t))||"";
  rec=new MediaRecorder(stream,mime?{mimeType:mime}:{});
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  rec.onerror=()=>{$("clipStatus").textContent="Clip recording failed on this browser."};
  rec.onstop=()=>{clearInterval(timer);stream.getTracks().forEach(t=>t.stop());const type=rec.mimeType||"video/webm";const ext=type.includes("mp4")?"mp4":"webm";download(new Blob(chunks,{type}),`banana-vision-clip.${ext}`);$("clipStatus").textContent="Clip export complete."};
  rec.start(250);v.currentTime=start;await v.play();
  timer=setInterval(()=>{if(v.currentTime>=end){v.pause();if(rec.state!=="inactive")rec.stop();clearInterval(timer)}},100);
  $("clipStatus").textContent="Recording selected clip range…";
 }catch(err){if(stream)stream.getTracks().forEach(t=>t.stop());$("clipStatus").textContent="Clip export could not start. This browser may block capture/recording."}
};
$("aplay").onclick=()=> $("audio").paused?$("audio").play().catch(()=>toast("Tap play to start")):$("audio").pause();
function audioList(){return items.filter(x=>kind(x)==="audio")}
function nextAudio(direction){
 const list=audioList();if(!list.length)return;
 let idx=list.findIndex(x=>x.id===items[current]?.id);
 if(audioShuffle&&direction>0&&list.length>1){let choices=list.filter(x=>x.id!==items[current]?.id);let pick=choices[Math.floor(Math.random()*choices.length)];return open(items.findIndex(x=>x.id===pick.id))}
 let next=idx+direction;
 if(next<0||next>=list.length){if(audioRepeat){next=(next+list.length)%list.length}else return}
 open(items.findIndex(x=>x.id===list[next].id));
}
$("aprev").onclick=()=>nextAudio(-1);$("anext").onclick=()=>nextAudio(1);
$("shuffleAudio").onclick=()=>{audioShuffle=!audioShuffle;$("shuffleAudio").textContent=audioShuffle?"Shuffle: On":"Shuffle: Off"};
$("repeatAudio").onclick=()=>{audioRepeat=!audioRepeat;$("repeatAudio").textContent=audioRepeat?"Repeat: On":"Repeat: Off";$("audio").loop=audioRepeat};
$("audio").ontimeupdate=()=>{let a=$("audio");if(a.duration){$("audioSeek").value=a.currentTime/a.duration*1000;$("audioTrackTime").textContent=`${fmt(a.currentTime)} / ${fmt(a.duration)}`}};
$("audioSeek").oninput=()=>{let a=$("audio");if(a.duration){a.currentTime=a.duration*Number($("audioSeek").value)/1000}};
$("audio").onended=()=>{if(!audioRepeat)nextAudio(1)};
$("audioMarkStart").onclick=()=>{$("audioStart").value=Math.max(0,$("audio").currentTime).toFixed(1)};
$("audioMarkEnd").onclick=()=>{$("audioEnd").value=Math.max(0,$("audio").currentTime).toFixed(1)};
function wavBlob(audioBuffer){
 const channels=audioBuffer.numberOfChannels,rate=audioBuffer.sampleRate,frames=audioBuffer.length;
 const bytes=44+frames*channels*2,buffer=new ArrayBuffer(bytes),view=new DataView(buffer);
 const write=(offset,str)=>{for(let i=0;i<str.length;i++)view.setUint8(offset+i,str.charCodeAt(i))};
 write(0,"RIFF");view.setUint32(4,bytes-8,true);write(8,"WAVE");write(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,rate,true);view.setUint32(28,rate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);write(36,"data");view.setUint32(40,bytes-44,true);
 let pos=44;for(let i=0;i<frames;i++)for(let c=0;c<channels;c++){let s=Math.max(-1,Math.min(1,audioBuffer.getChannelData(c)[i]));view.setInt16(pos,s<0?s*32768:s*32767,true);pos+=2}
 return new Blob([buffer],{type:"audio/wav"});
}
$("audioExportWav").onclick=async()=>{
 const x=items[current];if(!x||kind(x)!=="audio")return toast("Open an audio file first");
 const start=Number($("audioStart").value),end=$("audioEnd").value===""?$("audio").duration:Number($("audioEnd").value);
 if(!Number.isFinite(end)||!Number.isFinite(start)||start<0||end<=start||end>$("audio").duration){$("audioToolStatus").textContent="Valid audio start/end range enter karein.";return}
 $("audioToolStatus").textContent="Decoding audio…";
 try{
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)throw Error("AudioContext unavailable");
  const ctx=new Ctx();const raw=await x.blob.arrayBuffer();const decoded=await ctx.decodeAudioData(raw.slice(0));
  const a=Math.floor(start*decoded.sampleRate),b=Math.min(decoded.length,Math.floor(end*decoded.sampleRate));
  if(b<=a)throw Error("Empty range");
  const n=b-a,channels=decoded.numberOfChannels,copy=ctx.createBuffer(channels,n,decoded.sampleRate);
  for(let c=0;c<channels;c++)copy.copyToChannel(decoded.getChannelData(c).slice(a,b),c);
  const blob=wavBlob(copy);download(blob,`banana-vision-audio-${Math.floor(start)}-${Math.floor(end)}.wav`);
  $("audioToolStatus").textContent="WAV export complete. Original file remains unchanged.";
  await ctx.close();
 }catch(err){$("audioToolStatus").textContent="This audio format could not be decoded/exported by this browser. Try a supported audio format.";toast("Audio export unavailable")}
};
$("inspect").onclick=async()=>{let x=items.find(v=>v.id===$("infoSelect").value);if(!x)return;let out=`Name: ${x.name}\nMIME: ${x.type}\nSize: ${(x.size/1048576).toFixed(2)} MB\nAdded: ${new Date(x.added).toLocaleString()}`;if(kind(x)==="photo"){let im=new Image();im.onload=()=>{$("info").textContent=out+`\nDimensions: ${im.naturalWidth} × ${im.naturalHeight}`};im.src=url(x)}else if(kind(x)==="video"||kind(x)==="audio"){let m=document.createElement(kind(x)),u=url(x);m.onloadedmetadata=()=>{$("info").textContent=out+`\nDuration: ${fmt(m.duration)}`;URL.revokeObjectURL(u)};m.src=u}else $("info").textContent=out};
$("convertImage").onclick=()=>{let x=items.find(v=>v.id===$("imageSelect").value);if(!x||kind(x)!=="photo")return toast("Choose a photo");let im=new Image();im.onload=()=>{let c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext("2d").drawImage(im,0,0);let type=$("imageFormat").value,q=Number($("quality").value);c.toBlob(b=>{if(b)download(b,"converted-"+x.name.replace(/\.[^.]+$/,"")+(type==="image/png"?".png":type==="image/webp"?".webp":".jpg"));else toast("This format is not supported here")},type,q)};im.onerror=()=>toast("Image cannot be decoded by this browser");im.src=url(x)};

$("processImage").onclick=()=>{
 const x=items.find(v=>v.id===$("advancedImageSelect").value);
 if(!x||kind(x)!=="photo")return toast("Import and select a photo first");
 $("imageToolStatus").textContent="Processing image…";
 const im=new Image(),u=makeURL(x.blob);
 im.onload=()=>{
  try{
   let sw=im.naturalWidth,sh=im.naturalHeight;
   const mode=$("cropMode").value;
   if(mode!=="none"){
    let ratio=mode==="square"?1:mode==="4:3"?4/3:mode==="16:9"?16/9:3/4;
    if(sw/sh>ratio){let nw=sh*ratio;sw=nw}else{let nh=sw/ratio;sh=nh}
   }
   let w=parseInt($("toolWidth").value,10),h=parseInt($("toolHeight").value,10);
   if(!Number.isFinite(w)||w<1)w=Math.round(sw);if(!Number.isFinite(h)||h<1)h=Math.round(sh);
   if(w>12000||h>12000||w*h>40000000)throw Error("Requested dimensions are too large");
   const c=document.createElement("canvas");c.width=w;c.height=h;
   const ctx=c.getContext("2d");if(!ctx)throw Error("Canvas unavailable");
   const sx=(im.naturalWidth-sw)/2,sy=(im.naturalHeight-sh)/2;
   ctx.drawImage(im,sx,sy,sw,sh,0,0,w,h);
   const wm=$("watermarkText").value.trim();
   if(wm){const size=Math.max(14,Math.round(w/28));ctx.font=`bold ${size}px system-ui`;ctx.textAlign="right";ctx.textBaseline="bottom";ctx.lineWidth=Math.max(2,size/10);ctx.strokeStyle="rgba(0,0,0,.7)";ctx.fillStyle="rgba(255,255,255,.9)";ctx.strokeText(wm,w-size*.35,h-size*.35);ctx.fillText(wm,w-size*.35,h-size*.35)}
   c.toBlob(blob=>{releaseURL(u);if(!blob){$("imageToolStatus").textContent="Export format not supported by this browser.";return}download(blob,`banana-vision-processed-${x.name.replace(/\.[^.]+$/,"")}.jpg`);$("imageToolStatus").textContent=`Done: ${w} × ${h} · ${(blob.size/1024).toFixed(0)} KB. Original preserved.`}, "image/jpeg",Number($("toolQuality").value));
  }catch(err){releaseURL(u);$("imageToolStatus").textContent=err.message||"Image processing failed"}
 };
 im.onerror=()=>{releaseURL(u);$("imageToolStatus").textContent="This image format cannot be decoded by this browser."};
 im.src=u;
};
$("makePhotoPdf").onclick=()=>{
 const ids=[...$("pdfPhotoSelect").selectedOptions].map(o=>o.value);
 const selected=items.filter(x=>ids.includes(x.id)&&kind(x)==="photo");
 if(!selected.length)return toast("Select one or more photos first");
 const win=window.open("","_blank");
 if(!win){$("imageToolStatus").textContent="Popup blocked. Allow popups and try again.";return}
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const imgs=selected.map(x=>`<section><h2>${esc(x.name)}</h2><img src="${URL.createObjectURL(x.blob)}"></section>`).join("");
 win.document.open();win.document.write(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Banana Vision Photo PDF</title><style>body{font-family:Arial;margin:0}section{page-break-after:always;break-after:page;padding:12mm;min-height:90vh;box-sizing:border-box}h2{font-size:14px;overflow-wrap:anywhere}img{display:block;max-width:100%;max-height:85vh;object-fit:contain;margin:auto}@media print{section{page-break-after:always;break-after:page}}</style></head><body>${imgs}<script>window.onload=()=>setTimeout(()=>window.print(),500)<\/script></body></html>`);
 win.document.close();
};

// ZIP helper: app-generated archives use the standard STORE method (no compression).
const crcTable=(()=>{let t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);t[n]=c>>>0}return t})();
function crc32(bytes){let c=0xffffffff;for(let i=0;i<bytes.length;i++)c=crcTable[(c^bytes[i])&255]^(c>>>8);return (c^0xffffffff)>>>0}
function zipStore(entries){
 const enc=new TextEncoder(),locals=[],centrals=[];let offset=0;
 const dosDate=new Date(),time=(dosDate.getHours()<<11)|(dosDate.getMinutes()<<5)|(Math.floor(dosDate.getSeconds()/2)),date=((Math.max(1980,dosDate.getFullYear())-1980)<<9)|((dosDate.getMonth()+1)<<5)|dosDate.getDate();
 for(const entry of entries){
  const name=enc.encode(entry.name),data=entry.data instanceof Uint8Array?entry.data:new Uint8Array(entry.data),crc=crc32(data);
  const lh=new Uint8Array(30+name.length),lv=new DataView(lh.buffer);
  lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0,true);lv.setUint16(8,0,true);lv.setUint16(10,time,true);lv.setUint16(12,date,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);lv.setUint16(28,0,true);lh.set(name,30);
  locals.push(lh,data);
  const ch=new Uint8Array(46+name.length),cv=new DataView(ch.buffer);
  cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0,true);cv.setUint16(10,0,true);cv.setUint16(12,time,true);cv.setUint16(14,date,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint16(30,0,true);cv.setUint16(32,0,true);cv.setUint16(34,0,true);cv.setUint16(36,0,true);cv.setUint32(38,0,true);cv.setUint32(42,offset,true);ch.set(name,46);centrals.push(ch);offset+=lh.length+data.length;
 }
 const centralSize=centrals.reduce((n,x)=>n+x.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);
 ev.setUint32(0,0x06054b50,true);ev.setUint16(4,0,true);ev.setUint16(6,0,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);ev.setUint16(20,0,true);
 return new Blob([...locals,...centrals,end],{type:"application/zip"});
}
function unzipStore(buffer){
 const b=new Uint8Array(buffer),v=new DataView(buffer),out=[],dec=new TextDecoder();let p=0;
 while(p+30<b.length&&v.getUint32(p,true)===0x04034b50){
  const method=v.getUint16(p+8,true),size=v.getUint32(p+18,true),nameLen=v.getUint16(p+26,true),extra=v.getUint16(p+28,true);
  if(method!==0)throw Error("ZIP compression method unsupported; use ZIP exported by Banana Vision");
  const name=dec.decode(b.slice(p+30,p+30+nameLen)),start=p+30+nameLen+extra,end=start+size;
  if(end>b.length)throw Error("ZIP file is incomplete");
  const data=b.slice(start,end);
  if(crc32(data)!==v.getUint32(p+14,true))throw Error("ZIP integrity check failed: "+name);
  out.push({name,data});p=end;
 }
 return out;
}
function fileManagerRender(){
 const q=$("fileSearch").value.toLowerCase(),type=$("fileType").value,sort=$("fileSort").value;
 let list=items.filter(x=>(type==="all"||kind(x)===type)&&x.name.toLowerCase().includes(q));
 list.sort((a,b)=>sort==="name"?a.name.localeCompare(b.name):sort==="size"?b.size-a.size:b.added-a.added);
 $("fileList").innerHTML="";
 list.forEach(x=>{
  const row=document.createElement("div");row.className="file-row";
  const cb=document.createElement("input");cb.type="checkbox";cb.dataset.fileId=x.id;cb.setAttribute("aria-label","Select "+x.name);
  const info=document.createElement("div");info.className="file-name";const title=document.createElement("div");title.textContent=x.name;const meta=document.createElement("div");meta.className="file-meta";meta.textContent=`${kind(x)} · ${(x.size/1048576).toFixed(2)} MB · ${new Date(x.added).toLocaleDateString()}`;info.append(title,meta);
  const actions=document.createElement("div");actions.className="file-actions";
  const ren=document.createElement("button");ren.textContent="Rename";ren.onclick=async()=>{const n=prompt("New file name:",x.name);if(!n||!n.trim())return;x.name=n.trim();await put(x);items=await all();fileManagerRender();render()};
  const dl=document.createElement("button");dl.textContent="Download";dl.onclick=()=>download(x.blob,x.name);
  const del=document.createElement("button");del.textContent="Delete";del.onclick=async()=>{if(!confirm("Remove this item from Banana Vision library?"))return;await new Promise((ok,no)=>{let r=db.transaction(STORE,"readwrite").objectStore(STORE).delete(x.id);r.onsuccess=ok;r.onerror=()=>no(r.error)});items=await all();fileManagerRender();render()};
  actions.append(ren,dl,del);row.append(cb,info,actions);$("fileList").append(row);
 });
 $("fileStorage").textContent=`${items.length} items · ${(items.reduce((n,x)=>n+x.size,0)/1048576).toFixed(2)} MB stored in the app library.`;
}
function selectedFileItems(){const ids=[...$("fileList").querySelectorAll("input[type=checkbox]:checked")].map(x=>x.dataset.fileId);return items.filter(x=>ids.includes(x.id))}
async function exportZip(list,filename){
 if(!list.length)return toast("Select at least one file");
 $("fileStatus").textContent="Preparing ZIP backup…";
 try{
  const entries=[],manifest=[];
  for(let i=0;i<list.length;i++){const x=list[i],ext=(x.name.match(/\.[^.]+$/)||[""])[0],safe=(x.name||"media").replace(/[\/\\]/g,"_");const path=`media/${String(i+1).padStart(4,"0")}-${safe}`;entries.push({name:path,data:new Uint8Array(await x.blob.arrayBuffer())});manifest.push({path,name:x.name,type:x.type,size:x.size,added:x.added,favorite:!!x.favorite})}
  entries.push({name:"banana-vision-manifest.json",data:new TextEncoder().encode(JSON.stringify({app:"Banana Vision",version:1,items:manifest},null,2))});
  download(zipStore(entries),filename);$("fileStatus").textContent=`ZIP ready: ${list.length} media item(s). Keep another copy of important originals.`;
 }catch(e){$("fileStatus").textContent="ZIP export failed. Device memory may be insufficient."}
}
$("fileSearch").oninput=fileManagerRender;$("fileType").onchange=fileManagerRender;$("fileSort").onchange=fileManagerRender;
$("downloadSelected").onclick=()=>{const a=selectedFileItems();if(!a.length)return toast("Select files first");a.forEach(x=>download(x.blob,x.name))};
$("zipSelected").onclick=()=>exportZip(selectedFileItems(),"banana-vision-selected-backup.zip");
$("zipAll").onclick=()=>exportZip(items,"banana-vision-full-library-backup.zip");
$("importZip").onclick=()=>$("zipPicker").click();
$("zipPicker").onchange=async e=>{
 const f=e.target.files[0];e.target.value="";if(!f)return;
 $("fileStatus").textContent="Reading ZIP backup…";
 try{
  const entries=unzipStore(await f.arrayBuffer()),manifestEntry=entries.find(x=>x.name==="banana-vision-manifest.json");
  if(!manifestEntry)throw Error("Banana Vision backup manifest not found");
  const manifest=JSON.parse(new TextDecoder().decode(manifestEntry.data));let ok=0,fail=0;
  for(const m of manifest.items||[]){const entry=entries.find(x=>x.name===m.path);if(!entry){fail++;continue}
   try{const blob=new Blob([entry.data],{type:m.type||"application/octet-stream"});await put({id:crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random(),name:m.name||"Imported media",type:m.type||blob.type,size:blob.size,added:Date.now(),favorite:!!m.favorite,blob});ok++}catch(err){fail++}
  }
  items=await all();render();fileManagerRender();$("fileStatus").textContent=`Restore finished: ${ok} imported, ${fail} failed.`;
 }catch(err){$("fileStatus").textContent=err.message||"ZIP import failed"}
};
$("downloadInventory").onclick=()=>$("backup").click();

function chosenPhotos(id){const s=$(id);return [...s.selectedOptions].map(o=>items.find(x=>x.id===o.value)).filter(Boolean)}
function loadImageBlob(blob){return new Promise((resolve,reject)=>{const u=makeURL(blob),im=new Image();im.onload=()=>{releaseURL(u);resolve(im)};im.onerror=()=>{releaseURL(u);reject(Error("Image cannot be decoded"))};im.src=u})}
$("colorPicker").oninput=()=>{$("colorValue").textContent=$("colorPicker").value.toUpperCase()+" · "+(()=>{let h=$("colorPicker").value.slice(1),n=parseInt(h,16);return `rgb(${n>>16}, ${(n>>8)&255}, ${n&255})`})()};
$("copyColor").onclick=async()=>{try{await navigator.clipboard.writeText($("colorPicker").value.toUpperCase());toast("HEX copied")}catch(e){$("colorValue").textContent=$("colorPicker").value.toUpperCase()+" (copy manually)"}};
$("calcRatio").onclick=()=>{let w=Number($("ratioWidth").value),h=Number($("ratioHeight").value);if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return toast("Enter valid dimensions");let gcd=(a,b)=>b?gcd(b,a%b):a,g=gcd(Math.round(w),Math.round(h));$("ratioResult").textContent=`Aspect ratio: ${Math.round(w/g)}:${Math.round(h/g)}\\nDecimal: ${(w/h).toFixed(4)}\\n16:9 width at this height: ${(h*16/9).toFixed(0)} px\\n4:3 width at this height: ${(h*4/3).toFixed(0)} px`};
$("makeCollage").onclick=async()=>{
 const list=chosenPhotos("collageSelect");if(list.length<2||list.length>9)return toast("Select 2 to 9 photos");
 try{
  const ims=await Promise.all(list.map(x=>loadImageBlob(x.blob))),layout=$("collageLayout").value,bg=$("collageBg").value;
  const cellW=600,cellH=600,gap=8,n=ims.length;
  let cols=layout==="horizontal"?n:layout==="vertical"?1:Math.ceil(Math.sqrt(n)),rows=Math.ceil(n/cols);
  const c=document.createElement("canvas");c.width=cols*cellW+(cols+1)*gap;c.height=rows*cellH+(rows+1)*gap;
  const ctx=c.getContext("2d");ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);
  ims.forEach((im,i)=>{let col=layout==="horizontal"?i:layout==="vertical"?0:i%cols,row=layout==="horizontal"?0:layout==="vertical"?i:Math.floor(i/cols),x=gap+col*(cellW+gap),y=gap+row*(cellH+gap),scale=Math.max(cellW/im.width,cellH/im.height),sw=cellW/scale,sh=cellH/scale;ctx.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,x,y,cellW,cellH)});
  c.toBlob(b=>{if(b){download(b,"banana-vision-collage.jpg");toast("Collage exported")}else toast("Collage export failed")},"image/jpeg",.92);
 }catch(e){toast("Could not create collage")}
};
$("compareImages").onclick=async()=>{
 const a=items.find(x=>x.id===$("compareA").value),b=items.find(x=>x.id===$("compareB").value);
 if(!a||!b||a.id===b.id)return toast("Select two different photos");
 const host=$("compareResult");host.innerHTML="";
 for(const x of [a,b]){const fig=document.createElement("figure"),im=document.createElement("img"),cap=document.createElement("figcaption");im.src=makeURL(x.blob);im.onload=()=>{ /* retained until next compare render */ };cap.textContent=`${x.name} · ${(x.size/1048576).toFixed(2)} MB`;fig.append(im,cap);host.append(fig)}
};
$("ratioWidth").oninput=$("calcRatio").onclick;$("ratioHeight").oninput=$("calcRatio").onclick;
$("makeAnimation").onclick=async()=>{
 const list=chosenPhotos("animationSelect");if(list.length<2||list.length>20)return toast("Select 2 to 20 photos");
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){$("animationStatus").textContent="Animated WebM export is not supported by this browser.";return}
 let stream,rec,chunks=[];
 try{
  const ims=await Promise.all(list.map(x=>loadImageBlob(x.blob))),c=document.createElement("canvas");c.width=720;c.height=720;
  const ctx=c.getContext("2d"),frame=Math.max(200,Math.min(5000,Number($("frameTime").value)||1000));
  stream=c.captureStream(2);const mime=["video/webm;codecs=vp9","video/webm"].find(x=>MediaRecorder.isTypeSupported(x))||"";
  rec=new MediaRecorder(stream,mime?{mimeType:mime}:{});rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  rec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:rec.mimeType||"video/webm"});download(blob,"banana-vision-slideshow.webm");$("animationStatus").textContent="Animated WebM exported."};
  rec.start();let i=0;const drawFrame=()=>{const im=ims[i];ctx.fillStyle="#000";ctx.fillRect(0,0,720,720);let scale=Math.min(720/im.width,720/im.height),w=im.width*scale,h=im.height*scale;ctx.drawImage(im,(720-w)/2,(720-h)/2,w,h);i++;if(i>=ims.length){setTimeout(()=>{if(rec.state!=="inactive")rec.stop()},frame)}else setTimeout(drawFrame,frame)};
  drawFrame();$("animationStatus").textContent="Creating animation…";
 }catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());$("animationStatus").textContent="Could not create animation on this browser."}
};
$("duplicates").onclick=()=>{let m=new Map(),dupes=[];items.forEach(x=>{let k=x.size+"|"+x.name.toLowerCase();if(m.has(k))dupes.push(x.name+" (matches "+m.get(k)+")");else m.set(k,x.name)});$("dupeResult").textContent=dupes.length?dupes.join("\n"):"No likely duplicates found."};
$("backup").onclick=()=>download(new Blob([JSON.stringify(items.map(({id,name,type,size,added,favorite})=>({id,name,type,size,added,favorite})),null,2)],{type:"application/json"}),"banana-vision-library-list.json");
$("deleteLibrary").onclick=async()=>{if(confirm("Delete all imported media from this app?")){await new Promise(ok=>{let r=db.transaction(STORE,"readwrite").objectStore(STORE).clear();r.onsuccess=ok});items=[];render();close();toast("Library deleted")}};
let sx=0; $("stage").addEventListener("touchstart",e=>{if(e.touches.length===1){sx=e.touches[0].clientX;let n=Date.now();if(n-lastTap<280&&kind(items[current])==="photo"){zoom=zoom>1?1:2.5;transform()}lastTap=n}},{passive:true});
$("stage").addEventListener("touchend",e=>{if(e.changedTouches.length&&e.touches.length===0){let dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>65&&zoom===1)move(dx<0?1:-1)}},{passive:true});
$("video").addEventListener("touchend",e=>{let n=Date.now(),x=e.changedTouches[0]?.clientX||0;if(n-lastVideoTap<300){let r=$("video").getBoundingClientRect();$("video").currentTime=Math.max(0,Math.min($("video").duration||Infinity,$("video").currentTime+(x<r.left+r.width/2?-10:10)))}lastVideoTap=n},{passive:true});
window.addEventListener("resize",()=>{if($("viewer").classList.contains("open")&&items[current]&&kind(items[current])==="photo")transform()});
document.addEventListener("keydown",e=>{if(!$("viewer").classList.contains("open"))return;if(e.key==="Escape")close();if(e.key==="ArrowRight")move(1);if(e.key==="ArrowLeft")move(-1)});
(async()=>{try{db=await openDB();items=await all();render();fileManagerRender()}catch(e){$("status").textContent="Local storage unavailable in this browser."}if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{})})();
})();