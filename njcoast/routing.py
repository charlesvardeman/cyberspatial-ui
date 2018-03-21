# In routing.py
from channels.routing import route
from njcoast.consumers import ws_add, ws_message, ws_disconnect

channel_routing = [
    route("websocket.connect", ws_add, path=r"^/map-socket/(?P<map_id>[a-zA-Z0-9_]+)/$"),
    route("websocket.receive", ws_message, path=r"^/map-socket/(?P<map_id>[a-zA-Z0-9_]+)/$"),
    route("websocket.disconnect", ws_disconnect, path=r"^/map-socket/(?P<map_id>[a-zA-Z0-9_]+)/$"),
]
