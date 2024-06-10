# Vključitev potrebnih knjižnic
import paho.mqtt.client as mqtt
import time
from datetime import datetime
from prometheus_client import start_http_server, Counter
from prometheus_client import Gauge
import psutil
#10.8.8.1-NEŽA
#10.8.8.2-ALEN
#10.8.8.3-TILEN
import threading

# Prometheus metrics
# More: https://github.com/prometheus/client_python
#       https://prometheus.github.io/client_python/instrumenting/counter/
# Tudi: Gauge
counter_sending = Counter('sending_counter', 'Number of messages send')
SYSTEM_USAGE = Gauge('system_usage_broker',
                    'Hold current system resource usage',
                    ['resource_type'])

# IP naslov MQTT Broker-ja (Mosquitto MQTT)
broker = "127.0.0.1"

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


# Prometheus metrics server
start_http_server(8000)

# Neskončna zanka za pošiljanje sporočil
while True:
    message = datetime.now().strftime("%H:%M:%S")
    ret = producer.publish(topic, message, qos=1, retain=False)
    print("Pošiljanje: " + message + " " + str(ret.rc))
    SYSTEM_USAGE.labels('cpu').set(psutil.cpu_percent())
    SYSTEM_USAGE.labels('memory').set(psutil.virtual_memory().percent)

    # Prometheus metrics
    counter_sending.inc(1)

    time.sleep(2)