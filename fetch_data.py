import requests

AUTH_TOKEN = "ws_5b7eb42ab78754187a87a2c30f00a507f8cc1576ba45df0e9c469536bee4e3ec"
# Niche "https://wingobot.com/api/data" ko apni sahi API URL se replace karein
API_URL = "https://wingobot.com/api/data"

headers = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(API_URL, headers=headers)
    print("Status Code:", response.status_code)
    print("Response Data:", response.text)
except Exception as e:
    print("Error:", e)
