// Isolated State Management
const engineState = {
    total: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    nextPrediction: "BIG",
    history: []
};

const stakeAmount = 100;
let recoveryLevel = 0;

function recordResult(actualOutcome) {
    const periodField = document.getElementById("periodInput");
    let currentPeriod = periodField.value.trim();
    
    if (!currentPeriod) {
        alert("Please enter period number!");
        return;
    }

    // Match validation
    const isWin = (engineState.nextPrediction === actualOutcome);
    engineState.total++;

    if (isWin) {
        engineState.wins++;
        engineState.profit += (stakeAmount * Math.pow(2, recoveryLevel) * 0.95);
        recoveryLevel = 0; // Reset recovery on win
    } else {
        engineState.losses++;
        engineState.profit -= (stakeAmount * Math.pow(2, recoveryLevel));
        recoveryLevel = Math.min(recoveryLevel + 1, 4); // Max 4 levels
    }

    // Push to history array (FIFO)
    engineState.history.unshift({
        period: currentPeriod,
        pred: engineState.nextPrediction,
        actual: actualOutcome,
        win: isWin
    });

    if (engineState.history.length > 15) {
        engineState.history.pop();
    }

    // Independent pattern calculation algorithm
    if (engineState.history.length >= 2 && engineState.history[0].actual === engineState.history[1].actual) {
        engineState.nextPrediction = engineState.history[0].actual;
    } else {
        engineState.nextPrediction = actualOutcome === "BIG" ? "SMALL" : "BIG";
    }

    // Fast auto-increment for next period number
    try {
        let nextPeriodVal = (BigInt(currentPeriod) + 1n).toString();
        periodField.value = nextPeriodVal;
    } catch (err) {
        periodField.value = currentPeriod;
    }

    // Render UI instantly
    renderDashboard();
}

function renderDashboard() {
    // Update Signal Box
    const sigBox = document.getElementById("signalBox");
    sigBox.textContent = engineState.nextPrediction;
    sigBox.className = `text-4xl font-black mb-2 ${engineState.nextPrediction === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    // Update Stats
    const winRateVal = engineState.total > 0 ? ((engineState.wins / engineState.total) * 100).toFixed(1) : 0;
    document.getElementById("winRate").textContent = winRateVal + "%";

    const plElement = document.getElementById("netPL");
    plElement.textContent = `₹${engineState.profit.toFixed(0)}`;
    plElement.className = engineState.profit >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold";

    // Update History List
    const logContainer = document.getElementById("historyLog");
    if (engineState.history.length === 0) {
        logContainer.innerHTML = `<div class="text-center text-xs text-slate-500 py-3">No rounds recorded yet.</div>`;
    } else {
        logContainer.innerHTML = engineState.history.map(item => `
            <div class="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div>
                    <span class="text-slate-400 font-mono">#${item.period}</span>
                    <div class="font-bold text-slate-300 mt-0.5">Pred: <span class="${item.pred==='BIG'?'text-emerald-400':'text-rose-400'}">${item.pred}</span> | Real: ${item.actual}</div>
                </div>
                <span class="px-2.5 py-1 rounded-lg font-bold text-[10px] ${item.win ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                    ${item.win ? 'WIN' : 'LOSS'}
                </span>
            </div>
        `).join('');
    }
}

// Initial render check
renderDashboard();
