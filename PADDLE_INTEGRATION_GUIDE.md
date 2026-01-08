# Guía de Integración de Paddle (Suscripciones, Cancelaciones y Downgrades)

Esta guía detalla los pasos necesarios para implementar un sistema de suscripciones robusto usando Paddle, integrando las funcionalidades de `PricingSection` que hemos construido.

## 1. Configuración de Paddle Dashboard

### 1.1 Crear Productos y Precios
1.  Ve a **Catalog > Products** en tu dashboard de Paddle.
2.  Crea dos productos: "Starter Plan" y "Pro Plan".
3.  Para cada producto, crea dos precios (Price):
    *   **Mensual:** Configura el monto (ej. $3.99) y la frecuencia (Monthly).
    *   **Anual:** Configura el monto (ej. $38.40) y la frecuencia (Yearly).
4.  **IMPORTANTE:** Copia los `Price ID` (ej. `pri_01...`) de cada uno.
5.  Actualiza el archivo `src/components/PricingSection.tsx` con estos IDs reales en el array `plans`.

### 1.2 Configurar Webhooks
1.  Ve a **Developer Tools > Notifications (Webhooks)**.
2.  Crea una nueva suscripción a notificaciones apuntando a tu endpoint backend (ej. `https://tu-dominio.com/api/webhooks/paddle`).
3.  Selecciona los eventos críticos:
    *   `subscription.created`: Cuando alguien compra por primera vez.
    *   `subscription.updated`: Cuando alguien hace upgrade/downgrade o se renueva.
    *   `subscription.canceled`: Cuando alguien cancela.
    *   `transaction.completed`: Para registrar pagos exitosos.

## 2. Implementación del Backend (API Routes)

Necesitas crear endpoints para manejar la lógica de negocio que Paddle no hace en el frontend.

### 2.1 Webhook Handler (`/api/webhooks/paddle`)
Este es el cerebro de tu sistema. Debe:
1.  Verificar la firma del webhook (para seguridad).
2.  Leer el evento (`event_type`).
3.  Actualizar tu base de datos (tabla `User` o `Subscription`).
    *   Guardar `subscriptionId`, `status` (active, past_due, canceled), `planId`, `nextBillDate`.

### 2.2 Endpoint de Cancelación (`/api/subscription/cancel`)
Este endpoint será llamado por el botón "Cancel Subscription" del dashboard.

```typescript
// Ejemplo (Next.js API Route)
export async function POST(req) {
  const session = await getSession(req);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  
  // Llamada a la API de Paddle para cancelar
  // Docs: https://developer.paddle.com/api-reference/subscriptions/cancel-subscription
  const paddleRes = await fetch(`https://api.paddle.com/subscriptions/${user.subscriptionId}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.PADDLE_API_KEY}` },
    body: JSON.stringify({ effective_from: 'next_billing_period' }) // Cancelar al final del ciclo
  });

  if (paddleRes.ok) {
     // Actualizar DB local a 'canceling' o esperar al webhook 'subscription.updated'
     return new Response('Canceled');
  }
}
```

### 2.3 Endpoint de Modificación (`/api/subscription/update`) [Para Downgrades Avanzados]
Paddle permite hacer upgrades/downgrades simplemente abriendo el checkout con el nuevo `priceId` y pasando el `subscriptionId` actual. Sin embargo, para un control total (prorrateo), puedes usar la API:

```typescript
// Docs: https://developer.paddle.com/api-reference/subscriptions/update-subscription
const body = {
  items: [{ price_id: NEW_PRICE_ID, quantity: 1 }],
  proration_billing_mode: 'prorated_immediately'
};
```

## 3. Frontend: Integración en `PricingSection.tsx`

Ya hemos preparado el terreno. Ahora necesitas conectar los cables.

### 3.1 Upgrade / Downgrade
En la función `handleCheckout` de `PricingSection.tsx`:

```typescript
const handleCheckout = (priceId: string) => {
  // ... validaciones ...
  
  // SI el usuario ya tiene una suscripción activa (esto lo sabes por useSubscription o useAuth)
  // Debes pasar el subscriptionId al abrir el checkout para que Paddle sepa que es una actualización.
  
  const checkoutOptions = {
    items: [{ priceId: priceId, quantity: 1 }],
    customer: { email: userEmail },
  };

  // Si ya es premium, añadir lógica de actualización:
  // if (accountType !== 'free' && subscriptionId) {
  //    // Opción A: Dejar que Paddle detecte por email (menos seguro/fiable)
  //    // Opción B (Recomendada): Usar API backend para generar un 'transactionId' de actualización y pasarlo aquí.
  // }

  paddle.Checkout.open(checkoutOptions);
};
```

### 3.2 Cancelación
En la función `handleCancelSubscription`:

```typescript
const handleCancelSubscription = async () => {
   if (confirm('...')) {
      try {
        const res = await fetch('/api/subscription/cancel', { method: 'POST' });
        if (res.ok) {
           toast.success('Suscripción cancelada. Tendrás acceso hasta el final del periodo.');
           // Recargar datos de suscripción para actualizar UI
           window.location.reload(); 
        }
      } catch (error) {
        toast.error('Error al cancelar');
      }
   }
}
```

## 4. Pruebas (Sandbox)
1.  Usa el entorno Sandbox de Paddle (`sandbox-api.paddle.com`).
2.  Usa tarjetas de prueba de Paddle para simular pagos exitosos y fallidos.
3.  Verifica que tu webhook recibe los eventos y actualiza la base de datos correctamente.
4.  Prueba el flujo completo: Free -> Starter -> Pro -> Cancelar.
