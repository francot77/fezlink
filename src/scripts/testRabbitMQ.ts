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

async function testRabbitMQ() {
  console.log('Testing RabbitMQ connection...');
  
  try {
    const connection = await amqp.connect(RABBITMQ_URI);
    const channel = await connection.createChannel();
    
    console.log('Connected. Publishing test message...');
    
    const testMessage = {
      id: 'test-' + Date.now(),
      linkId: 'test-link',
      timestamp: new Date().toISOString(),
      type: 'click',
      country: 'US',
      source: 'direct',
      deviceType: 'desktop'
    };
    
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify(testMessage)));
    console.log('Message published.');
    
    console.log('Waiting for message...');
    
    await channel.consume(QUEUE_NAME, (msg) => {
      if (msg) {
        console.log('Received message:', msg.content.toString());
        channel.ack(msg);
        console.log('Message acked. Test successful.');
        connection.close();
        process.exit(0);
      }
    });
    
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testRabbitMQ();
