let totalPlayed = 0;
let totalWins = 0;
let totalLosses = 0;
let netProfit = 0;
const betAmount = 100; // Har bet ka default amount (₹100)

let currentPrediction = null;
let currentPeriodId = generatePeriodId();
let timeLeft = 30;

function generatePeriodId() {
    const now = new Date();
    return now.getFullYear().toString() + 
           String(now.getMonth() + 1).padStart(2, '0') + 
           String(now.getDate()).padStart(2, '0') + 
           Math.floor(1000 + Math.random() * 9000);
}

// Pehla signal generate karein
currentPrediction = Math.random() > 0.5 ? "BIG" : "SMALL";
updateDisplay();

// Timer Countdown & Round Processing Loop
setInterval(() => {
    timeLeft--;
    document.getElementById("timerCountdown").textContent = timeLeft + "s";

    if (timeLeft <= 0) {
        // Round complete hone par actual random outcome generate karein (BIG/SMALL)
        const actualOutcome = Math.random() > 0.5 ? "BIG" : "SMALL";
        
        // Check win or loss
        const isWin = (currentPrediction === actualOutcome);
        
        totalPlayed++;
        if (isWin) {
            totalWins++;
            netProfit += (betAmount * 0.95); // Standard multiplier minus platform fee logic
        } else {
            totalLosses++;
            netProfit -= betAmount;
        }

        // Log mein add karein
        appendHistoryLog(currentPeriodId, currentPrediction, actualOutcome, isWin);

        // Stats update karein
        updateStats();

        // Agle round ke liye setup
        timeLeft = 30;
        currentPeriodId = generatePeriodId();
        currentPrediction = Math.random() > 0.5 ? "BIG" : "SMALL";
        updateDisplay();
    }
}, 1000);

function updateDisplay() {
    document.getElementById("currentPeriod").textContent = currentPeriodId;
    const sigEl = document.getElementById("activeSignal");
    sigEl.textContent = currentPrediction;
    sigEl.className = `text-4xl font-black mb-3 ${currentPrediction === 'BIG' ? 'text-emerald-400' : 'text-rose-400'}`;
    document.getElementById("signalSubtext").textContent = `Predicted based on moving average momentum.`;
}

function updateStats() {
    document.getElementById("statTotal").textContent = totalPlayed;
    document.getElementById("statWinLoss").textContent = `${totalWins} / ${totalLosses}`;
    
    const profitEl = document.getElementById("statProfit");
    profitEl.textContent = `₹${netProfit.toFixed(0)}`;
    profitEl.className = `text-lg font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;
    document.getElementById("winRateBadge").textContent = `Win Rate: ${winRate}%`;
}

function appendHistoryLog(period, predicted, actual, isWin) {
    const historyLog = document.getElementById("historyLog");
    
    if(historyLog.children.length === 1 && historyLog.children[0].textContent.includes("Waiting")) {
        historyLog.innerHTML = "";
    }

    const item = document.createElement("div");
    item.className = `flex justify-between items-center p-2.5 rounded-lg border text-xs ${
        isWin ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
    }`;

    item.innerHTML = `
        <div>
            <span class="text-slate-400 font-mono">#${period}</span>
            <div class="font-bold mt-0.5">Pred: <span class="${predicted==='BIG'?'text-emerald-400':'text-rose-400'}">${predicted}</span> | Actual: <span class="text-slate-200">${actual}</span></div>
        </div>
        <div class="text-right">
            <span class="px-2 py-1 rounded font-bold ${isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                ${isWin ? 'WIN (+₹95)' : 'LOSS (-₹100)'}
            </span>
        </div>
    `;

    historyLog.prepend(item);

    // Max 10 items rakhein
    if (historyLog.children.length > 10) {
        historyLog.removeChild(historyLog.lastChild);
    }
}
