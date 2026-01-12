import amqp from 'amqplib';

const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost';
const EXCHANGE_NAME = 'analytics.direct';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

let connectionPromise: Promise<amqp.ChannelModel> | null = null;

export async function getRabbitMQChannel(): Promise<amqp.Channel | null> {
  try {
    if (channel) return channel;

    if (!connection) {
      // Prevent multiple concurrent connection attempts
      if (!connectionPromise) {
        console.log('[RabbitMQ] Connecting...');
        connectionPromise = amqp.connect(RABBITMQ_URI);
      }

      try {
        connection = await connectionPromise;
      } catch (err) {
        connectionPromise = null;
        throw err;
      }

      connection.on('error', (err) => {
        console.error('[RabbitMQ] Connection error:', err);
        connection = null;
        channel = null;
        connectionPromise = null;
      });

      connection.on('close', () => {
        console.warn('[RabbitMQ] Connection closed');
        connection = null;
        channel = null;
        connectionPromise = null;
      });
    }

    // Reuse channel logic
    channel = await connection.createConfirmChannel(); // Use confirm channel for higher throughput reliability

    // Handle channel errors/close to prevent using a zombie channel
    channel.on('error', (err) => {
      console.error('[RabbitMQ] Channel error:', err);
      channel = null;
    });

    channel.on('close', () => {
      console.warn('[RabbitMQ] Channel closed');
      channel = null;
    });

    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    return channel;
  } catch (error) {
    console.error('[RabbitMQ] Failed to connect/create channel:', error);
    // Ensure we reset state on failure so next attempt tries again
    connection = null;
    channel = null;
    connectionPromise = null;
    return null;
  }
}

export async function publishEvent(routingKey: string, message: any, retries = 3) {
  let attempts = 0;

  while (attempts < retries) {
    const ch = await getRabbitMQChannel();
    if (!ch) {
      console.warn(`[RabbitMQ] Channel not available (Attempt ${attempts + 1}/${retries}). Retrying in 1s...`);
      attempts++;
      if (attempts < retries) await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    try {
      const content = Buffer.from(JSON.stringify(message));
      const isSent = ch.publish(
        EXCHANGE_NAME,
        routingKey,
        content,
        { persistent: true }
      );

      if (!isSent) {
        // Backpressure: wait for drain event
        // console.log('[RabbitMQ] Buffer full, waiting for drain...');
        await new Promise<void>(resolve => {
          const onDrain = () => {
            ch.removeListener('drain', onDrain);
            resolve();
          };
          ch.once('drain', onDrain);
        });
      }

      return true; // Successfully buffered/sent
    } catch (error) {
      console.error(`[RabbitMQ] Publish error (Attempt ${attempts + 1}/${retries}):`, error);
      // Force reset channel on error to be safe
      channel = null;
      attempts++;
      if (attempts < retries) await new Promise(r => setTimeout(r, 1000));
    }
  }

  return false;
}
