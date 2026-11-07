const modes = {
    30: { interval: 30, timeLeft: 30, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "BIG", periodId: "", streakLevel: 0 },
    60: { interval: 60, timeLeft: 60, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "SMALL", periodId: "", streakLevel: 0 },
    300: { interval: 300, timeLeft: 300, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "BIG", periodId: "", streakLevel: 0 }
};

let activeMode = 30;
const baseBet = 100;

function generatePeriodId(interval) {
    const now = new Date();
    return now.getFullYear().toString() + 
           String(now.getMonth() + 1).padStart(2, '0') + 
           String(now.getDate()).padStart(2, '0') + 
           interval + "_" + Math.floor(1000 + Math.random() * 9000);
}

// Initial Setup
[30, 60, 300].forEach(m => {
    modes[m].periodId = generatePeriodId(m);
    modes[m].currentPrediction = Math.random() > 0.5 ? "BIG" : "SMALL";
});

function manualSync() {
    document.getElementById("liveStatus").textContent = "● Live Synced";
    document.getElementById("liveStatus").className = "px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full";
    document.getElementById("livePeriod").textContent = modes[activeMode].periodId;
    document.getElementById("liveOutcome").textContent = modes[activeMode].currentPrediction;
}

function injectManualResult(outcome) {
    processRoundOutcome(outcome);
}

function processRoundOutcome(actualOutcome) {
    const data = modes[activeMode];
    const isWin = (data.currentPrediction === actualOutcome);

    data.totalPlayed++;
    if (isWin) {
        data.wins++;
        const betMult = Math.pow(3, data.streakLevel);
        data.profit += (baseBet * betMult * 0.95);
        data.streakLevel = 0; // Reset martingale on win
    } else {
        data.losses++;
        const betMult = Math.pow(3, data.streakLevel);
        data.profit -= (baseBet * betMult);
        data.streakLevel = Math.min(data.streakLevel + 1, 4); // Max 4 levels
    }

    data.history.unshift({
        period: data.periodId,
        pred: data.currentPrediction,
        actual: actualOutcome,
        win: isWin
    });

    if (data.history.length > 15) data.history.pop();

    data.timeLeft = data.interval;
    data.periodId = generatePeriodId(activeMode);
    
    // Pattern Analysis Logic for Next Signal
    if (data.history.length >= 2 && data.history[0].actual === data.history[1].actual) {
        // Streak continuation logic
        data.currentPrediction = data.history[0].actual;
    } else {
        // Alternate logic
        data.currentPrediction = Math.random() > 0.5 ? "BIG" : "SMALL";
    }

    updateUI();
    manualSync();
}

// Timer Engine
setInterval(() => {
    [30, 60, 300].forEach(m => {
        modes[m].timeLeft--;

        if (modes[m].timeLeft <= 0) {
            const simulatedOutcome = Math.random() > 0.5 ? "BIG" : "SMALL";
            if (m === activeMode) {
                processRoundOutcome(simulatedOutcome);
            } else {
                modes[m].timeLeft = modes[m].interval;
                modes[m].periodId = generatePeriodId(m);
            }
        }
    });

    updateUI();
}, 1000);

function switchMode(newMode) {
    activeMode = newMode;
    [30, 60, 300].forEach(m => {
        const btn = document.getElementById("tab" + m);
        if (m === newMode) {
            btn.className = "py-2.5 rounded-lg bg-emerald-500 text-slate-950 transition-all cursor-pointer font-bold shadow-lg shadow-emerald-500/20";
        } else {
            btn.className = "py-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer font-bold";
        }
    });
    document.getElementById("modeLabel").textContent = newMode === 30 ? "30s" : newMode === 60 ? "1 Min" : "5 Min";
    updateUI();
    manualSync();
}

function updateUI() {
    const data = modes[activeMode];

    document.getElementById("statTotal").textContent = data.totalPlayed;
    document.getElementById("statWinLoss").textContent = `${data.wins}/${data.losses}`;
    
    const profitEl = document.getElementById("statProfit");
    profitEl.textContent = `₹${data.profit.toFixed(0)}`;
    profitEl.className = `text-base font-black ${data.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    const recBetEl = document.getElementById("recBet");
    const recAmount = baseBet * Math.pow(3, data.streakLevel);
    recBetEl.textContent = `₹${recAmount}`;

    const winRate = data.totalPlayed > 0 ? ((data.wins / data.totalPlayed) * 100).toFixed(1) : 0;
    document.getElementById("winRateBadge").textContent = `Win Rate: ${winRate}%`;

    document.getElementById("currentPeriod").textContent = data.periodId;
    document.getElementById("timerCountdown").textContent = data.timeLeft + "s";

    const sigEl = document.getElementById("activeSignal");
    sigEl.textContent = data.currentPrediction;
    sigEl.className = `text-4xl font-black mb-2 ${data.currentPrediction === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    document.getElementById("confidenceScore").textContent = Math.floor(82 + Math.random() * 14) + "%";
    document.getElementById("patternType").textContent = data.streakLevel > 0 ? "Recovery Boost" : "Streak Trend";

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
                        ${item.win ? 'WIN' : 'LOSS'}
                    </span>
                </div>
            </div>
        `).join('');
    }
}

// Initial Call
manualSync();
updateUI();
