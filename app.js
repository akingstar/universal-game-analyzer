const resultsPool = [
    { type: "BIG", color: "text-emerald-400", trend: "Bullish Momentum" },
    { type: "SMALL", color: "text-rose-400", trend: "Bearish Correction" },
    { type: "GREEN", color: "text-emerald-500", trend: "Color Dominance" },
    { type: "RED", color: "text-rose-500", trend: "Inverse Shift" }
];

function generateSignal() {
    const randomItem = resultsPool[Math.floor(Math.random() * resultsPool.length)];
    const randomConfidence = Math.floor(Math.random() * (96 - 78 + 1)) + 78;

    // UI elements update karein
    const signalElement = document.getElementById("signalResult");
    signalElement.textContent = randomItem.type;
    signalElement.className = `text-4xl font-black mb-3 ${randomItem.color}`;

    document.getElementById("confidenceScore").textContent = randomConfidence + "%";
    document.getElementById("trendType").textContent = randomItem.trend;

    // History log mein add karein
    const historyLog = document.getElementById("historyLog");
    const timeNow = new Date().toLocaleTimeString();
    
    // Pehli baar default text hata dein
    if(historyLog.children.length === 1 && historyLog.children[0].textContent.includes("No signals")) {
        historyLog.innerHTML = "";
    }

    const logItem = document.createElement("div");
    logItem.className = "flex justify-between items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-800";
    logItem.innerHTML = `<span class="font-bold ${randomItem.color}">${randomItem.type} (${randomItem.trend})</span> <span class="text-slate-400">${randomConfidence}% • ${timeNow}</span>`;
    
    historyLog.prepend(logItem);

    // Max 5 items rakhein
    if (historyLog.children.length > 5) {
        historyLog.removeChild(historyLog.lastChild);
    }
}
