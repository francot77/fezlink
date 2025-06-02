// hooks/usePaddle.ts
import { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

export function usePaddle() {
    const [paddle, setPaddle] = useState<Paddle | null>(null);

    useEffect(() => {
        const loadPaddle = async () => {
            try {
                const instance = await initializePaddle({
                    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
                });
                instance?.Environment.set("sandbox")
                console.log(instance)
                setPaddle(instance ?? null);
            } catch (err) {
                console.error('Error al inicializar Paddle:', err);
            }
        };

        if (typeof window !== 'undefined') {
            loadPaddle();
        }
    }, []);

    return paddle;
}
