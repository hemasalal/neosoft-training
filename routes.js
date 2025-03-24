import { Router } from 'express';
import KafkaController from './kafkaController.js';

const router = Router();
const kafkaController = new KafkaController();

// Route definition
router.post('/create-topic', kafkaController.createTopic.bind(kafkaController));

export { router };

