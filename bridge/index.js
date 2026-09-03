const http = require('http');

const SCANNER = process.env.SCANNER_URL || 'http://localhost:8787';
const ENGINE = process.env.ENGINE_URL || 'http://localhost:8790';
const TOKEN = process.env.ENGINE_TOKEN || 'meme-trader-local-2026';
const PORT = Number(process.env.BRIDGE_PORT || 8791);
const MIN_SCORE = Number(process.env.MIN_SCORE || 70);
const POSITION_USD = Number(process.env.POSITION_USD || 10);
const STOP_LOSS = Number(process.env.STOP_LOSS_PCT || 12) / 100;
const TAKE_PROFIT = Number(process.env.TAKE_PROFIT_PCT || 25) / 100;
const TRAILING_STOP = Number(process.env.TRAILING_STOP_PCT || 20) / 100;

let seen = new Set();
const state = { scannerOk:false, engineOk:false, paperMode:false, lastPoll:null, lastForwarded:0, lastAutoExits:0, lastError:null };

async function json(url, options={}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!response.ok) throw new Error(`${response.status} ${text}`);
  return body;
}

async function engineHealth(){
  const health = await json(`${ENGINE}/health`);
  state.paperMode = health.mode === 'paper';
  return health;
}

async function closePosition(p, reason){
  await json(`${ENGINE}/positions/${encodeURIComponent(p.tokenAddress)}/close`, {
    method:'POST', headers:{authorization:`Bearer ${TOKEN}`}
  });
  state.lastAutoExits += 1;
  console.log(`[bridge] auto-exit ${p.symbol || p.tokenAddress.slice(0,8)} reason=${reason}`);
}

async function poll(){
  state.lastPoll = new Date().toISOString();
  try { await json(`${SCANNER}/health`); state.scannerOk = true; }
  catch (e) { state.scannerOk = false; state.lastError = `scanner: ${e.message}`; }
  try { await engineHealth(); state.engineOk = true; }
  catch (e) { state.engineOk = false; state.paperMode = false; state.lastError = `engine: ${e.message}`; }
  if (!state.scannerOk || !state.engineOk || !state.paperMode) return;

  try {
    const result = await json(`${SCANNER}/candidates`);
    const candidates = Array.isArray(result) ? result : (result.candidates || []);
    for (const candidate of candidates) {
      const tokenAddress = candidate.tokenAddress || candidate.address || candidate.mint;
      if (!tokenAddress || seen.has(tokenAddress)) continue;
      const score = Number(candidate.score || 0);
      if (candidate.riskPassed === false || score < MIN_SCORE) continue;
      await json(`${ENGINE}/scanner/signal`, {
        method:'POST', headers:{'content-type':'application/json',authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({tokenAddress,symbol:candidate.symbol||candidate.name||'TOKEN',score,grade:candidate.grade||'',riskPassed:true,liquidityUsd:Number(candidate.liquidityUsd||0),positionUsd:POSITION_USD,source:'scanner-bridge'})
      });
      seen.add(tokenAddress); state.lastForwarded += 1;
      if (seen.size > 500) seen = new Set([...seen].slice(-250));
    }
  } catch (e) { state.lastError = `forward: ${e.message}`; }

  // Paper-only exit safety layer. It never sends a wallet transaction.
  try {
    const positions = await json(`${ENGINE}/positions`);
    for (const p of Array.isArray(positions) ? positions : []) {
      const entry = Number(p.entryPriceUsd), current = Number(p.currentPriceUsd);
      if (!(entry > 0 && current > 0)) continue;
      const change = current / entry - 1;
      if (change <= -STOP_LOSS) await closePosition(p, 'stop_loss');
      else if (change >= TAKE_PROFIT) await closePosition(p, 'take_profit');
    }
  } catch (e) { state.lastError = `exit-monitor: ${e.message}`; }
}

const server = http.createServer(async (req,res)=>{
  res.setHeader('access-control-allow-origin','*');
  res.setHeader('access-control-allow-methods','GET,POST,OPTIONS');
  res.setHeader('access-control-allow-headers','content-type,authorization');
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  try{
    if(req.url==='/health'||req.url==='/status'){res.setHeader('content-type','application/json');return res.end(JSON.stringify({ok:true,service:'scanner-engine-bridge',...state,scanner:SCANNER,engine:ENGINE,minScore:MIN_SCORE,positionUsd:POSITION_USD,stopLossPct:STOP_LOSS*100,takeProfitPct:TAKE_PROFIT*100}))}
    if(req.url==='/positions') return proxy(res,`${ENGINE}/positions`);
    if(req.url==='/trades') return proxy(res,`${ENGINE}/trades`);
    if(req.url==='/scanner/stats') return proxy(res,`${SCANNER}/stats`);
    if(req.url==='/scanner/candidates') return proxy(res,`${SCANNER}/candidates`);
    res.writeHead(404,{'content-type':'application/json'});res.end(JSON.stringify({error:'not_found'}));
  }catch(e){res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({error:e.message}))}
});

async function proxy(res,url){const body=await json(url);res.setHeader('content-type','application/json');res.end(JSON.stringify(body));}
server.listen(PORT,()=>console.log(`[bridge] listening on http://localhost:${PORT}`));
setInterval(poll,2000);poll();
