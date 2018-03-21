# In consumers.py
from channels import Group

# Connected to websocket.connect
def ws_add(message, map_id):
    # Accept the connection
    message.reply_channel.send({"accept": True})
    # Add to the map annotation group
    Group("map-%s" % map_id).add(message.reply_channel)

# Connected to websocket.receive
def ws_message(message, map_id):
    Group("map-%s" % map_id).send({
        "text": message.content['text'],
    })

# Connected to websocket.disconnect
def ws_disconnect(message, map_id):
    Group("map-%s" % map_id).discard(message.reply_channel)
