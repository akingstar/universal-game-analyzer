const modes = {
    30: { totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "BIG", streakLevel: 0 },
    60: { totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "SMALL", streakLevel: 0 },
    300: { totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "BIG", streakLevel: 0 }
};

let activeMode = 30;
const baseBet = 100;

function submitRealResult(actualOutcome) {
    const data = modes[activeMode];
    let customPeriod = document.getElementById("inputPeriod").value.trim();
    if (!customPeriod) {
        customPeriod = "P_" + Math.floor(1000 + Math.random() * 9000);
    }

    const isWin = (data.currentPrediction === actualOutcome);

    data.totalPlayed++;
    if (isWin) {
        data.wins++;
        const mult = Math.pow(2, data.streakLevel);
        data.profit += (baseBet * mult * 0.95);
        data.streakLevel = 0; // Reset streak on win
    } else {
        data.losses++;
        const mult = Math.pow(2, data.streakLevel);
        data.profit -= (baseBet * mult);
        data.streakLevel = Math.min(data.streakLevel + 1, 4); // Max recovery level 4
    }

    data.history.unshift({
        period: customPeriod,
        pred: data.currentPrediction,
        actual: actualOutcome,
        win: isWin
    });

    if (data.history.length > 15) data.history.pop();

    // Smart Trend Calculation for Next Round based on real inputs
    if (data.history.length >= 2 && data.history[0].actual === data.history[1].actual) {
        // Same trend continuation
        data.currentPrediction = data.history[0].actual;
    } else {
        // Alternate pattern
        data.currentPrediction = actualOutcome === "BIG" ? "SMALL" : "BIG";
    }

    document.getElementById("inputPeriod").value = "";
    updateUI();
}

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
}

function updateUI() {
    const data = modes[activeMode];

    document.getElementById("statTotal").textContent = data.totalPlayed;
    document.getElementById("statWinLoss").textContent = `${data.wins}/${data.losses}`;
    
    const profitEl = document.getElementById("statProfit");
    profitEl.textContent = `₹${data.profit.toFixed(0)}`;
    profitEl.className = `text-base font-black ${data.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    const recBetEl = document.getElementById("recBet");
    const recAmount = baseBet * Math.pow(2, data.streakLevel);
    recBetEl.textContent = `₹${recAmount}`;

    const winRate = data.totalPlayed > 0 ? ((data.wins / data.totalPlayed) * 100).toFixed(1) : 0;
    document.getElementById("winRateBadge").textContent = `Win Rate: ${winRate}%`;

    document.getElementById("currentPeriod").textContent = "Active Signal Ready";

    const sigEl = document.getElementById("activeSignal");
    sigEl.textContent = data.currentPrediction;
    sigEl.className = `text-4xl font-black mb-2 ${data.currentPrediction === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    const historyLog = document.getElementById("historyLog");
    if (data.history.length === 0) {
        historyLog.innerHTML = `<div class="text-center text-xs text-slate-500 py-4">Enter real game result above to start tracking...</div>`;
    } else {
        historyLog.innerHTML = data.history.map(item => `
            <div class="flex justify-between items-center p-2.5 rounded-lg border text-xs ${
                item.win ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
            }">
                <div>
                    <span class="text-slate-400 font-mono">#${item.period}</span>
                    <div class="font-bold mt-0.5">Pred: <span class="${item.pred==='BIG'?'text-emerald-400':'text-rose-400'}">${item.pred}</span> | Real Result: <span class="text-slate-200">${item.actual}</span></div>
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
updateUI();
