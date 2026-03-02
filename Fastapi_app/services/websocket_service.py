# fastapi_app/services/websocket_service.py
from datetime import datetime
import json
from typing import Dict, Any

class WebSocketManager:
    def __init__(self):
        self.active_connections = []
        self.connection_data = {}

    async def connect(self, websocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_data[websocket] = {
            "connected_at": datetime.now(),
            "client_info": None
        }
        print(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_data:
            del self.connection_data[websocket]
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending message to client: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        if not self.active_connections:
            return
            
        message_str = json.dumps(message, default=str, ensure_ascii=False)
        disconnected = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
                disconnected.append(connection)
                
        for connection in disconnected:
            self.disconnect(connection)

# Global instance
manager = WebSocketManager()

async def notify_clients(event_type: str, **data):
    """Helper function to broadcast notifications to all connected clients"""
    payload = {
        "type": event_type,
        "timestamp": datetime.now().isoformat(),
        **data
    }
    await manager.broadcast(payload)

# fastapi_app/services/websocket_service.py
# # fastapi_app/services/websocket_service.py
# from datetime import datetime
# import json
# from typing import Dict, Any

# class WebSocketManager:
#     def __init__(self):
#         self.active_connections = []
#         self.connection_data = {}

#     async def connect(self, websocket):
#         await websocket.accept()
#         self.active_connections.append(websocket)
#         self.connection_data[websocket] = {
#             "connected_at": datetime.now(),
#             "client_info": None
#         }
#         print(f"Client connected. Total connections: {len(self.active_connections)}")

#     def disconnect(self, websocket):
#         if websocket in self.active_connections:
#             self.active_connections.remove(websocket)
#         if websocket in self.connection_data:
#             del self.connection_data[websocket]
#         print(f"Client disconnected. Total connections: {len(self.active_connections)}")

#     async def send_personal_message(self, message: str, websocket):
#         try:
#             await websocket.send_text(message)
#         except Exception as e:
#             print(f"Error sending message to client: {e}")
#             self.disconnect(websocket)

#     async def broadcast(self, message: Dict[str, Any]):
#         if not self.active_connections:
#             return
            
#         message_str = json.dumps(message, default=str, ensure_ascii=False)
#         disconnected = []
        
#         for connection in self.active_connections:
#             try:
#                 await connection.send_text(message_str)
#             except Exception as e:
#                 print(f"Error broadcasting to client: {e}")
#                 disconnected.append(connection)
                
#         for connection in disconnected:
#             self.disconnect(connection)

# # Global instance
# manager = WebSocketManager()

# def notify_clients(event_type: str, **data):
#     """Helper function to broadcast notifications to all connected clients"""
#     payload = {
#         "type": event_type,
#         "timestamp": datetime.now().isoformat(),
#         **data
#     }
#     # Don't await here - let the WebSocket endpoint handle it properly
#     # We'll just pass the payload back
#     return payload