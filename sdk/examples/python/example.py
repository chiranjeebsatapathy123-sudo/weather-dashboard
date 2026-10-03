"""
WeatherOS Python SDK Example
Demonstrates consuming Operational Weather Intelligence APIs.
"""
import urllib.request
import urllib.parse
import json
import urllib.error

class WeatherOSClient:
    def __init__(self, api_key, base_url='https://api.weatheros.com/v1'):
        self.api_key = api_key
        self.base_url = base_url

    def request(self, endpoint, method='GET', data=None):
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Authorization': f"Bearer {self.api_key}",
            'Content-Type': 'application/json'
        }
        
        body = json.dumps(data).encode('utf-8') if data else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except urllib.error.HTTPError as e:
            raise Exception(f"WeatherOS API Error: {e.code} {e.reason}")

    # Weather & Incidents
    def get_weather(self, location):
        return self.request(f"/weather/current?city={urllib.parse.quote(location)}")
    
    def get_incidents(self):
        return self.request("/incidents")
        
    def get_alerts(self):
        return self.request("/alerts")

    # Digital Twins & Operations
    def list_locations(self):
        return self.request("/locations")
        
    def get_device_health(self, device_id):
        return self.request(f"/devices/{device_id}/health")

    # Work Orders
    def create_work_order(self, payload):
        return self.request("/work-orders", method='POST', data=payload)

# Example Usage
if __name__ == "__main__":
    client = WeatherOSClient('weos_your_api_key_here')
    
    try:
        print("Fetching weather...")
        weather = client.get_weather('London')
        print(weather)
        
        print("Creating work order...")
        task = client.create_work_order({
            "title": "Inspect London Warehouse",
            "priority": "HIGH",
            "description": "Rain expected."
        })
        print(task)
    except Exception as e:
        print(e)
