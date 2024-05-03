# Vključitev potrebnih knjižnic
import paho.mqtt.client as mqtt
import time
from datetime import datetime

# Pri namestitvi knjižnice paho-mqtt (pip install 'paho-mqtt>=2.0.0')
# pazite, da boste zagotovo namestili knjižnico z različico >=2.0.0,
# saj se starejše različice razlikuje v klicih funkcij

# IP naslov MQTT Broker-ja (Mosquitto MQTT)
#10.8.8.1-NEŽA
#10.8.8.2-ALEN
#10.8.8.3-TILEN
broker = "10.8.8.2"

# Port MQTT Broker-ja (Mosquitto MQTT)
port = 1883

# Ime topica - vrste
topic = "/data"

def on_connect(client, userdata, flags, reasonCode, properties=None):
  print("Povezava z MQTT: " + str(reasonCode))

# Nastavitev MQTT klienta
producer = mqtt.Client(client_id="producer_1", callback_api_version=mqtt.CallbackAPIVersion.VERSION2)   

# Povezava na MQTT broker
producer.connect(broker, port, 60)

# Callback funkcije
producer.on_connect = on_connect # Ob vzpostavitvi povezave na MQTT broker

# Neskončna zanka za pošiljanje sporočil
while True:
    message = datetime.now().strftime("%H:%M:%S")

    # Zastavica retain zagotavlja, da bo zadnje sporočilo ohranjeno v vrsti
    # QOS 1: delivery at least once
    ret = producer.publish(topic, message, qos=1, retain=False)
    
    print("Pošiljanje: " + message + " " + str(ret.rc))

    time.sleep(2)