import debug from "debug";
import { Kafka, Partitioners } from "kafkajs";
import dotenv from "dotenv";


dotenv.config()

console.log("process", process.env.BROKER_1)

class kafkaController {
    constructor() {
        this.Kafka = new Kafka({
            clientId: process.env.CLIENT_ID,
            brokers: [process.env.BROKER_1],
            retry: {
                retries: 20,
                initialRetryTime: 300,
              },
        })
    }

    

    async createTopic(req, res) {
        try {
            const { topicName } = req.body;
    
            if (!topicName) {
                return res.status(400).send({
                    message: "Topic name is required!"
                });
            }
    
            const admin = this.Kafka.admin();
            await admin.connect();
    
            await admin.createTopics({
                topics: [{
                    topic: topicName,
                    numPartitions: 2,
                    replicationFactor: 1
                }]
            });
    
            await admin.disconnect();
    
            res.send({
                status: 'ok',
                message: `Topic '${topicName}' created successfully!`
            });
    
        } catch (err) {
            console.error("ERROR", err);
            res.status(500).send({
                message: "Failed to create the topic!"
            });
        }
    }
    
    async publishMessageToTopic(req, res) {
        const { topicName, message } = req.body;
    
        if (!topicName) {
            return res.status(400).send({
                message: "Topic name is required!"
            });
        }
    
        if (!message) {
            return res.status(400).send({
                message: "Message is required!"
            });
        }
    
        const producer = this.Kafka.producer();
        try {
            await producer.connect();
            await producer.send({
                topic: topicName,
                messages: [{ value: message }]
            });
    
            res.send({
                status: 'ok',
                message: `Message published to topic '${topicName}' successfully!`
            });
        } catch (err) {
            console.error("Error while publishing message on topic", err);
            res.status(500).send({
                message: "Failed to publish the message!"
            });
        } finally {
            await producer.disconnect();
        }
    }
    
    async consumeMessageFromTopic(req, res) {
        const { topicName } = req.body;
    
        if (!topicName) {
            return res.status(400).json({ message: "Topic name is required!" });
        }
        const uniqueGroupId = `consumer-${Date.now()}`;

        const consumer = this.Kafka.consumer({ groupId: uniqueGroupId }); // No group
    
        let messages = [];
    
        try {
            await consumer.connect();
    
            // Get topic partitions
            const metadata = await consumer.describeTopic(topicName);
            const partitions = metadata.partitions.map(p => p.partition);
    
            // Manually assign partitions
            await consumer.assign(partitions.map(partition => ({ topic: topicName, partition })));
    
            console.log(`Fetching all messages from topic: ${topicName}`);
    
            let keepFetching = true;
            setTimeout(() => { keepFetching = false; }, 5000); // Stop after 5 seconds
    
            while (keepFetching) {
                const records = await consumer.poll(); // Manually poll for messages
                for (const record of records) {
                    messages.push(record.value.toString());
                }
            }
    
            await consumer.disconnect();
    
            res.status(200).json({
                status: 'ok',
                messages: messages.length ? messages : "No messages found!",
            });
    
        } catch (err) {
            console.error("Error while consuming messages:", err);
            res.status(500).json({ message: "Failed to consume messages." });
        }
    }
    
    
    
    
    
      
      
      
      
}
export default kafkaController;



