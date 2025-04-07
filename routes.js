import { Router } from 'express';
import KafkaController from './kafkaController.js';

const router = Router();
const kafkaController = new KafkaController();

// Route definition
router.post('/create-topic', kafkaController.createTopic.bind(kafkaController));
router.post('/publish', kafkaController.publishMessageToTopic.bind(kafkaController));
router.post('/consumeMessages', kafkaController.consumeMessageFromTopic.bind(kafkaController));


export { router };

