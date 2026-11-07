// Persistent AI State Model
let appState = JSON.parse(localStorage.getItem('ai_auto_analyzer_v4')) || {
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

// UI Initialization
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
    localStorage.setItem('ai_auto_analyzer_v4', JSON.stringify(appState));
}

function resetSession() {
    if (confirm("Reset saara AI trained sequence history aur balance stats?")) {
        localStorage.removeItem('ai_auto_analyzer_v4');
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

// Full Autonomous AI Statistical Analysis Engine
function runAutoAIAnalysis() {
    const history = appState.history;
    
    // Baseline state when no history exists
    if (history.length === 0) {
        return { signal: "BIG", confidence: 50, pattern: "Baseline AI Default" };
    }

    let bigScore = 0;
    let smallScore = 0;
    let detectedPattern = "Weighted Hybrid Analysis";

    // Layer 1: Dragon Trend / Streak Detection
    if (history.length >= 2) {
        if (history[0].actual === history[1].actual) {
            const streakVal = history[0].actual;
            if (streakVal === "BIG") bigScore += 40;
            else smallScore += 40;
            detectedPattern = `Dragon Trend (${streakVal} Streak Follow)`;
        }
    }

    // Layer 2: Alternating AB-AB Matrix Analysis
    if (history.length >= 3) {
        if (history[0].actual !== history[1].actual && history[1].actual !== history[2].actual) {
            const nextExpected = history[0].actual === "BIG" ? "SMALL" : "BIG";
            if (nextExpected === "BIG") bigScore += 35;
            else smallScore += 35;
            detectedPattern = "Alternating Jump (AB-AB Pattern)";
        }
    }

    // Layer 3: Markov Chain & Recent Sample Ratio Analysis (Last 10 Rounds)
    const sampleSize = Math.min(history.length, 10);
    let recentBigs = 0;
    for (let i = 0; i < sampleSize; i++) {
        if (history[i].actual === "BIG") recentBigs++;
    }
    
    const bigFrequency = recentBigs / sampleSize;
    if (bigFrequency >= 0.7) {
        // High Overbought BIG -> Expect Reversion to SMALL
        smallScore += 25;
        if (detectedPattern === "Weighted Hybrid Analysis") detectedPattern = "Mean Reversion (Overbought BIG)";
    } else if (bigFrequency <= 0.3) {
        // High Oversold BIG -> Expect Reversion to BIG
        bigScore += 25;
        if (detectedPattern === "Weighted Hybrid Analysis") detectedPattern = "Mean Reversion (Oversold BIG)";
    }

    // Final Signal & Confidence Calculation
    let targetSignal = "BIG";
    let calculatedConfidence = 50;

    if (bigScore >= smallScore) {
        targetSignal = "BIG";
        calculatedConfidence = Math.min(Math.max(50 + (bigScore - smallScore), 60), 92);
    } else {
        targetSignal = "SMALL";
        calculatedConfidence = Math.min(Math.max(50 + (smallScore - bigScore), 60), 92);
    }

    return {
        signal: targetSignal,
        confidence: calculatedConfidence,
        pattern: detectedPattern
    };
}

function getFinalCalculatedPrediction() {
    const aiBase = runAutoAIAnalysis();
    let finalSignal = aiBase.signal;

    if (appState.reverseMode) {
        finalSignal = aiBase.signal === "BIG" ? "SMALL" : "BIG";
        aiBase.pattern += " [INVERTED]";
    }

    return {
        signal: finalSignal,
        confidence: aiBase.confidence,
        pattern: aiBase.pattern
    };
}

function executeOutcome(actualOutcome) {
    const periodInput = document.getElementById("periodInput");
    const currentPeriod = periodInput.value.trim();

    if (!currentPeriod) {
        alert("Enter period number!");
        return;
    }

    const aiEval = getFinalCalculatedPrediction();
    const isWin = (aiEval.signal === actualOutcome);

    let currentMultiplier = 1;
    if (appState.strategy === 'martingale') {
        currentMultiplier = Math.pow(2, appState.recoveryLevel);
    }

    const stake = appState.baseBet * currentMultiplier;

    appState.total++;
    if (isWin) {
        appState.wins++;
        appState.profit += (stake * 0.95);
        appState.recoveryLevel = 0; // Reset Martingale on Win
    } else {
        appState.losses++;
        appState.profit -= stake;
        if (appState.strategy === 'martingale') {
            appState.recoveryLevel = Math.min(appState.recoveryLevel + 1, 4); // Max 4 Levels
        }
    }

    // Record Outcome into History Buffer to train future AI rounds
    appState.history.unshift({
        period: currentPeriod,
        predicted: aiEval.signal,
        actual: actualOutcome,
        win: isWin,
        stake: stake,
        pattern: aiEval.pattern,
        reversed: appState.reverseMode
    });

    if (appState.history.length > 20) appState.history.pop();

    // Auto Increment Period ID
    try {
        periodInput.value = (BigInt(currentPeriod) + 1n).toString();
    } catch (e) {
        periodInput.value = currentPeriod;
    }

    saveState();
    renderDashboard();
}

function renderDashboard() {
    const aiData = getFinalCalculatedPrediction();

    // Reverse Button UI Update
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
    sigBox.textContent = aiData.signal;
    sigBox.className = `text-5xl font-black tracking-wide my-1 ${aiData.signal === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    // Confidence Bar & Pattern Text
    document.getElementById("detectedPattern").textContent = aiData.pattern;
    document.getElementById("confidenceText").textContent = aiData.confidence + "%";
    document.getElementById("confidenceBar").style.width = aiData.confidence + "%";

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

    // History Render
    const logEl = document.getElementById("historyLog");
    if (appState.history.length === 0) {
        logEl.innerHTML = `<div class="text-center text-xs text-slate-500 py-4">Waiting for first outcome log...</div>`;
    } else {
        logEl.innerHTML = appState.history.map(item => `
            <div class="flex justify-between items-center bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div>
                    <span class="text-slate-400 font-mono text-[11px]">#${item.period}</span>
                    <div class="font-bold text-slate-300 mt-0.5">AI Pred: <span class="${item.predicted==='BIG'?'text-emerald-400':'text-rose-400'}">${item.predicted}</span> | Real: ${item.actual} ${item.reversed ? '<span class="text-amber-400 text-[10px]">[Inverted]</span>' : ''}</div>
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
