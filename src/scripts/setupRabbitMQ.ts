import amqp from 'amqplib';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
});

const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost';

const EXCHANGE_NAME = 'analytics.direct';
const QUEUE_NAME = 'analytics.clicks';
const ROUTING_KEY = 'event.click';
const DLQ_NAME = 'analytics.clicks.dlq';
const DLQ_EXCHANGE = 'analytics.dlq.direct'; // Optional, can use default

async function setupRabbitMQ() {
  console.log('Connecting to RabbitMQ at', RABBITMQ_URI);
  let connection;
  try {
    connection = await amqp.connect(RABBITMQ_URI);
    const channel = await connection.createChannel();

    console.log(`Asserting Exchange: ${EXCHANGE_NAME}`);
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    // DLQ Setup
    console.log(`Asserting DLQ: ${DLQ_NAME}`);
    await channel.assertQueue(DLQ_NAME, { durable: true });

    // Main Queue Setup with Dead Letter Exchange pointing to DLQ (simplified: direct to DLQ)
    // Or better: use a Dead Letter Exchange.
    // Let's keep it simple: Messages rejected go to DLQ via x-dead-letter-exchange
    
    // We will use the default exchange for DLQ for simplicity or a specific one.
    // Let's use a specific DLX for robustness.
    console.log(`Asserting DLX: ${DLQ_EXCHANGE}`);
    await channel.assertExchange(DLQ_EXCHANGE, 'direct', { durable: true });
    await channel.bindQueue(DLQ_NAME, DLQ_EXCHANGE, 'dead.letter');

    console.log(`Asserting Queue: ${QUEUE_NAME}`);
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DLQ_EXCHANGE,
        'x-dead-letter-routing-key': 'dead.letter',
        'x-queue-type': 'classic', // or 'quorum' for high availability
      },
    });

    console.log(`Binding Queue ${QUEUE_NAME} to Exchange ${EXCHANGE_NAME} with key ${ROUTING_KEY}`);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log('RabbitMQ Setup Completed Successfully');
    await channel.close();
  } catch (error) {
    console.error('Error setting up RabbitMQ:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.close();
  }
}

setupRabbitMQ();
