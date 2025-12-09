import requests
import json

try:
    response = requests.post('http://127.0.0.1:8000/api/auth/token/', 
        json={'username': 'admin', 'password': 'admin@123'},
        timeout=5)
    print(f'Status: {response.status_code}')
    print(f'Response: {json.dumps(response.json(), indent=2)}')
except Exception as e:
    print(f'Error: {str(e)}')
