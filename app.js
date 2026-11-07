let state = {
    total: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    nextPred: "BIG",
    history: []
};

const baseBet = 100;
let streak = 0;

function recordResult(actual) {
    const periodField = document.getElementById("periodInput");
    let currentPeriod = periodField.value.trim();
    
    if (!currentPeriod) {
        alert("Period number daalein!");
        return;
    }

    const isWin = (state.nextPred === actual);
    state.total++;

    if (isWin) {
        state.wins++;
        state.profit += (baseBet * Math.pow(2, streak) * 0.95);
        streak = 0;
    } else {
        state.losses++;
        state.profit -= (baseBet * Math.pow(2, streak));
        streak = Math.min(streak + 1, 4);
    }

    state.history.unshift({
        period: currentPeriod,
        pred: state.nextPred,
        actual: actual,
        win: isWin
    });

    if (state.history.length > 10) state.history.pop();

    // Simple Smart Pattern Logic
    state.nextPred = actual === "BIG" ? "SMALL" : "BIG";

    // Auto increment period number for next entry convenience
    try {
        let nextNum = (BigInt(currentPeriod) + 1n).toString();
        periodField.value = nextNum;
    } catch (e) {
        // Fallback if string math fails
        periodField.value = currentPeriod;
    }

    updateUI();
}

function updateUI() {
    document.getElementById("signalBox").textContent = state.nextPred;
    document.getElementById("signalBox").className = `text-5xl font-black mb-2 ${state.nextPred === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    const winRate = state.total > 0 ? ((state.wins / state.total) * 100).toFixed(1) : 0;
    document.getElementById("winRate").textContent = winRate + "%";
    
    const plEl = document.getElementById("netPL");
    plEl.textContent = `₹${state.profit.toFixed(0)}`;
    plEl.className = state.profit >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold";

    const logEl = document.getElementById("historyLog");
    if (state.history.length === 0) {
        logEl.innerHTML = `<div class="text-center text-xs text-slate-500 py-3">No rounds recorded yet.</div>`;
    } else {
        logEl.innerHTML = state.history.map(item => `
            <div class="flex justify-between items-center bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-xs">
                <div>
                    <span class="text-slate-400 font-mono">#${item.period}</span>
                    <div class="font-bold text-slate-300 mt-0.5">Pred: <span class="${item.pred==='BIG'?'text-emerald-400':'text-rose-400'}">${item.pred}</span> | Real: ${item.actual}</div>
                </div>
                <span class="px-2 py-1 rounded font-bold ${item.win ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                    ${item.win ? 'WIN' : 'LOSS'}
                </span>
            </div>
        `).join('');
    }
}
