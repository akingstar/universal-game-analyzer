// Persistent State Engine with Reverse Mode Support
let appState = JSON.parse(localStorage.getItem('pro_analyzer_state_v3')) || {
    total: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    history: [],
    baseBet: 100,
    strategy: 'martingale',
    recoveryLevel: 0,
    reverseMode: false
};

// UI Element Bindings
document.getElementById("baseBetSelect").value = appState.baseBet || 100;
document.getElementById("strategySelect").value = appState.strategy || 'martingale';

function updateSettings() {
    appState.baseBet = parseInt(document.getElementById("baseBetSelect").value);
    appState.strategy = document.getElementById("strategySelect").value;
    saveState();
    renderDashboard();
}

function toggleReverseMode() {
    appState.reverseMode = !appState.reverseMode;
    saveState();
    renderDashboard();
}

function saveState() {
    localStorage.setItem('pro_analyzer_state_v3', JSON.stringify(appState));
}

function resetSession() {
    if (confirm("Kya aap saara session data aur history reset karna chahte hain?")) {
        localStorage.removeItem('pro_analyzer_state_v3');
        appState = {
            total: 0,
            wins: 0,
            losses: 0,
            profit: 0,
            history: [],
            baseBet: parseInt(document.getElementById("baseBetSelect").value),
            strategy: document.getElementById("strategySelect").value,
            recoveryLevel: 0,
            reverseMode: false
        };
        renderDashboard();
    }
}

// Multi-Pattern Analytics Engine
function calculateBasePrediction() {
    const history = appState.history;
    
    if (history.length === 0) {
        return { signal: "BIG", confidence: 50, pattern: "Baseline Initial" };
    }

    // Pattern 1: Dragon Streak Detection (3+ continuous outcomes)
    if (history.length >= 3) {
        if (history[0].actual === history[1].actual && history[1].actual === history[2].actual) {
            return {
                signal: history[0].actual,
                confidence: 88,
                pattern: "Dragon Trend (Streak Follow)"
            };
        }
    }

    // Pattern 2: Alternating Jump Pattern (AB AB Detection)
    if (history.length >= 3) {
        if (history[0].actual !== history[1].actual && history[1].actual !== history[2].actual) {
            const nextExpected = history[0].actual === "BIG" ? "SMALL" : "BIG";
            return {
                signal: nextExpected,
                confidence: 82,
                pattern: "Alternating Jump (AB Pattern)"
            };
        }
    }

    // Pattern 3: Mean Reversion Matrix
    let bigCount = 0;
    const sampleSize = Math.min(history.length, 10);
    for (let i = 0; i < sampleSize; i++) {
        if (history[i].actual === "BIG") bigCount++;
    }

    const bigRatio = bigCount / sampleSize;
    if (bigRatio >= 0.6) {
        return { signal: "SMALL", confidence: 74, pattern: "Mean Reversion (Overbought)" };
    } else if (bigRatio <= 0.4) {
        return { signal: "BIG", confidence: 74, pattern: "Mean Reversion (Oversold)" };
    }

    // Fallback Momentum Switch
    const lastOutcome = history[0].actual;
    return {
        signal: lastOutcome === "BIG" ? "SMALL" : "BIG",
        confidence: 65,
        pattern: "Single Jump Momentum"
    };
}

function getFinalPrediction() {
    const base = calculateBasePrediction();
    let finalSignal = base.signal;

    // Apply Reverse Mode Inversion if active
    if (appState.reverseMode) {
        finalSignal = base.signal === "BIG" ? "SMALL" : "BIG";
        base.pattern += " [REVERSED]";
    }

    return {
        signal: finalSignal,
        confidence: base.confidence,
        pattern: base.pattern
    };
}

function executeOutcome(actualOutcome) {
    const periodInput = document.getElementById("periodInput");
    const currentPeriod = periodInput.value.trim();

    if (!currentPeriod) {
        alert("Pehle valid period number enter karein!");
        return;
    }

    const predictionData = getFinalPrediction();
    const isWin = (predictionData.signal === actualOutcome);

    // Money Management Stake Multiplier Calculation
    let currentBetMultiplier = 1;
    if (appState.strategy === 'martingale') {
        currentBetMultiplier = Math.pow(2, appState.recoveryLevel);
    }

    const stake = appState.baseBet * currentBetMultiplier;

    appState.total++;
    if (isWin) {
        appState.wins++;
        appState.profit += (stake * 0.95);
        appState.recoveryLevel = 0; // Reset recovery on Win
    } else {
        appState.losses++;
        appState.profit -= stake;
        if (appState.strategy === 'martingale') {
            appState.recoveryLevel = Math.min(appState.recoveryLevel + 1, 4); // Max 4 level recovery limit
        }
    }

    // Push Record to History
    appState.history.unshift({
        period: currentPeriod,
        predicted: predictionData.signal,
        actual: actualOutcome,
        win: isWin,
        stake: stake,
        pattern: predictionData.pattern,
        reversed: appState.reverseMode
    });

    if (appState.history.length > 20) appState.history.pop();

    // Auto Increment Period ID Safely
    try {
        periodInput.value = (BigInt(currentPeriod) + 1n).toString();
    } catch (e) {
        periodInput.value = currentPeriod;
    }

    saveState();
    renderDashboard();
}

function renderDashboard() {
    const pred = getFinalPrediction();

    // Update Reverse Toggle UI State
    const revBtn = document.getElementById("reverseToggleBtn");
    const revText = document.getElementById("reverseStatusText");
    if (appState.reverseMode) {
        revBtn.className = "px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/10";
        revText.textContent = "ON (INVERTED)";
    } else {
        revBtn.className = "px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5";
        revText.textContent = "OFF";
    }

    // Signal Box
    const sigBox = document.getElementById("signalBox");
    sigBox.textContent = pred.signal;
    sigBox.className = `text-5xl font-black tracking-wide my-1 ${pred.signal === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    // Confidence Bar & Pattern Text
    document.getElementById("detectedPattern").textContent = pred.pattern;
    document.getElementById("confidenceText").textContent = pred.confidence + "%";
    document.getElementById("confidenceBar").style.width = pred.confidence + "%";

    // Stake & Recovery Level
    const currentMultiplier = (appState.strategy === 'martingale') ? Math.pow(2, appState.recoveryLevel) : 1;
    const currentStake = appState.baseBet * currentMultiplier;
    document.getElementById("suggestedStake").textContent = `₹${currentStake}`;
    document.getElementById("recoveryLevelBadge").textContent = `Recovery Lvl: ${appState.recoveryLevel}`;

    // Metrics
    document.getElementById("statTotal").textContent = appState.total;
    const winRate = appState.total > 0 ? ((appState.wins / appState.total) * 100).toFixed(1) : 0;
    document.getElementById("statWinRate").textContent = winRate + "%";

    const plEl = document.getElementById("statPL");
    plEl.textContent = `₹${appState.profit.toFixed(0)}`;
    plEl.className = `text-base font-black ${appState.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    // History Log Table Render
    const logEl = document.getElementById("historyLog");
    if (appState.history.length === 0) {
        logEl.innerHTML = `<div class="text-center text-xs text-slate-500 py-4">No outcomes logged yet. Enter period & outcome above.</div>`;
    } else {
        logEl.innerHTML = appState.history.map(item => `
            <div class="flex justify-between items-center bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div>
                    <span class="text-slate-400 font-mono text-[11px]">#${item.period}</span>
                    <div class="font-bold text-slate-300 mt-0.5">Pred: <span class="${item.predicted==='BIG'?'text-emerald-400':'text-rose-400'}">${item.predicted}</span> | Real: ${item.actual} ${item.reversed ? '<span class="text-amber-400 text-[10px]">[Rev]</span>' : ''}</div>
                    <span class="text-[9px] text-slate-500">${item.pattern}</span>
                </div>
                <div class="text-right">
                    <span class="px-2 py-0.5 rounded font-bold text-[10px] ${item.win ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                        ${item.win ? `WIN (+₹${(item.stake*0.95).toFixed(0)})` : `LOSS (-₹${item.stake})`}
                    </span>
                </div>
            </div>
        `).join('');
    }
}

// Initial Call
renderDashboard();
