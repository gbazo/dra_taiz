import requests
from typing import Dict, Any, List, Optional
from ..config import settings

class ParseClient:
    def __init__(self):
        self.base_url = settings.PARSE_SERVER_URL
        self.headers = settings.PARSE_HEADERS
    
    def create_object(self, class_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new object in Parse"""
        url = f"{self.base_url}/classes/{class_name}"
        response = requests.post(url, json=data, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_object(self, class_name: str, object_id: str) -> Dict[str, Any]:
        """Get a single object from Parse"""
        url = f"{self.base_url}/classes/{class_name}/{object_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def update_object(self, class_name: str, object_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an object in Parse"""
        url = f"{self.base_url}/classes/{class_name}/{object_id}"
        response = requests.put(url, json=data, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def delete_object(self, class_name: str, object_id: str) -> Dict[str, Any]:
        """Delete an object from Parse"""
        url = f"{self.base_url}/classes/{class_name}/{object_id}"
        response = requests.delete(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def query_objects(self, class_name: str, where: Optional[Dict[str, Any]] = None, 
                     limit: int = 100, skip: int = 0, order: Optional[str] = None) -> List[Dict[str, Any]]:
        """Query objects from Parse"""
        url = f"{self.base_url}/classes/{class_name}"
        params = {"limit": limit, "skip": skip}
        
        if where:
            params["where"] = str(where).replace("'", '"')
        if order:
            params["order"] = order
            
        response = requests.get(url, params=params, headers=self.headers)
        response.raise_for_status()
        return response.json().get("results", [])
    
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """Login user"""
        url = f"{self.base_url}/login"
        data = {"username": username, "password": password}
        response = requests.post(url, json=data, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def create_user(self, username: str, password: str, email: str, **kwargs) -> Dict[str, Any]:
        """Create a new user"""
        url = f"{self.base_url}/users"
        data = {
            "username": username,
            "password": password,
            "email": email,
            **kwargs
        }
        response = requests.post(url, json=data, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_current_user(self, session_token: str) -> Dict[str, Any]:
        """Get current user info"""
        url = f"{self.base_url}/users/me"
        headers = {**self.headers, "X-Parse-Session-Token": session_token}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()

parse_client = ParseClient()