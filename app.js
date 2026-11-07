// Load saved state from LocalStorage if available
let engineState = JSON.parse(localStorage.getItem('analyzer_state')) || {
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

    const isWin = (engineState.nextPrediction === actualOutcome);
    engineState.total++;

    if (isWin) {
        engineState.wins++;
        engineState.profit += (stakeAmount * Math.pow(2, recoveryLevel) * 0.95);
        recoveryLevel = 0;
    } else {
        engineState.losses++;
        engineState.profit -= (stakeAmount * Math.pow(2, recoveryLevel));
        recoveryLevel = Math.min(recoveryLevel + 1, 4);
    }

    engineState.history.unshift({
        period: currentPeriod,
        pred: engineState.nextPrediction,
        actual: actualOutcome,
        win: isWin
    });

    if (engineState.history.length > 20) {
        engineState.history.pop();
    }

    // Pattern algorithm
    if (engineState.history.length >= 2 && engineState.history[0].actual === engineState.history[1].actual) {
        engineState.nextPrediction = engineState.history[0].actual;
    } else {
        engineState.nextPrediction = actualOutcome === "BIG" ? "SMALL" : "BIG";
    }

    // Save to LocalStorage
    localStorage.setItem('analyzer_state', JSON.stringify(engineState));

    // Auto-increment period number
    try {
        let nextPeriodVal = (BigInt(currentPeriod) + 1n).toString();
        periodField.value = nextPeriodVal;
    } catch (err) {
        periodField.value = currentPeriod;
    }

    renderDashboard();
}

function resetSession() {
    if (confirm("Kya aap saara session data reset karna chahte hain?")) {
        localStorage.removeItem('analyzer_state');
        engineState = {
            total: 0,
            wins: 0,
            losses: 0,
            profit: 0,
            nextPrediction: "BIG",
            history: []
        };
        recoveryLevel = 0;
        renderDashboard();
    }
}

function renderDashboard() {
    const sigBox = document.getElementById("signalBox");
    sigBox.textContent = engineState.nextPrediction;
    sigBox.className = `text-4xl font-black mb-2 ${engineState.nextPrediction === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    const winRateVal = engineState.total > 0 ? ((engineState.wins / engineState.total) * 100).toFixed(1) : 0;
    document.getElementById("winRate").textContent = winRateVal + "%";

    const plElement = document.getElementById("netPL");
    plElement.textContent = `₹${engineState.profit.toFixed(0)}`;
    plElement.className = engineState.profit >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold";

    document.getElementById("totalPlayedCount").textContent = `Total: ${engineState.total} rounds`;
    document.getElementById("streakBadge").textContent = `Recovery Lvl: ${recoveryLevel}`;

    const logContainer = document.getElementById("historyLog");
    if (engineState.history.length === 0) {
        logContainer.innerHTML = `<div class="text-center text-xs text-slate-500 py-3">No rounds recorded yet.</div>`;
    } else {
        logContainer.innerHTML = engineState.history.map(item => `
            <div class="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                <div>
                    <span class="text-slate-400 font-mono">#${item.period}</span>
                    <div class="font-bold text-slate-300 mt-0.5">Pred: <span class="${item.pred==='BIG'?'text-emerald-400':'text-rose-400'}">${item.pred}</span> | Real: ${item.actual}</div>
                </div>
                <span class="px-2 py-0.5 rounded-lg font-bold text-[10px] ${item.win ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                    ${item.win ? 'WIN' : 'LOSS'}
                </span>
            </div>
        `).join('');
    }
}

// Initial render load
renderDashboard();
