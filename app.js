const authToken = "ws_5b7eb42ab78754187a87a2c30f00a507f8cc1576ba45df0e9c469536bee4e3ec";

async function fetchGameData(apiUrl) {
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Game Data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
