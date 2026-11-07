const modes = {
    30: { interval: 30, timeLeft: 30, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "BIG", periodId: "" },
    60: { interval: 60, timeLeft: 60, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "SMALL", periodId: "" },
    300: { interval: 300, timeLeft: 300, totalPlayed: 0, wins: 0, losses: 0, profit: 0, history: [], currentPrediction: "BIG", periodId: "" }
};

let activeMode = 30;
const betAmount = 100;
const authToken = "ws_5b7eb42ab78754187a87a2c30f00a507f8cc1576ba45df0e9c469536bee4e3ec";

// Real game live data fetcher using CORS Proxy
async function fetchLiveGameData() {
    const statusEl = document.getElementById("liveStatus");
    statusEl.textContent = "● Syncing...";
    
    try {
        // Public CORS proxy to bypass browser restriction safely
        const targetApi = "https://wingobot.com/api/game-results"; // Replace with actual endpoint if available
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetApi)}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data.contents) {
            const parsed = JSON.parse(data.contents);
            document.getElementById("livePeriod").textContent = parsed.period || "20261107101";
            document.getElementById("liveOutcome").textContent = parsed.outcome || "BIG (Green)";
            statusEl.textContent = "● Live Synced";
            statusEl.className = "px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full";
        } else {
            throw new Error("Invalid feed");
        }
    } catch (err) {
        // Fallback simulation if external endpoint blocks
        const mockLivePeriod = "2026" + Math.floor(100000 + Math.random() * 900000);
        const mockOutcome = Math.random() > 0.5 ? "BIG (Green)" : "SMALL (Red)";
        document.getElementById("livePeriod").textContent = mockLivePeriod;
        document.getElementById("liveOutcome").textContent = mockOutcome;
        
        statusEl.textContent = "● Simulated Live";
        statusEl.className = "px-3 py-1 bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold rounded-full";
    }
}

// Initial Call
fetchLiveGameData();
setInterval(fetchLiveGameData, 10000); // Har 10 seconds mein live status check karega

function generatePeriodId(interval) {
    const now = new Date();
    return now.getFullYear().toString() + 
           String(now.getMonth() + 1).padStart(2, '0') + 
           String(now.getDate()).padStart(2, '0') + 
           interval + "_" + Math.floor(1000 + Math.random() * 9000);
}

[30, 60, 300].forEach(m => {
    modes[m].periodId = generatePeriodId(m);
    modes[m].currentPrediction = Math.random() > 0.5 ? "BIG" : "SMALL";
});

updateUI();

// Timer loop
setInterval(() => {
    [30, 60, 300].forEach(m => {
        modes[m].timeLeft--;

        if (modes[m].timeLeft <= 0) {
            const actualOutcome = Math.random() > 0.5 ? "BIG" : "SMALL";
            const isWin = (modes[m].currentPrediction === actualOutcome);

            modes[m].totalPlayed++;
            if (isWin) {
                modes[m].wins++;
                modes[m].profit += (betAmount * 0.95);
            } else {
                modes[m].losses++;
                modes[m].profit -= betAmount;
            }

            modes[m].history.unshift({
                period: modes[m].periodId,
                pred: modes[m].currentPrediction,
                actual: actualOutcome,
                win: isWin
            });

            if (modes[m].history.length > 15) modes[m].history.pop();

            modes[m].timeLeft = modes[m].interval;
            modes[m].periodId = generatePeriodId(m);
            modes[m].currentPrediction = Math.random() > 0.5 ? "BIG" : "SMALL";
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
}

function updateUI() {
    const data = modes[activeMode];

    document.getElementById("statTotal").textContent = data.totalPlayed;
    document.getElementById("statWinLoss").textContent = `${data.wins} / ${data.losses}`;
    
    const profitEl = document.getElementById("statProfit");
    profitEl.textContent = `₹${data.profit.toFixed(0)}`;
    profitEl.className = `text-lg font-black ${data.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    const winRate = data.totalPlayed > 0 ? ((data.wins / data.totalPlayed) * 100).toFixed(1) : 0;
    document.getElementById("winRateBadge").textContent = `Win Rate: ${winRate}%`;

    document.getElementById("currentPeriod").textContent = data.periodId;
    document.getElementById("timerCountdown").textContent = data.timeLeft + "s";

    const sigEl = document.getElementById("activeSignal");
    sigEl.textContent = data.currentPrediction;
    sigEl.className = `text-4xl font-black mb-3 ${data.currentPrediction === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;

    const historyLog = document.getElementById("historyLog");
    if (data.history.length === 0) {
        historyLog.innerHTML = `<div class="text-center text-xs text-slate-500 py-4">Syncing round history...</div>`;
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
                        ${item.win ? 'WIN (+₹95)' : 'LOSS (-₹100)'}
                    </span>
                </div>
            </div>
        `).join('');
    }
}
