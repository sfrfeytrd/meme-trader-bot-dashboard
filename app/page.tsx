'use client';

import { useMemo, useState } from 'react';

type Tab = 'Overview' | 'Daily P&L' | 'Calculator' | 'Profit Goals';

const monthPnl = [82.4,146.8,-31.2,218.6,94.1,176.3,249.7,121.4,0,0,0,0];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const demoDays = [0,0,12.4,-4.2,8.7,0,18.1,-7.3,5.2,0,11.8,-2.1,0,24.6,-5.4,9.3,0,14.2,-3.8,7.1,0,16.9,-6.2,4.4,0,21.5,-8.1,6.8,0,13.7];

function money(n:number){return `${n<0?'-':'+'}$${Math.abs(n).toFixed(2)}`}
function Stat({title,value,sub,accent=''}:{title:string,value:string,sub:string,accent?:string}){return <div className="stat-card"><div className="stat-label">{title}</div><div className={`stat-value ${accent}`}>{value}</div><div className="stat-sub">{sub}</div></div>}

export default function Home(){
 const [tab,setTab]=useState<Tab>('Overview'); const [paused,setPaused]=useState(false);
 const [size,setSize]=useState('10'),[sl,setSl]=useState('12'),[tp,setTp]=useState('25'),[goal,setGoal]=useState('1000');
 const now=new Date(); const year=now.getFullYear(); const currentMonth=now.getMonth();
 const daily=useMemo(()=>Array.from({length:new Date(year,currentMonth+1,0).getDate()},(_,i)=>({day:i+1,pnl:demoDays[i]??0})),[year,currentMonth]);
 const monthTotal=monthPnl[currentMonth]??0; const yearTotal=monthPnl.reduce((a,b)=>a+b,0);
 return <main className="shell">
  <aside className="sidebar">
   <div className="brand"><div className="logo">M<span>+</span></div><div><b>MEME TRADER</b><small>TRADING TERMINAL</small></div></div>
   <div className="mode"><i/> PAPER MODE</div>
   <div className="side-title">WORKSPACE</div>
   <nav>{(['Overview','Daily P&L','Calculator','Profit Goals'] as Tab[]).map((x,i)=><button key={x} onClick={()=>setTab(x)} className={tab===x?'nav active':'nav'}><span>{['⌂','▥','⌗','◎'][i]}</span>{x}</button>)}</nav>
   <div className="side-bottom"><div className="side-title">CONNECTIONS</div><div className="conn"><i/><div><b>Trading Engine</b><small>localhost:8790</small></div></div><div className="conn"><i className="amber"/><div><b>Scanner</b><small>Waiting for signal</small></div></div><div className="side-footer">v1.0 • PAPER SAFE</div></div>
  </aside>
  <section className="main">
   <header className="header"><div><div className="crumb">SOLANA / MEME STRATEGY / <b>{tab.toUpperCase()}</b></div><h1>{tab}</h1></div><div className="header-right"><div className="ready"><i/> SYSTEM READY</div><button className="round">↻</button><div className="avatar">S</div></div></header>
   {tab==='Overview' && <>
    <div className="stats"><div className="equity stat-card"><div className="stat-top"><span>ACCOUNT EQUITY</span><b>PAPER</b></div><div className="equity-value">$100.00</div><div className="equity-meta"><span>Available</span><strong>$100.00</strong></div><div className="spark">{[32,45,39,58,51,64,59,75,69,88,79,96].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div></div><Stat title="TODAY'S P&L" value="$0.00" sub="0.00% • No closed trades"/><Stat title="REALIZED P&L" value="$0.00" sub="All time • 0 trades"/><Stat title="WIN RATE" value="0.0%" sub="0 wins • 0 losses"/></div>
    <div className="section-heading"><div><h2>Portfolio</h2><p>Live account and execution overview</p></div><button onClick={()=>setTab('Daily P&L')} className="text-btn">View performance →</button></div>
    <div className="two-col"><section className="panel positions"><PanelHead title="Open Positions" sub="Currently held assets" badge="0 ACTIVE"/><div className="empty"><div className="empty-symbol">◇</div><b>No open positions</b><span>Qualifying scanner signals will appear here when the trading engine is connected.</span></div></section>
    <section className="panel controls"><PanelHead title="Bot Controls" sub="Execution & risk parameters" badge={paused?'PAUSED':'RUNNING'} /><button className={paused?'primary full':'pause full'} onClick={()=>setPaused(!paused)}>{paused?'▶  Resume Bot':'Ⅱ  Pause Bot'}</button><button className="close full">Close All Positions</button><Field label="Position Size" suffix="USD" value={size} set={setSize}/><Field label="Stop Loss" suffix="%" value={sl} set={setSl}/><Field label="Take Profit" suffix="%" value={tp} set={setTp}/><button className="save full">Save Risk Settings</button></section></div>
    <div className="lower"><section className="panel performance"><PanelHead title="Equity Performance" sub="Last 30 days" badge="PAPER"/><div className="chart"><div className="ylabels"><span>$120</span><span>$110</span><span>$100</span><span>$90</span></div><svg viewBox="0 0 700 190" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#23e58a" stopOpacity=".28"/><stop offset="1" stopColor="#23e58a" stopOpacity="0"/></linearGradient></defs><path d="M0 150 C55 148 75 142 110 145 S160 132 200 137 S250 115 285 125 S330 112 365 116 S415 90 450 100 S500 72 535 83 S580 57 620 65 S665 38 700 42 L700 190 L0 190Z" fill="url(#g)"/><path d="M0 150 C55 148 75 142 110 145 S160 132 200 137 S250 115 285 125 S330 112 365 116 S415 90 450 100 S500 72 535 83 S580 57 620 65 S665 38 700 42" fill="none" stroke="#23e58a" strokeWidth="3"/></svg></div></section><section className="panel activity"><PanelHead title="System Activity" sub="Live engine status"/><Activity name="Trading Engine" text="Connected • Paper mode"/><Activity name="Risk Manager" text={`TP ${tp}% • SL ${sl}%`}/><Activity name="Scanner" text="Waiting for qualifying signal" amber/><Activity name="Execution" text="No active positions"/></section></div>
   </>}
   {tab==='Daily P&L' && <><div className="stats"><Stat title="YEAR TO DATE" value={money(yearTotal)} sub={`${year} realized P/L`} accent="green"/><Stat title="CURRENT MONTH" value={money(monthTotal)} sub={now.toLocaleString('en-US',{month:'long'})+' performance'} accent="green"/><Stat title="BEST MONTH" value={money(Math.max(...monthPnl))} sub="Best monthly result" accent="green"/><Stat title="TRADING DAYS" value={`${daily.filter(x=>x.pnl!==0).length}`} sub="Days with P/L"/></div><div className="pnl-columns"><section className="panel"><PanelHead title={`${now.toLocaleString('en-US',{month:'long'})} Daily P&L`} sub={`${year} • realized results`} badge={money(monthTotal)}/><div className="day-grid">{daily.map(d=><div className={`day ${d.pnl>0?'up':d.pnl<0?'down':''}`} key={d.day}><small>{d.day}</small><b>{d.pnl===0?'—':money(d.pnl)}</b></div>)}</div></section><section className="panel"><PanelHead title={`${year} Monthly P&L`} sub="Full-year performance" badge={money(yearTotal)}/><div className="months">{months.map((m,i)=><div className="month" key={m}><span>{m}</span><div><i style={{width:`${Math.min(100,Math.abs(monthPnl[i])/250*100)}%`}}/></div><b className={monthPnl[i]<0?'negative':''}>{i>currentMonth?'—':money(monthPnl[i])}</b></div>)}</div></section></div></>}
   {tab==='Calculator' && <div className="tool-columns"><section className="panel calculator"><PanelHead title="Position Calculator" sub="Plan your risk before entering a trade"/><Field label="Account Balance" suffix="USD" value="100"/><Field label="Risk Per Trade" suffix="%" value="2"/><Field label="Entry Price" suffix="USD" value="0.000000"/><Field label="Stop Price" suffix="USD" value="0.000000"/><div className="result"><span>Maximum risk</span><b>$2.00</b></div><button className="save full">Calculate Position</button></section><section className="panel"><PanelHead title="Current Risk Settings" sub="From trading engine"/><Risk n="Position Size" v={`$${size}`}/><Risk n="Stop Loss" v={`${sl}%`}/><Risk n="Take Profit" v={`${tp}%`}/><Risk n="Mode" v="PAPER" green/></section></div>}
   {tab==='Profit Goals' && <div className="goal-grid"><section className="panel goal"><div className="eyebrow">TARGET TRACKER</div><h2>Profit Goal</h2><p>Track realized profit against your target.</p><div className="goal-value">$0 <small>/ ${Number(goal||0).toLocaleString()}</small></div><div className="progress"><i/></div><div className="goal-form"><label>Target</label><input value={goal} onChange={e=>setGoal(e.target.value)}/><button className="save">Update Goal</button></div></section><div className="goal-stats"><Stat title="CURRENT PROFIT" value="$0.00" sub="0% of goal"/><Stat title="REMAINING" value={`$${Number(goal||0).toLocaleString()}`} sub="Until target"/></div></div>}
  </section>
 </main>
}
function PanelHead({title,sub,badge}:{title:string,sub:string,badge?:string}){return <div className="panel-head"><div><h3>{title}</h3><span>{sub}</span></div>{badge&&<em>{badge}</em>}</div>}
function Field({label,suffix,value,set}:{label:string,suffix:string,value:string,set?:(v:string)=>void}){return <label className="field"><span>{label}<i>{suffix}</i></span><input value={value} onChange={e=>set?.(e.target.value)} readOnly={!set}/></label>}
function Activity({name,text,amber}:{name:string,text:string,amber?:boolean}){return <div className="activity-row"><i className={amber?'amber':''}/><div><b>{name}</b><span>{text}</span></div><small>NOW</small></div>}
function Risk({n,v,green}:{n:string,v:string,green?:boolean}){return <div className="risk"><span>{n}</span><b className={green?'green':''}>{v}</b></div>}
