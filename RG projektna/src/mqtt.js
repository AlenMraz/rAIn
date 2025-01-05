function startMQTTClient(broker, port, topic, clientId = "client_1", cleanSession = false) {
    // Create an MQTT client
    const client = mqtt.connect(`mqtt://${broker}:${port}`, {
        clientId: clientId,
        clean: cleanSession
    });

    // Event: Connected to the broker
    client.on('connect', () => {
        console.log("Connected to MQTT broker");
        client.subscribe(topic, { qos: 1 }, (err) => {
            if (!err) {
                console.log(`Subscribed to topic: ${topic}`);
            } else {
                console.error("Subscription error:", err);
            }
        });
    });

    // Event: Received a message
    client.on('message', (topic, message) => {
        console.log(`Received message from topic ${topic}: ${message.toString()}`);
    });

    // Event: Error
    client.on('error', (error) => {
        console.error("MQTT error:", error);
    });

    // Event: Reconnecting
    client.on('reconnect', () => {
        console.log("Reconnecting to MQTT broker...");
    });

    // Event: Disconnected
    client.on('close', () => {
        console.log("Disconnected from MQTT broker");
    });

    return client; // Return the client instance for further use if needed
}
export { startMQTTClient };