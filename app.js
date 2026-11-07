let globalState = JSON.parse(localStorage.getItem('universal_terminal_v6')) || {
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
    localStorage.setItem('universal_terminal_v6', JSON.stringify(globalState));
}

function resetSession() {
    if (confirm("Reset all timeframe history and stats?")) {
        localStorage.removeItem('universal_terminal_v6');
        location.reload();
    }
}

// Advanced Matrix Predictor (Big/Small + Exact Number + Color)
function analyzeCurrentTimeframe() {
    const tfData = globalState.timeframes[globalState.activeTimeframe];
    const history = tfData.history;

    if (history.length === 0) {
        return { signal: "BIG", number: 7, color: "GREEN", confidence: 50, pattern: "Baseline Initial" };
    }

    let bigScore = 0;
    let smallScore = 0;
    let patternType = "Matrix Weighted AI";

    if (history.length >= 2 && history[0].actual === history[1].actual) {
        const streakVal = history[0].actual;
        if (streakVal === "BIG") bigScore += 45;
        else smallScore += 45;
        patternType = `Dragon Streak (${streakVal})`;
    } else if (history.length >= 3 && history[0].actual !== history[1].actual && history[1].actual !== history[2].actual) {
        const expected = history[0].actual === "BIG" ? "SMALL" : "BIG";
        if (expected === "BIG") bigScore += 40;
        else smallScore += 40;
        patternType = "Alternating Jump (AB-AB)";
    }

    let rawSignal = bigScore >= smallScore ? "BIG" : "SMALL";
    let conf = Math.min(Math.max(50 + Math.abs(bigScore - smallScore), 60), 92);

    if (globalState.reverseMode) {
        rawSignal = rawSignal === "BIG" ? "SMALL" : "BIG";
        patternType += " [INVERTED]";
    }

    // Number & Color Derivation based on Big/Small Signal
    let predictedNumber = 7;
    let predictedColor = "GREEN";

    if (rawSignal === "BIG") {
        // Big numbers: 5, 6, 7, 8, 9
        const bigPool = [6, 7, 8, 9, 5];
        predictedNumber = bigPool[Math.floor(Math.random() * bigPool.length)];
        predictedColor = (predictedNumber === 5) ? "GREEN/VIOLET" : (predictedNumber % 2 === 0 ? "RED" : "GREEN");
    } else {
        // Small numbers: 0, 1, 2, 3, 4
        const smallPool = [1, 2, 3, 4, 0];
        predictedNumber = smallPool[Math.floor(Math.random() * smallPool.length)];
        predictedColor = (predictedNumber === 0) ? "RED/VIOLET" : (predictedNumber % 2 === 0 ? "RED" : "GREEN");
    }

    return { signal: rawSignal, number: predictedNumber, color: predictedColor, confidence: conf, pattern: patternType };
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
        number: ai.number,
        color: ai.color,
        actual: actualOutcome,
        win: isWin,
        stake: stake,
        pattern: ai.pattern
    });

    if (tfData.history.length > 25) tfData.history.pop();

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

    const revBtn = document.getElementById("reverseToggleBtn");
    const revText = document.getElementById("reverseStatusText");
    if (globalState.reverseMode) {
        revBtn.className = "px-2.5 py-1 rounded-lg font-bold text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1 shadow-md";
        revText.textContent = "ON";
    } else {
        revBtn.className = "px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1";
        revText.textContent = "OFF";
    }

    const sigBox = document.getElementById("signalBox");
    sigBox.textContent = ai.signal;
    sigBox.className = `text-2xl font-black ${ai.signal === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    document.getElementById("numberSignal").textContent = ai.number;
    
    const colorEl = document.getElementById("colorSignal");
    colorEl.textContent = ai.color;
    colorEl.className = `text-xs font-black px-2.5 py-1 rounded inline-block mt-1 ${ai.color.includes('GREEN') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`;

    document.getElementById("detectedPattern").textContent = ai.pattern;
    document.getElementById("confidenceText").textContent = ai.confidence + "%";
    document.getElementById("confidenceBar").style.width = ai.confidence + "%";

    const currentMultiplier = (globalState.strategy === 'martingale') ? Math.pow(2, tfData.recoveryLevel) : 1;
    const currentStake = globalState.baseBet * currentMultiplier;
    document.getElementById("suggestedStake").textContent = `₹${currentStake}`;
    document.getElementById("recoveryLevelBadge").textContent = `Lvl: ${tfData.recoveryLevel}`;

    document.getElementById("statTotal").textContent = tfData.total;
    const winRate = tfData.total > 0 ? ((tfData.wins / tfData.total) * 100).toFixed(1) : 0;
    document.getElementById("statWinRate").textContent = winRate + "%";

    const plEl = document.getElementById("statPL");
    plEl.textContent = `₹${tfData.profit.toFixed(0)}`;
    plEl.className = `text-sm font-black ${tfData.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    const logEl = document.getElementById("historyLog");
    if (tfData.history.length === 0) {
        logEl.innerHTML = `<div class="text-center text-xs text-slate-500 py-3">No rounds logged yet for ${globalState.activeTimeframe}.</div>`;
    } else {
        logEl.innerHTML = tfData.history.map(item => `
            <div class="flex justify-between items-center bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div>
                    <span class="text-slate-400 font-mono text-[10px]">#${item.period}</span>
                    <div class="font-bold text-slate-300 mt-0.5">
                        Pred: <span class="${item.predicted==='BIG'?'text-emerald-400':'text-rose-400'}">${item.predicted}</span> (Num: <span class="text-amber-400">${item.number}</span> / ${item.color}) | Real: ${item.actual}
                    </div>
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

switchTimeframe(globalState.activeTimeframe);
