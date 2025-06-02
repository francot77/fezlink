import { NextApiRequest, NextApiResponse } from 'next';

// /pages/api/webhooks/paddle.js

interface PaddleWebhookBody {
    alert_name: string;
    email?: string;
    [key: string]: unknown;
}

export default async function handler(
    req: NextApiRequest & { body: PaddleWebhookBody },
    res: NextApiResponse
): Promise<void> {
    if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido');
    }

    // 🔐 Opcional: verificación de firma de Paddle (recomendado en producción)
    // const isValid = verifyPaddleSignature(req.body, req.headers['paddle-signature']);
    // if (!isValid) return res.status(403).send('Firma inválida');

    const event: string = req.body.alert_name;

    console.log('Webhook recibido:', event);

    // Ejemplo: manejar suscripción activada
    if (event === 'subscription_created') {
        const { email } = req.body;

        // Aquí podrías:
        // 1. Buscar al usuario por email en Mongo
        // 2. Actualizar su plan a 'premium' en Clerk
        // 3. Guardar registro del evento en Mongo

        console.log('Suscripción creada para', email);
    }

    res.status(200).send('OK');
}
