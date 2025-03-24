import debug from "debug";
import { Kafka } from "kafkajs";
import dotenv from "dotenv";


dotenv.config()

console.log("process", process.env.BROKER_1)

class kafkaController {
    constructor() {
        this.Kafka = new Kafka({
            clientId: process.env.CLIENT_ID,
            brokers: [process.env.BROKER_1]
        })
    }

    async createTopic(req, res) {
        try {
            const admin = this.Kafka.admin();
            await admin.connect();
            await admin.createTopics({
                topics: [{
                    topic: "first-training-topic",
                    numPartitions: 2,
                    replicationFactor: 1
                }]
            })
            await admin.disconnect();
            res.send({
                status: 'ok',
                message: 'Topic created successfully!'
            })

        } catch (err) {
            console.log("ERROR", err);
            res.status(500).send({
                message: "Failed to create the topic!"
            })
        }
    }
}
export default kafkaController;



