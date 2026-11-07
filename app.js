// Multi-Timeframe State Management Engine
let globalState = JSON.parse(localStorage.getItem('universal_terminal_v5')) || {
    activeTimeframe: '30s',
    baseBet: 100,
    strategy: 'martingale',
    reverseMode: false,
    timeframes: {
        '30s': { total: 0, wins: 0, losses: 0, profit: 0, history: [], recoveryLevel: 0 },
        '1m':  { total: 0, wins: 0, losses: 0, profit: 0, history: [], recoveryLevel: 0 },
        '3m':  { total: 0, wins: 0, losses: 0, profit: 0, history: [], recoveryLevel: 0 },
        '5m':  { total: 0, wins: 0, losses: 0, profit: 0, history: [], recoveryLevel: 0 }
    }
};

// UI Bindings
document.getElementById("baseBetSelect").value = globalState.baseBet || 100;
document.getElementById("strategySelect").value = globalState.strategy || 'martingale';

function switchTimeframe(tf) {
    globalState.activeTimeframe = tf;
    ['30s', '1m', '3m', '5m'].forEach(m => {
        const btn = document.getElementById("tab" + m);
        if (m === tf) {
            btn.className = "py-2 rounded-lg bg-emerald-500 text-slate-950 transition-all cursor-pointer font-bold shadow-md";
        } else {
            btn.className = "py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer font-bold";
        }
    });
    document.getElementById("activeModeLabel").textContent = tf;
    document.getElementById("historyModeLabel").textContent = tf;
    saveState();
    renderDashboard();
}

function updateSettings() {
    globalState.baseBet = parseInt(document.getElementById("baseBetSelect").value);
    globalState.strategy = document.getElementById("strategySelect").value;
    saveState();
    renderDashboard();
}

function toggleReverseMode() {
    globalState.reverseMode = !globalState.reverseMode;
    saveState();
    renderDashboard();
}

function saveState() {
    localStorage.setItem('universal_terminal_v5', JSON.stringify(globalState));
}

function resetSession() {
    if (confirm("Reset all timeframe history and stats?")) {
        localStorage.removeItem('universal_terminal_v5');
        location.reload();
    }
}

// AI Quantitative Pattern Engine
function analyzeCurrentTimeframe() {
    const tfData = globalState.timeframes[globalState.activeTimeframe];
    const history = tfData.history;

    if (history.length === 0) {
        return { signal: "BIG", confidence: 50, pattern: "Awaiting Initial Data" };
    }

    let bigScore = 0;
    let smallScore = 0;
    let patternType = "Dynamic Trend Weighting";

    // Dragon Trend Check
    if (history.length >= 2 && history[0].actual === history[1].actual) {
        const streakColor = history[0].actual;
        if (streakColor === "BIG") bigScore += 45;
        else smallScore += 45;
        patternType = `Dragon Streak (${streakColor} Follow)`;
    }

    // Alternating Jump Check
    if (history.length >= 3 && history[0].actual !== history[1].actual && history[1].actual !== history[2].actual) {
        const expected = history[0].actual === "BIG" ? "SMALL" : "BIG";
        if (expected === "BIG") bigScore += 40;
        else smallScore += 40;
        patternType = "Alternating Jump (AB-AB)";
    }

    // Markov Mean Reversion Check (Last 10)
    let bigsCount = 0;
    const sample = Math.min(history.length, 10);
    for (let i = 0; i < sample; i++) {
        if (history[i].actual === "BIG") bigsCount++;
    }
    const ratio = bigsCount / sample;
    if (ratio >= 0.7) {
        smallScore += 30;
        patternType = "Mean Reversion (Overbought)";
    } else if (ratio <= 0.3) {
        bigScore += 30;
        patternType = "Mean Reversion (Oversold)";
    }

    let rawSignal = bigScore >= smallScore ? "BIG" : "SMALL";
    let conf = Math.min(Math.max(50 + Math.abs(bigScore - smallScore), 60), 92);

    if (globalState.reverseMode) {
        rawSignal = rawSignal === "BIG" ? "SMALL" : "BIG";
        patternType += " [INVERTED]";
    }

    return { signal: rawSignal, confidence: conf, pattern: patternType };
}

function executeOutcome(actualOutcome) {
    const periodInput = document.getElementById("periodInput");
    const currentPeriod = periodInput.value.trim();

    if (!currentPeriod) {
        alert("Enter period number!");
        return;
    }

    const tfData = globalState.timeframes[globalState.activeTimeframe];
    const ai = analyzeCurrentTimeframe();
    const isWin = (ai.signal === actualOutcome);

    let multiplier = 1;
    if (globalState.strategy === 'martingale') {
        multiplier = Math.pow(2, tfData.recoveryLevel);
    }

    const stake = globalState.baseBet * multiplier;

    tfData.total++;
    if (isWin) {
        tfData.wins++;
        tfData.profit += (stake * 0.95);
        tfData.recoveryLevel = 0;
    } else {
        tfData.losses++;
        tfData.profit -= stake;
        if (globalState.strategy === 'martingale') {
            tfData.recoveryLevel = Math.min(tfData.recoveryLevel + 1, 4);
        }
    }

    tfData.history.unshift({
        period: currentPeriod,
        predicted: ai.signal,
        actual: actualOutcome,
        win: isWin,
        stake: stake,
        pattern: ai.pattern
    });

    if (tfData.history.length > 25) tfData.history.pop();

    // Auto Increment Period
    try {
        periodInput.value = (BigInt(currentPeriod) + 1n).toString();
    } catch (e) {
        periodInput.value = currentPeriod;
    }

    saveState();
    renderDashboard();
}

function renderDashboard() {
    const tfData = globalState.timeframes[globalState.activeTimeframe];
    const ai = analyzeCurrentTimeframe();

    // Reverse Button UI
    const revBtn = document.getElementById("reverseToggleBtn");
    const revText = document.getElementById("reverseStatusText");
    if (globalState.reverseMode) {
        revBtn.className = "px-2.5 py-1 rounded-lg font-bold text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1 shadow-md";
        revText.textContent = "ON";
    } else {
        revBtn.className = "px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1";
        revText.textContent = "OFF";
    }

    // Signal UI
    const sigBox = document.getElementById("signalBox");
    sigBox.textContent = ai.signal;
    sigBox.className = `text-4xl font-black tracking-wide my-1 ${ai.signal === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    document.getElementById("detectedPattern").textContent = ai.pattern;
    document.getElementById("confidenceText").textContent = ai.confidence + "%";
    document.getElementById("confidenceBar").style.width = ai.confidence + "%";

    const currentMultiplier = (globalState.strategy === 'martingale') ? Math.pow(2, tfData.recoveryLevel) : 1;
    const currentStake = globalState.baseBet * currentMultiplier;
    document.getElementById("suggestedStake").textContent = `₹${currentStake}`;
    document.getElementById("recoveryLevelBadge").textContent = `Lvl: ${tfData.recoveryLevel}`;

    // Metrics
    document.getElementById("statTotal").textContent = tfData.total;
    const winRate = tfData.total > 0 ? ((tfData.wins / tfData.total) * 100).toFixed(1) : 0;
    document.getElementById("statWinRate").textContent = winRate + "%";

    const plEl = document.getElementById("statPL");
    plEl.textContent = `₹${tfData.profit.toFixed(0)}`;
    plEl.className = `text-sm font-black ${tfData.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    // History Log
    const logEl = document.getElementById("historyLog");
    if (tfData.history.length === 0) {
        logEl.innerHTML = `<div class="text-center text-xs text-slate-500 py-3">No rounds logged yet for ${globalState.activeTimeframe}.</div>`;
    } else {
        logEl.innerHTML = tfData.history.map(item => `
            <div class="flex justify-between items-center bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-xs">
                <div>
                    <span class="text-slate-400 font-mono text-[10px]">#${item.period}</span>
                    <div class="font-bold text-slate-300 mt-0.5">Pred: <span class="${item.predicted==='BIG'?'text-emerald-400':'text-rose-400'}">${item.predicted}</span> | Real: ${item.actual}</div>
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

// Initial Launch Load
switchTimeframe(globalState.activeTimeframe);
