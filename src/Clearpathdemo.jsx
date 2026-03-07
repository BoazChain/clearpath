import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  bg: "#0a1a14", bg2: "#0f2218", bg3: "#142d20",
  card: "#15261e", card2: "#1a2e22",
  gold: "#c9a84c", gold2: "#e8c96a", goldDim: "rgba(201,168,76,0.15)",
  green: "#4a9d7a", greenDim: "rgba(74,157,122,0.15)",
  cream: "#f0e8d8", cream2: "#d4c8b4", cream3: "#8a7e6e",
  red: "#c9584a",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .demo-root {
    position: fixed; inset: 0; z-index: 9999;
    background: #0a1a14;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden; cursor: pointer;
  }
  .orb { position: absolute; border-radius: 50%; pointer-events: none; }

  @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-40px) scale(1.08);} 66%{transform:translate(-20px,20px) scale(0.94);} }
  @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1);} 40%{transform:translate(-35px,25px) scale(1.12);} 70%{transform:translate(20px,-30px) scale(0.92);} }
  @keyframes fadeIn  { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  @keyframes sceneIn  { from{opacity:0;transform:scale(0.97) translateY(12px);} to{opacity:1;transform:scale(1) translateY(0);} }
  @keyframes sceneOut { from{opacity:1;transform:scale(1);} to{opacity:0;transform:scale(1.02);} }
  @keyframes ringFill { from{stroke-dashoffset:283;} to{stroke-dashoffset:var(--target);} }
  @keyframes glow { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0);} 50%{box-shadow:0 0 32px 8px rgba(201,168,76,0.18);} }
  @keyframes glowGreen { 0%,100%{box-shadow:0 0 0 0 rgba(74,157,122,0);} 50%{box-shadow:0 0 28px 6px rgba(74,157,122,0.2);} }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  @keyframes msgSlideIn { from{opacity:0;transform:translateX(-20px);} to{opacity:1;transform:translateX(0);} }
  @keyframes countUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes barFill { from{width:0;} to{width:var(--w);} }
  @keyframes checkPop { 0%{transform:scale(0);opacity:0;} 70%{transform:scale(1.3);} 100%{transform:scale(1);opacity:1;} }

  @keyframes clickRipple { 0%{transform:scale(0);opacity:0.9;} 100%{transform:scale(3);opacity:0;} }
  @keyframes calloutIn { from{opacity:0;transform:translateY(8px) scale(0.95);} to{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes phoneIn { from{opacity:0;transform:translateY(40px) scale(0.94);} to{opacity:1;transform:translateY(0) scale(1);} }

  .scene { animation: sceneIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
  .scene-out { animation: sceneOut 0.5s ease forwards; }

  .phone-frame {
    animation: phoneIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
    border-radius: 40px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.06),
      0 0 0 10px #0d1f17,
      0 0 0 11px rgba(255,255,255,0.04),
      0 40px 80px rgba(0,0,0,0.7),
      0 0 60px rgba(74,157,122,0.08);
  }

  .cursor-dot {
    position: absolute;
    width: 24px; height: 24px;
    pointer-events: none; z-index: 200;
  }
  .cursor-inner {
    width: 100%; height: 100%; border-radius: 50%;
    background: rgba(255,255,255,0.92);
    box-shadow: 0 2px 14px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.12s ease;
  }
  .cursor-dot.clicking .cursor-inner { transform: scale(0.65); }

  .click-ripple {
    position: absolute;
    width: 24px; height: 24px; border-radius: 50%;
    border: 2px solid #c9a84c;
    pointer-events: none; z-index: 199;
    animation: clickRipple 0.65s ease forwards;
  }

  .callout {
    position: absolute; z-index: 300;
    background: rgba(15,34,24,0.97);
    border: 1px solid rgba(201,168,76,0.4);
    border-radius: 12px; padding: 10px 14px;
    width: 185px; pointer-events: none;
    animation: calloutIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(201,168,76,0.06);
  }
  .callout.right::after {
    content:''; position:absolute; left:-6px; top:16px;
    width:10px; height:10px;
    background: rgba(15,34,24,0.97);
    border-left:1px solid rgba(201,168,76,0.4);
    border-bottom:1px solid rgba(201,168,76,0.4);
    transform:rotate(45deg);
  }
  .callout.left::after {
    content:''; position:absolute; right:-6px; top:16px;
    width:10px; height:10px;
    background: rgba(15,34,24,0.97);
    border-right:1px solid rgba(201,168,76,0.4);
    border-top:1px solid rgba(201,168,76,0.4);
    transform:rotate(45deg);
  }

  .toggle-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    gap: 10px; padding: 10px 20px;
    background: linear-gradient(0deg, rgba(10,26,20,0.97), transparent);
    pointer-events: all;
  }
  .toggle-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(21,38,30,0.9);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 50px; padding: 6px 14px;
    cursor: pointer; transition: all 0.2s; user-select: none;
  }
  .toggle-pill:hover { border-color: rgba(201,168,76,0.55); }
  .toggle-track { width:32px; height:18px; border-radius:9px; transition:background 0.25s; position:relative; }
  .toggle-thumb { position:absolute; top:2px; width:14px; height:14px; border-radius:50%; background:white; transition:left 0.25s; box-shadow:0 1px 4px rgba(0,0,0,0.3); }
  .tap-hint { position:fixed; bottom:52px; left:50%; transform:translateX(-50%); font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:0.15em; color:rgba(240,232,216,0.38); text-transform:uppercase; animation:pulse 2.5s ease infinite; pointer-events:none; }
`;

function OrbField() {
  return (
    <>
      <div className="orb" style={{width:320,height:320,background:"radial-gradient(circle,rgba(74,157,122,0.07),transparent 70%)",top:-60,right:-80,animation:"float1 9s ease-in-out infinite"}}/>
      <div className="orb" style={{width:240,height:240,background:"radial-gradient(circle,rgba(201,168,76,0.06),transparent 70%)",bottom:80,left:-60,animation:"float2 11s ease-in-out infinite"}}/>
      <div className="orb" style={{width:180,height:180,background:"radial-gradient(circle,rgba(74,157,122,0.05),transparent 70%)",top:"40%",left:"30%",animation:"float1 13s ease-in-out infinite reverse"}}/>
    </>
  );
}

function Scene1_Logo() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%"}}>
      <OrbField/>
      <div style={{animation:"fadeIn 0.9s ease forwards",textAlign:"center"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:72,fontWeight:600,color:"#f0e8d8",lineHeight:1}}>Clear<span style={{color:"#c9a84c"}}>Path</span></div>
        <div style={{marginTop:16,fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:"#e8c96a",animation:"fadeIn 0.9s 0.4s ease both"}}>A Mindful Sobriety Companion</div>
        <div style={{marginTop:12,fontSize:12,color:"#8a7e6e",letterSpacing:"0.2em",textTransform:"uppercase",animation:"fadeIn 0.9s 0.8s ease both"}}>Free. Private. Always here.</div>
      </div>
      <div style={{marginTop:48,display:"flex",gap:40,animation:"fadeIn 0.9s 1.2s ease both"}}>
        {[["21M+","Americans in recovery"],["40%","First-year relapse rate"],["1 in 3","Cite isolation as barrier"]].map(([n,l])=>(
          <div key={n} style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,color:"#c9a84c"}}>{n}</div>
            <div style={{fontSize:9,color:"#8a7e6e",marginTop:3,maxWidth:70,lineHeight:1.4}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scene2_Streak() {
  const r=45,circ=2*Math.PI*r,offset=circ*(1-23/30);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:32}}>
      <OrbField/>
      <div style={{animation:"fadeIn 0.6s ease both",textAlign:"center"}}>
        <div style={{fontSize:11,color:"#c9a84c",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Day Counter</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#d4c8b4",fontStyle:"italic"}}>Every sober morning is a small miracle</div>
      </div>
      <div style={{position:"relative",width:160,height:160,animation:"fadeIn 0.6s 0.3s ease both"}}>
        <svg width={160} height={160} style={{transform:"rotate(-90deg)"}}>
          <circle cx={80} cy={80} r={r} fill="none" stroke="#1a2e22" strokeWidth={6}/>
          <circle cx={80} cy={80} r={r} fill="none" stroke="#c9a84c" strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ}
            style={{animation:"ringFill 2s 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards","--target":offset}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,fontWeight:600,color:"#f0e8d8",lineHeight:1}}>23</div>
          <div style={{fontSize:10,color:"#8a7e6e",letterSpacing:"0.15em",textTransform:"uppercase",marginTop:2}}>days</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,animation:"fadeIn 0.6s 1.4s ease both"}}>
        {[[1,"✓"],[7,"✓"],[30,"→"]].map(([d,s])=>(
          <div key={d} style={{padding:"6px 14px",borderRadius:50,background:s==="✓"?"rgba(201,168,76,0.15)":"transparent",border:`1px solid ${s==="✓"?"#c9a84c":"#8a7e6e44"}`,fontSize:11,color:s==="✓"?"#c9a84c":"#8a7e6e"}}>Day {d} {s}</div>
        ))}
      </div>
      <div style={{padding:"12px 24px",borderRadius:12,background:"#15261e",border:"1px solid rgba(201,168,76,0.25)",animation:"fadeIn 0.6s 2s ease both",textAlign:"center"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:"#f0e8d8"}}>Next milestone: Day 30</div>
        <div style={{fontSize:10,color:"#8a7e6e",marginTop:3}}>7 days away</div>
      </div>
    </div>
  );
}

function Scene3_Craving() {
  const [phase,setPhase]=useState(0);
  useEffect(()=>{const ts=[setTimeout(()=>setPhase(1),600),setTimeout(()=>setPhase(2),1400),setTimeout(()=>setPhase(3),2600)];return()=>ts.forEach(clearTimeout);},[]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 32px",gap:16}}>
      <OrbField/>
      <div style={{animation:"fadeIn 0.6s ease both",textAlign:"center"}}>
        <div style={{fontSize:11,color:"#c9a84c",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>Craving Journal</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#d4c8b4",fontStyle:"italic"}}>Log it. Name it. Overcome it.</div>
      </div>
      <div style={{width:"100%",maxWidth:320,background:"#15261e",borderRadius:16,padding:20,border:"1px solid rgba(201,168,76,0.15)",animation:"sceneIn 0.5s 0.2s ease both"}}>
        <div style={{fontSize:11,color:"#8a7e6e",marginBottom:10}}>What triggered this craving?</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
          {["Stress","Loneliness","Social pressure","Boredom","Anxiety"].map(t=>(
            <div key={t} style={{padding:"5px 10px",borderRadius:50,fontSize:10,background:t==="Loneliness"&&phase>=1?"rgba(201,168,76,0.15)":"#1a2e22",border:`1px solid ${t==="Loneliness"&&phase>=1?"#c9a84c":"#8a7e6e33"}`,color:t==="Loneliness"&&phase>=1?"#c9a84c":"#8a7e6e",transition:"all 0.3s"}}>{t}</div>
          ))}
        </div>
        {phase>=1&&<div style={{animation:"fadeIn 0.4s ease both"}}>
          <div style={{fontSize:11,color:"#8a7e6e",marginBottom:8}}>Intensity</div>
          <div style={{height:6,borderRadius:3,background:"#1a2e22",marginBottom:12,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#4a9d7a,#c9a84c)",animation:"barFill 0.8s 0.1s ease both",width:"65%"}}/>
          </div>
          <div style={{fontSize:10,color:"#8a7e6e",textAlign:"right",marginTop:-8,marginBottom:8}}>6 / 10</div>
        </div>}
        {phase>=2&&<div style={{padding:"10px 14px",borderRadius:8,background:"#1a2e22",fontSize:10,color:"#8a7e6e",fontStyle:"italic",animation:"fadeIn 0.4s ease both",marginBottom:12}}>"Called a friend and went for a walk instead"</div>}
        {phase>=3&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderRadius:50,background:"rgba(74,157,122,0.15)",border:"1px solid rgba(74,157,122,0.4)",animation:"checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both"}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:"#4a9d7a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white"}}>✓</div>
          <span style={{fontSize:12,color:"#4a9d7a",fontWeight:500}}>Marked as Overcome</span>
        </div>}
      </div>
    </div>
  );
}

function Scene4_Supporter() {
  const [typed,setTyped]=useState("");const [sent,setSent]=useState(false);
  const msg="I think about your courage every single morning.";
  useEffect(()=>{let i=0;const t=setInterval(()=>{if(i<msg.length){setTyped(msg.slice(0,++i));}else{clearInterval(t);setTimeout(()=>setSent(true),600);}},40);return()=>clearInterval(t);},[]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 32px",gap:20}}>
      <OrbField/>
      <div style={{animation:"fadeIn 0.6s ease both",textAlign:"center"}}>
        <div style={{fontSize:11,color:"#c9a84c",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>Supporter Portal</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#d4c8b4",fontStyle:"italic"}}>Reach them at exactly the right moment</div>
      </div>
      <div style={{width:"100%",maxWidth:320,animation:"sceneIn 0.5s 0.2s ease both"}}>
        <div style={{background:"#15261e",borderRadius:16,padding:20,border:"1px solid rgba(201,168,76,0.15)",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(201,168,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#c9a84c",fontWeight:600}}>M</div>
            <div><div style={{fontSize:13,color:"#f0e8d8",fontWeight:500}}>Mom</div><div style={{fontSize:10,color:"#4a9d7a"}}>Connected via CLRP-7423</div></div>
          </div>
          <div style={{minHeight:60,background:"#1a2e22",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#f0e8d8",lineHeight:1.6,fontStyle:"italic",border:"1px solid rgba(255,255,255,0.05)",marginBottom:12}}>
            {typed}<span style={{animation:"pulse 0.6s ease infinite",color:"#c9a84c"}}>|</span>
          </div>
          {!sent
            ?<div style={{display:"flex",gap:8}}>
              <div style={{flex:1,padding:"10px 0",borderRadius:50,textAlign:"center",background:"rgba(201,168,76,0.15)",border:"1px solid #c9a84c",fontSize:12,color:"#c9a84c"}}>Send Message</div>
              <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(201,80,74,0.12)",border:"1px solid rgba(201,80,74,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎙</div>
            </div>
            :<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px 0",animation:"checkPop 0.5s ease both"}}>
              <span style={{fontSize:18}}>💛</span>
              <span style={{fontSize:13,color:"#c9a84c",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>Sent with love</span>
            </div>
          }
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:8}}>
          {["🌟","💪","❤️","🙏"].map(e=><div key={e} style={{width:42,height:42,borderRadius:"50%",background:"#15261e",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{e}</div>)}
        </div>
      </div>
    </div>
  );
}

function Scene5_Messages() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 32px",gap:20}}>
      <OrbField/>
      <div style={{animation:"fadeIn 0.6s ease both",textAlign:"center"}}>
        <div style={{fontSize:11,color:"#c9a84c",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>Messages Tab</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#d4c8b4",fontStyle:"italic"}}>Real time. No refresh needed.</div>
      </div>
      <div style={{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:10}}>
        {[
          {from:"Mom",init:"M",col:"#c9a84c",text:"I think about your courage every single morning.",isNew:true,delay:0.3},
          {from:"Alex",init:"A",col:"#6b8cba",text:"Just wanted to say I am proud of you.",delay:0.7},
          {from:"Jordan",init:"J",col:"#7a9a6a",text:"Every sober morning is a small miracle.",delay:1.1},
        ].map(({from,init,col,text,isNew,delay})=>(
          <div key={from} style={{background:"#15261e",borderRadius:14,padding:14,border:"1px solid rgba(201,168,76,0.12)",animation:`msgSlideIn 0.5s ${delay}s ease both`,boxShadow:isNew?"0 0 24px rgba(201,168,76,0.08)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:`${col}22`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:col,fontWeight:600,flexShrink:0}}>{init}</div>
              <div style={{flex:1}}><div style={{fontSize:12,color:"#f0e8d8",fontWeight:500}}>{from}</div></div>
              {isNew&&<div style={{background:"rgba(201,168,76,0.15)",color:"#c9a84c",fontSize:9,padding:"2px 7px",borderRadius:50,border:"1px solid rgba(201,168,76,0.25)"}}>NEW</div>}
            </div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontStyle:"italic",color:"#f0e8d8",lineHeight:1.7}}>"{text}"</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scene6_AI() {
  const full="I can see you logged a craving earlier and marked it overcome. That took real strength. Loneliness is one of the hardest triggers because it whispers that reaching out is not worth it. You proved it wrong today.";
  const [streamed,setStreamed]=useState("");
  useEffect(()=>{let i=0;const t=setInterval(()=>{if(i<full.length){setStreamed(full.slice(0,++i));}else clearInterval(t);},22);return()=>clearInterval(t);},[]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 32px",gap:20}}>
      <OrbField/>
      <div style={{animation:"fadeIn 0.6s ease both",textAlign:"center"}}>
        <div style={{fontSize:11,color:"#c9a84c",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>AI Companion</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#d4c8b4",fontStyle:"italic"}}>It knows your story. Really.</div>
      </div>
      <div style={{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",justifyContent:"flex-end",animation:"fadeIn 0.4s 0.2s ease both"}}>
          <div style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:"18px 18px 4px 18px",padding:"10px 14px",maxWidth:"80%",fontSize:12,color:"#e8c96a"}}>How am I doing today?</div>
        </div>
        <div style={{display:"flex",gap:8,animation:"fadeIn 0.4s 0.5s ease both"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(74,157,122,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,marginTop:4,animation:"glowGreen 2.5s ease infinite"}}>🌿</div>
          <div style={{background:"#15261e",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"18px 18px 18px 4px",padding:"12px 16px",maxWidth:"85%"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontStyle:"italic",color:"#f0e8d8",lineHeight:1.8}}>
              {streamed}{streamed.length<full.length&&<span style={{animation:"pulse 0.6s ease infinite",color:"#c9a84c"}}>|</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Scene7_Closing() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:24}}>
      <OrbField/>
      <div style={{textAlign:"center",animation:"fadeIn 0.8s ease both"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:"#8a7e6e",marginBottom:16}}>Substance use disorder affects</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:80,fontWeight:600,color:"#c9a84c",lineHeight:1,animation:"countUp 0.8s 0.3s ease both"}}>46M</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#f0e8d8",marginTop:8,animation:"fadeIn 0.8s 0.7s ease both"}}>Americans</div>
      </div>
      <div style={{width:48,height:1,background:"rgba(201,168,76,0.2)",animation:"fadeIn 0.8s 1.1s ease both"}}/>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontStyle:"italic",color:"#d4c8b4",textAlign:"center",maxWidth:280,lineHeight:1.6,animation:"fadeIn 0.8s 1.3s ease both"}}>
        You are not alone.<br/>Recovery does not have to be silent.
      </div>
      <div style={{marginTop:12,padding:"14px 32px",borderRadius:50,background:"linear-gradient(135deg,rgba(201,168,76,0.15),rgba(74,157,122,0.1))",border:"1px solid rgba(201,168,76,0.25)",animation:"fadeIn 0.8s 1.8s ease both, glow 3s 2s ease infinite"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600,color:"#f0e8d8"}}>Clear<span style={{color:"#c9a84c"}}>Path</span></div>
      </div>
    </div>
  );
}

const CINEMATIC_SCENES=[
  {component:Scene1_Logo,     duration:4500},
  {component:Scene2_Streak,   duration:5000},
  {component:Scene3_Craving,  duration:6000},
  {component:Scene4_Supporter,duration:6000},
  {component:Scene5_Messages, duration:5000},
  {component:Scene6_AI,       duration:7000},
  {component:Scene7_Closing,  duration:5500},
];

const STEPS = [
  {screen:"role",      cx:50,cy:62, click:true,  callout:"Two roles. One app. No login required.",          side:"right", duration:2400},
  {screen:"home",      cx:50,cy:36, click:false, callout:"23 days of real progress. The ring fills live.",   side:"right", duration:2800},
  {screen:"home",      cx:75,cy:89, click:true,  callout:"Tap Cravings to log a trigger",                   side:"left",  duration:2000},
  {screen:"cravings",  cx:26,cy:44, click:true,  callout:"Select the trigger. Name the feeling.",            side:"right", duration:2200},
  {screen:"cravings2", cx:50,cy:82, click:true,  callout:"Mark it overcome. Watch the resilience build.",   side:"right", duration:2400},
  {screen:"messages",  cx:50,cy:48, click:false, callout:"Supporter messages arrive in real time. No server, no refresh.", side:"right", duration:3000},
  {screen:"messages",  cx:90,cy:93, click:true,  callout:"Open the AI Companion",                           side:"left",  duration:2000},
  {screen:"ai",        cx:50,cy:60, click:false, callout:"GPT-4o with your full recovery history as context. It actually knows you.", side:"right", duration:4000},
  {screen:"supporter", cx:50,cy:82, click:true,  callout:"Supporters send love, voice memos, and nudges.",  side:"right", duration:2800},
];

function PhoneScreen({ screen }) {
  const r=38, circ=2*Math.PI*r, offset=circ*(1-23/30);
  const TABS=[{id:"today",icon:"🌿"},{id:"cravings",icon:"🌊"},{id:"journal",icon:"📖"},{id:"messages",icon:"💛"},{id:"insights",icon:"✨"}];
  const activeTab = screen.startsWith("home") ? "today"
    : screen.startsWith("craving") ? "cravings"
    : screen==="messages"||screen==="ai" ? "messages"
    : "today";

  if(screen==="role") return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:20}}>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600,color:"#f0e8d8",textAlign:"center"}}>Clear<span style={{color:"#c9a84c"}}>Path</span></div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:11,fontStyle:"italic",color:"#8a7e6e",textAlign:"center"}}>A Mindful Sobriety Companion</div>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10,marginTop:6}}>
        <div style={{padding:"13px 0",borderRadius:50,textAlign:"center",background:"linear-gradient(135deg,rgba(74,157,122,0.2),rgba(201,168,76,0.1))",border:"1px solid rgba(201,168,76,0.4)",color:"#f0e8d8",fontSize:12,fontWeight:500}}>I am on a journey 🌿</div>
        <div style={{padding:"13px 0",borderRadius:50,textAlign:"center",background:"#1a2e22",border:"1px solid rgba(255,255,255,0.07)",color:"#8a7e6e",fontSize:12}}>I am a supporter 💛</div>
      </div>
    </div>
  );

  if(screen==="supporter") return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"14px 12px",gap:10}}>
      <div style={{fontSize:9,color:"#c9a84c",letterSpacing:"0.15em",textTransform:"uppercase"}}>Supporter Portal</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#f0e8d8"}}>Send support to someone you love</div>
      <div style={{background:"#1a2e22",borderRadius:10,padding:10,flex:1,fontSize:10,color:"#8a7e6e",fontStyle:"italic",lineHeight:1.6}}>"I think about your courage every single morning..."</div>
      <div style={{display:"flex",gap:5}}>
        {["🌟","💪","❤️","🙏"].map(e=><div key={e} style={{flex:1,height:32,borderRadius:50,background:"#1a2e22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{e}</div>)}
      </div>
      <div style={{padding:"11px 0",borderRadius:50,textAlign:"center",background:"rgba(201,168,76,0.15)",border:"1px solid #c9a84c",fontSize:11,color:"#c9a84c"}}>Send with love 💛</div>
    </div>
  );

  if(screen==="ai") return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"10px 12px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(74,157,122,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🌿</div>
        <div style={{fontSize:11,color:"#f0e8d8",fontWeight:500}}>ClearPath Companion</div>
      </div>
      <div style={{flex:1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <div style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:"12px 12px 3px 12px",padding:"7px 10px",fontSize:9,color:"#e8c96a",maxWidth:"80%"}}>How am I doing today?</div>
        </div>
        <div style={{display:"flex",gap:5}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(74,157,122,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0,marginTop:2}}>🌿</div>
          <div style={{background:"#1a2e22",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"12px 12px 12px 3px",padding:"8px 10px",maxWidth:"85%"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:10,fontStyle:"italic",color:"#f0e8d8",lineHeight:1.7}}>I can see you logged a craving and marked it overcome. That took real strength. Loneliness whispers that reaching out is not worth it. You proved it wrong.</div>
          </div>
        </div>
      </div>
      <div style={{padding:"6px 12px 10px",borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",gap:6}}>
        <div style={{flex:1,background:"#1a2e22",borderRadius:50,padding:"7px 12px",fontSize:9,color:"#8a7e6e"}}>Say anything</div>
        <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(201,168,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>↑</div>
      </div>
    </div>
  );

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"6px 14px 2px",display:"flex",justifyContent:"space-between"}}>
        <div style={{fontSize:8,color:"#8a7e6e"}}>9:41</div>
        <div style={{fontSize:8,color:"#8a7e6e"}}>●●●</div>
      </div>
      <div style={{flex:1,overflow:"hidden",padding:"0 10px"}}>
        {screen==="home"&&(
          <div style={{paddingTop:6}}>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:8,color:"#8a7e6e"}}>Good morning</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#f0e8d8"}}>Your journey continues</div>
            </div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
              <div style={{position:"relative",width:90,height:90}}>
                <svg width={90} height={90} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={45} cy={45} r={r} fill="none" stroke="#1a2e22" strokeWidth={5}/>
                  <circle cx={45} cy={45} r={r} fill="none" stroke="#c9a84c" strokeWidth={5} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:"#f0e8d8",lineHeight:1}}>23</div>
                  <div style={{fontSize:7,color:"#8a7e6e"}}>DAYS</div>
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["Mood","😌 Okay"],["Cravings","3 overcome"],["Journal","2 entries"],["Supporters","3 connected"]].map(([l,v])=>(
                <div key={l} style={{background:"#1a2e22",borderRadius:8,padding:"6px 8px"}}>
                  <div style={{fontSize:7,color:"#8a7e6e",marginBottom:2}}>{l}</div>
                  <div style={{fontSize:9,color:"#f0e8d8"}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {(screen==="cravings"||screen==="cravings2")&&(
          <div style={{paddingTop:6}}>
            <div style={{fontSize:9,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Craving Log</div>
            <div style={{background:"#1a2e22",borderRadius:10,padding:10,marginBottom:7}}>
              <div style={{fontSize:8,color:"#8a7e6e",marginBottom:7}}>What triggered this?</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {["Stress","Loneliness","Social","Boredom","Anxiety"].map(t=>(
                  <div key={t} style={{padding:"3px 7px",borderRadius:50,fontSize:7,background:t==="Loneliness"&&screen==="cravings2"?"rgba(201,168,76,0.15)":"#15261e",border:`1px solid ${t==="Loneliness"&&screen==="cravings2"?"#c9a84c":"#8a7e6e22"}`,color:t==="Loneliness"&&screen==="cravings2"?"#c9a84c":"#8a7e6e"}}>{t}</div>
                ))}
              </div>
            </div>
            {screen==="cravings2"&&<>
              <div style={{background:"#1a2e22",borderRadius:10,padding:10,marginBottom:7}}>
                <div style={{fontSize:8,color:"#8a7e6e",marginBottom:5}}>Intensity: 6/10</div>
                <div style={{height:4,borderRadius:2,background:"#15261e",overflow:"hidden"}}>
                  <div style={{height:"100%",width:"65%",borderRadius:2,background:"linear-gradient(90deg,#4a9d7a,#c9a84c)"}}/>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:50,background:"rgba(74,157,122,0.15)",border:"1px solid rgba(74,157,122,0.4)",animation:"checkPop 0.5s ease both"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:"#4a9d7a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"white"}}>✓</div>
                <span style={{fontSize:9,color:"#4a9d7a"}}>Marked as Overcome</span>
              </div>
            </>}
          </div>
        )}
        {screen==="messages"&&(
          <div style={{paddingTop:6}}>
            <div style={{fontSize:9,color:"#c9a84c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Messages</div>
            {[
              {from:"Mom",init:"M",col:"#c9a84c",text:"I think about your courage every single morning.",isNew:true},
              {from:"Alex",init:"A",col:"#6b8cba",text:"So proud of you. No agenda, just that."},
              {from:"Jordan",init:"J",col:"#7a9a6a",text:"Every sober morning is a miracle."},
            ].map(({from,init,col,text,isNew})=>(
              <div key={from} style={{background:"#1a2e22",borderRadius:10,padding:8,marginBottom:7,border:"1px solid rgba(255,255,255,0.03)"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:`${col}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:col,fontWeight:600}}>{init}</div>
                  <div style={{flex:1,fontSize:9,color:"#f0e8d8"}}>{from}</div>
                  {isNew&&<div style={{background:"rgba(201,168,76,0.15)",color:"#c9a84c",fontSize:7,padding:"1px 5px",borderRadius:50}}>NEW</div>}
                </div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:9,fontStyle:"italic",color:"#8a7e6e",lineHeight:1.5}}>"{text}"</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{padding:"5px 4px 6px",borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-around"}}>
        {TABS.map(t=>(
          <div key={t.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div style={{fontSize:12}}>{t.icon}</div>
            <div style={{width:3,height:3,borderRadius:"50%",background:t.id===activeTab?"#c9a84c":"transparent",transition:"all 0.2s"}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalkthroughDemo() {
  const [step,setStep]       = useState(0);
  const [clicking,setClicking] = useState(false);
  const [ripple,setRipple]   = useState(false);
  const [showCallout,setShowCallout] = useState(false);
  const stepTimer = useRef(null);

  const cur = STEPS[step];
  const PHONE_W=260, PHONE_H=500;
  const cx=(cur.cx/100)*PHONE_W;
  const cy=(cur.cy/100)*PHONE_H;

  useEffect(()=>{
    setShowCallout(false); setClicking(false); setRipple(false);
    const t1=setTimeout(()=>setShowCallout(true),500);
    let t2=null;
    if(cur.click){
      t2=setTimeout(()=>{
        setClicking(true);
        setTimeout(()=>{setRipple(true);setClicking(false);},120);
        setTimeout(()=>setRipple(false),700);
      },cur.duration-900);
    }
    stepTimer.current=setTimeout(()=>setStep(s=>(s+1)%STEPS.length),cur.duration);
    return()=>{clearTimeout(t1);if(t2)clearTimeout(t2);clearTimeout(stepTimer.current);};
  },[step]);

  const calloutX = cur.side==="right" ? PHONE_W+16 : -(190+16);
  const calloutY = Math.max(10,Math.min(cy-20,PHONE_H-80));

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:20}}>
      <OrbField/>
      <div style={{textAlign:"center",animation:"fadeIn 0.6s ease both",zIndex:10}}>
        <div style={{fontSize:10,color:"#c9a84c",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>Interactive Walkthrough</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#d4c8b4",fontStyle:"italic"}}>Watch ClearPath in action</div>
      </div>

      <div style={{position:"relative",zIndex:10}}>
        {}
        <div className="phone-frame" style={{width:PHONE_W,height:PHONE_H,background:"#0a1a14",overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:70,height:18,background:"#0a1a14",borderRadius:"0 0 14px 14px",zIndex:50}}/>
          <PhoneScreen screen={cur.screen}/>
        </div>

        {}
        <div
          className={`cursor-dot${clicking?" clicking":""}`}
          style={{left:cx-12,top:cy-12,position:"absolute",transition:"left 0.65s cubic-bezier(0.16,1,0.3,1), top 0.65s cubic-bezier(0.16,1,0.3,1)"}}
        >
          <div className="cursor-inner">
            <div style={{width:6,height:6,borderRadius:"50%",background:"#0a1a14",opacity:0.5}}/>
          </div>
        </div>

        {}
        {ripple&&<div className="click-ripple" style={{left:cx-12,top:cy-12,position:"absolute"}}/>}

        {}
        {showCallout&&(
          <div className={`callout ${cur.side}`} style={{left:calloutX,top:calloutY}}>
            <div style={{fontSize:11,color:"#f0e8d8",lineHeight:1.55,fontFamily:"'DM Sans',sans-serif"}}>{cur.callout}</div>
          </div>
        )}
      </div>

      {}
      <div style={{display:"flex",gap:5,zIndex:10}}>
        {STEPS.map((_,i)=>(
          <div key={i} style={{width:i===step?16:5,height:5,borderRadius:3,background:i===step?"#c9a84c":"rgba(240,232,216,0.15)",transition:"all 0.3s"}}/>
        ))}
      </div>
    </div>
  );
}

export default function ClearPathDemo({ children }) {
  const [active,  setActive]  = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [mode,    setMode]    = useState("cinematic");
  const [scene,   setScene]   = useState(0);
  const [exiting, setExiting] = useState(false);
  const idleTimer  = useRef(null);
  const sceneTimer = useRef(null);
  const IDLE_DELAY = 8000;

  const stopDemo = useCallback(()=>{ if(active) setActive(false); },[active]);

  const resetIdle = useCallback(()=>{
    clearTimeout(idleTimer.current);
    if(enabled) idleTimer.current=setTimeout(()=>{ setScene(0); setActive(true); },IDLE_DELAY);
  },[enabled]);

  useEffect(()=>{ if(!active) resetIdle(); return()=>clearTimeout(idleTimer.current); },[active,resetIdle]);

  useEffect(()=>{
    if(!active||mode!=="cinematic") return;
    clearTimeout(sceneTimer.current);
    sceneTimer.current=setTimeout(()=>{
      setExiting(true);
      setTimeout(()=>{ setExiting(false); setScene(s=>(s+1)%CINEMATIC_SCENES.length); },500);
    },CINEMATIC_SCENES[scene].duration);
    return()=>clearTimeout(sceneTimer.current);
  },[active,mode,scene]);

  useEffect(()=>{
    if(!active) return;
    const kill=(e)=>{ if(e.target.closest(".toggle-bar")) return; stopDemo(); };
    window.addEventListener("click",kill); window.addEventListener("keydown",kill);
    window.addEventListener("touchstart",kill); window.addEventListener("scroll",kill);
    return()=>{ window.removeEventListener("click",kill); window.removeEventListener("keydown",kill); window.removeEventListener("touchstart",kill); window.removeEventListener("scroll",kill); };
  },[active,stopDemo]);

  const SceneComp=CINEMATIC_SCENES[scene].component;

  return (
    <div style={{position:"relative",width:"100%",height:"100vh"}}>
      <style>{css}</style>
      <div style={{width:"100%",height:"100%"}}>{children}</div>

      {active&&(
        <div className="demo-root">
          {mode==="cinematic"
            ?<div className={exiting?"scene-out":"scene"} style={{height:"100%"}}><SceneComp key={scene}/></div>
            :<div className="scene" style={{height:"100%"}}><WalkthroughDemo key="wt"/></div>
          }

          {mode==="cinematic"&&(
            <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6,zIndex:10001,pointerEvents:"none"}}>
              {CINEMATIC_SCENES.map((_,i)=>(
                <div key={i} style={{width:i===scene?18:6,height:6,borderRadius:3,background:i===scene?"#c9a84c":"rgba(240,232,216,0.2)",transition:"all 0.3s"}}/>
              ))}
            </div>
          )}

          <div className="tap-hint">Tap anywhere to begin</div>

          <div className="toggle-bar" onClick={e=>e.stopPropagation()}>
            {}
            <div style={{display:"flex",background:"rgba(21,38,30,0.92)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:50,overflow:"hidden"}}>
              {[["cinematic","🎬 Cinematic"],["walkthrough","👆 Walkthrough"]].map(([m,label])=>(
                <div key={m} onClick={()=>{ setMode(m); setScene(0); }} style={{padding:"6px 14px",fontSize:10,cursor:"pointer",background:mode===m?"rgba(201,168,76,0.15)":"transparent",color:mode===m?"#c9a84c":"#8a7e6e",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s",borderRight:m==="cinematic"?"1px solid rgba(201,168,76,0.15)":"none",userSelect:"none"}}>{label}</div>
              ))}
            </div>
            {}
            <div className="toggle-pill" onClick={()=>setEnabled(e=>{ if(e){setActive(false);clearTimeout(idleTimer.current);} return !e; })}>
              <div className="toggle-track" style={{background:enabled?"#4a9d7a":"#1a2e22"}}>
                <div className="toggle-thumb" style={{left:enabled?16:2}}/>
              </div>
              <span style={{fontSize:11,color:"#8a7e6e",fontFamily:"'DM Sans',sans-serif"}}>Auto demo {enabled?"on":"off"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}