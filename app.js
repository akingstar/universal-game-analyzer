const gameData = {
    '30s': { total: 0, wins: 0, losses: 0, profit: 0, history: [], nextPred: "BIG", streak: 0 },
    '1m': { total: 0, wins: 0, losses: 0, profit: 0, history: [], nextPred: "SMALL", streak: 0 },
    '5m': { total: 0, wins: 0, losses: 0, profit: 0, history: [], nextPred: "BIG", streak: 0 }
};

let activeTab = '30s';
const baseBet = 100;

function switchMode(mode) {
    activeTab = mode;
    ['30s', '1m', '5m'].forEach(m => {
        const btn = document.getElementById("tab" + m);
        if (m === mode) {
            btn.className = "py-2.5 rounded-lg bg-emerald-500 text-slate-950 transition-all cursor-pointer font-bold shadow-lg shadow-emerald-500/20";
        } else {
            btn.className = "py-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer font-bold";
        }
    });
    document.getElementById("modeLabel").textContent = mode === '30s' ? '30 Sec' : mode === '1m' ? '1 Min' : '5 Min';
    updateUI();
}

function submitExactResult(actualOutcome) {
    const periodInput = document.getElementById("inputPeriod");
    const periodVal = periodInput.value.trim();

    if (!periodVal) {
        alert("Pehle real game ka Period Number enter karein!");
        periodInput.focus();
        return;
    }

    const data = gameData[activeTab];
    const isWin = (data.nextPred === actualOutcome);

    data.total++;
    if (isWin) {
        data.wins++;
        const mult = Math.pow(2, data.streak);
        data.profit += (baseBet * mult * 0.95);
        data.streak = 0; // Reset on win
    } else {
        data.losses++;
        const mult = Math.pow(2, data.streak);
        data.profit -= (baseBet * mult);
        data.streak = Math.min(data.streak + 1, 4); // Max 4 level recovery
    }

    data.history.unshift({
        period: periodVal,
        pred: data.nextPred,
        actual: actualOutcome,
        win: isWin
    });

    if (data.history.length > 20) data.history.pop();

    // Pattern logic for next prediction
    if (data.history.length >= 2 && data.history[0].actual === data.history[1].actual) {
        data.nextPred = data.history[0].actual; // Streak continue
    } else {
        data.nextPred = actualOutcome === "BIG" ? "SMALL" : "BIG"; // Alternate
    }

    periodInput.value = "";
    updateUI();
}

function updateUI() {
    const data = gameData[activeTab];

    document.getElementById("statTotal").textContent = data.total;
    document.getElementById("statWinLoss").textContent = `${data.wins}/${data.losses}`;
    
    const profitEl = document.getElementById("statProfit");
    profitEl.textContent = `₹${data.profit.toFixed(0)}`;
    profitEl.className = `text-base font-black ${data.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    const recAmount = baseBet * Math.pow(2, data.streak);
    document.getElementById("recBet").textContent = `₹${recAmount}`;

    const winRate = data.total > 0 ? ((data.wins / data.total) * 100).toFixed(1) : 0;
    document.getElementById("winRateBadge").textContent = `Win Rate: ${winRate}%`;

    const sigEl = document.getElementById("activeSignal");
    sigEl.textContent = data.nextPred;
    sigEl.className = `text-4xl font-black mb-2 ${data.nextPred === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;
    document.getElementById("signalSubtext").textContent = `Based on real pattern of ${activeTab} mode`;

    const historyLog = document.getElementById("historyLog");
    if (data.history.length === 0) {
        historyLog.innerHTML = `<div class="text-center text-xs text-slate-500 py-4">No rounds matched yet in ${activeTab}.</div>`;
    } else {
        historyLog.innerHTML = data.history.map(item => `
            <div class="flex justify-between items-center p-2.5 rounded-lg border text-xs ${
                item.win ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
            }">
                <div>
                    <span class="text-slate-400 font-mono">#${item.period}</span>
                    <div class="font-bold mt-0.5">Pred: <span class="${item.pred==='BIG'?'text-emerald-400':'text-rose-400'}">${item.pred}</span> | Real: <span class="text-slate-200">${item.actual}</span></div>
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

updateUI();
