const modes = {
    30: { interval: 30, timeLeft: 30, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: null, periodId: null },
    60: { interval: 60, timeLeft: 60, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: null, periodId: null },
    300: { interval: 300, timeLeft: 300, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: null, periodId: null }
};

let activeMode = 30;
const betAmount = 100;

function generatePeriodId(interval) {
    const now = new Date();
    return now.getFullYear().toString() + 
           String(now.getMonth() + 1).padStart(2, '0') + 
           String(now.getDate()).padStart(2, '0') + 
           interval + "_" + Math.floor(100 + Math.random() * 900);
}

// Initial Setup
[30, 60, 300].forEach(m => {
    modes[m].periodId = generatePeriodId(m);
    modes[m].currentPrediction = Math.random() > 0.5 ? "BIG" : "SMALL";
});

updateUI();

// Global 1-second Interval loop
setInterval(() => {
    [30, 60, 300].forEach(m => {
        modes[m].timeLeft--;

        if (modes[m].timeLeft <= 0) {
            const actualOutcome = Math.random() > 0.5 ? "BIG" : "SMALL";
            const isWin = (modes[m].currentPrediction === actualOutcome);

            modes[m].totalPlayed++;
            if (isWin) {
                modes[m].wins++;
                modes[m].profit += (betAmount * 0.95);
            } else {
                modes[m].losses++;
                modes[m].profit -= betAmount;
            }

            modes[m].history.unshift({
                period: modes[m].periodId,
                pred: modes[m].currentPrediction,
                actual: actualOutcome,
                win: isWin
            });

            if (modes[m].history.length > 15) modes[m].history.pop();

            modes[m].timeLeft = modes[m].interval;
            modes[m].periodId = generatePeriodId(m);
            modes[m].currentPrediction = Math.random() > 0.5 ? "BIG" : "SMALL";
        }
    });

    updateUI();
}, 1000);

function switchMode(newMode) {
    activeMode = newMode;
    [30, 60, 300].forEach(m => {
        const btn = document.getElementById("tab" + m);
        if (m === newMode) {
            btn.className = "py-2.5 rounded-lg bg-emerald-500 text-slate-950 transition-all cursor-pointer font-bold";
        } else {
            btn.className = "py-2.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer font-bold";
        }
    });
    document.getElementById("modeLabel").textContent = newMode === 30 ? "30s" : newMode === 60 ? "1 Min" : "5 Min";
    updateUI();
}

function updateUI() {
    const data = modes[activeMode];

    document.getElementById("statTotal").textContent = data.totalPlayed;
    document.getElementById("statWinLoss").textContent = `${data.wins} / ${data.losses}`;
    
    const profitEl = document.getElementById("statProfit");
    profitEl.textContent = `₹${data.profit.toFixed(0)}`;
    profitEl.className = `text-lg font-black ${data.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    const winRate = data.totalPlayed > 0 ? ((data.wins / data.totalPlayed) * 100).toFixed(1) : 0;
    document.getElementById("winRateBadge").textContent = `Win Rate: ${winRate}%`;

    document.getElementById("currentPeriod").textContent = data.periodId;
    document.getElementById("timerCountdown").textContent = data.timeLeft + "s";

    const sigEl = document.getElementById("activeSignal");
    sigEl.textContent = data.currentPrediction;
    sigEl.className = `text-4xl font-black mb-3 ${data.currentPrediction === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    // Update History Log
    const historyLog = document.getElementById("historyLog");
    if (data.history.length === 0) {
        historyLog.innerHTML = `<div class="text-center text-xs text-slate-500 py-4">Waiting for first completed round...</div>`;
    } else {
        historyLog.innerHTML = data.history.map(item => `
            <div class="flex justify-between items-center p-2.5 rounded-lg border text-xs ${
                item.win ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
            }">
                <div>
                    <span class="text-slate-400 font-mono">#${item.period}</span>
                    <div class="font-bold mt-0.5">Pred: <span class="${item.pred==='BIG'?'text-emerald-400':'text-rose-400'}">${item.pred}</span> | Actual: <span class="text-slate-200">${item.actual}</span></div>
                </div>
                <div class="text-right">
                    <span class="px-2 py-1 rounded font-bold ${item.win ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                        ${item.win ? 'WIN (+₹95)' : 'LOSS (-₹100)'}
                    </span>
                </div>
            </div>
        `).join('');
    }
}
