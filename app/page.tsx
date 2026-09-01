'use client';

import { useMemo, useState } from 'react';

type Tab = 'dashboard' | 'daily';

function money(value: number) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(2)}`;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const now = new Date();

  // These are intentionally zero until the dashboard is connected to the trading engine.
  // The table structure is ready for real daily/monthly trade P/L data.
  const daily = useMemo(() => {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, pnl: 0 }));
  }, [now]);

  const monthly = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(now.getFullYear(), i, 1).toLocaleString('en-US', { month: 'long' }),
      pnl: 0,
    }));
  }, [now]);

  const monthName = now.toLocaleString('en-US', { month: 'long' });

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">
          <h1>Meme Trader Bot</h1>
          <p className="muted">Trading control center</p>
        </div>
        <div className="status"><span className="dot" />READY</div>
      </header>

      <nav className="tabs" aria-label="Dashboard navigation">
        <button className={tab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={tab === 'daily' ? 'tab active' : 'tab'} onClick={() => setTab('daily')}>Daily P/L</button>
        <button className="tab" disabled>Calculator</button>
        <button className="tab" disabled>Profit Goals</button>
      </nav>

      {tab === 'dashboard' ? (
        <>
          <div className="grid">
            <div className="card"><div className="label">Account Balance</div><div className="value">$100.00</div></div>
            <div className="card"><div className="label">Today's P/L</div><div className="value">$0.00</div></div>
            <div className="card"><div className="label">Win Rate</div><div className="value">0.0%</div></div>
            <div className="card"><div className="label">Open Positions</div><div className="value">0</div></div>
          </div>

          <div className="layout">
            <section className="card">
              <div className="sectionHead"><h2>Open Positions</h2><button className="btn" onClick={() => setTab('daily')}>View P/L</button></div>
              <div className="empty">No open positions</div>
            </section>
            <section className="card">
              <h2>Bot Status</h2>
              <div className="row"><span>Trading Engine</span><span className="pill">PAPER</span></div>
              <div className="row"><span>Automatic Exits</span><span className="pill">READY</span></div>
              <div className="row"><span>Scanner</span><span className="pill">NOT CONNECTED</span></div>
            </section>
          </div>
        </>
      ) : (
        <section className="pnlPage">
          <div className="pageTitle">
            <div><h2>Profit & Loss</h2><p className="muted">Daily results and monthly totals for {now.getFullYear()}</p></div>
            <div className="pnlSummary"><span className="label">Year P/L</span><strong>$0.00</strong></div>
          </div>

          <div className="pnlGrid">
            <div className="card">
              <div className="sectionHead"><h2>{monthName} — Daily P/L</h2><span className="pill">{daily.length} days</span></div>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>Day</th><th>Date</th><th>P/L</th><th>Status</th></tr></thead>
                  <tbody>
                    {daily.map(({ day, pnl }) => {
                      const date = new Date(now.getFullYear(), now.getMonth(), day);
                      const isFuture = date > now;
                      return <tr key={day} className={isFuture ? 'future' : ''}>
                        <td>{day}</td>
                        <td>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td className={pnl < 0 ? 'loss' : pnl > 0 ? 'profit' : ''}>{isFuture ? '—' : money(pnl)}</td>
                        <td>{isFuture ? 'Upcoming' : pnl === 0 ? 'No P/L' : 'Closed'}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="sectionHead"><h2>Monthly P/L</h2><span className="pill">{now.getFullYear()}</span></div>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>Month</th><th>P/L</th><th>Status</th></tr></thead>
                  <tbody>
                    {monthly.map(({ month, pnl }, i) => {
                      const future = i > now.getMonth();
                      return <tr key={month} className={future ? 'future' : ''}>
                        <td>{month}</td>
                        <td className={pnl < 0 ? 'loss' : pnl > 0 ? 'profit' : ''}>{future ? '—' : money(pnl)}</td>
                        <td>{future ? 'Upcoming' : pnl === 0 ? 'No P/L' : 'Closed'}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card note"><strong>Data connection:</strong> Daily and monthly values are currently placeholders at $0.00. Once the dashboard is connected to the trading engine's trade history, these rows will be calculated from actual closed trades by local calendar day and month.</div>
        </section>
      )}
    </main>
  );
}
