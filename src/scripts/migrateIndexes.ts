// scripts/migrateIndexes.ts
import dbConnect from '@/lib/mongodb';
import { AnalyticsEvent } from '@/app/models/analyticsEvents';
import AnalyticsDaily from '@/app/models/analyticsDaily';
import { Link } from '@/app/models/links';

async function migrateIndexes() {
    await dbConnect();

    console.log('🔧 Iniciando migración de índices...\n');

    // 1. AnalyticsEvent
    console.log('📦 AnalyticsEvent:');
    const eventCollection = AnalyticsEvent.collection;

    // Eliminar índices antiguos innecesarios
    try {
        await eventCollection.dropIndex('processedAt_1');
        console.log('  ✓ Eliminado índice antiguo processedAt_1');
    } catch {
        console.log('  ℹ️  índice processedAt_1 no existía');
    }

    // Agregar campos nuevos a documentos existentes
    await eventCollection.updateMany(
        { processingStartedAt: { $exists: false } },
        {
            $set: {
                processingStartedAt: null,
                workerId: null
            }
        }
    );
    console.log('  ✓ Agregados campos processingStartedAt y workerId');

    // Setear expiresAt en eventos ya procesados
    await eventCollection.updateMany(
        {
            processedAt: { $ne: null },
            expiresAt: { $exists: false }
        },
        {
            $set: {
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        }
    );
    console.log('  ✓ Configurado expiresAt en eventos procesados\n');

    // 2. AnalyticsDaily
    console.log('📦 AnalyticsDaily:');
    const dailyCollection = AnalyticsDaily.collection;

    // Eliminar índices individuales redundantes
    try {
        await dailyCollection.dropIndex('linkId_1');
        console.log('  ✓ Eliminado índice redundante linkId_1');
    } catch {
        console.log('  ℹ️  índice linkId_1 no existía');
    }

    try {
        await dailyCollection.dropIndex('date_1');
        console.log('  ✓ Eliminado índice redundante date_1');
    } catch {
        console.log('  ℹ️  índice date_1 no existía');
    }
    console.log();

    // 3. Link
    console.log('📦 Link:');
    const linkCollection = Link.collection;

    // Agregar campo isActive
    await linkCollection.updateMany(
        { isActive: { $exists: false } },
        { $set: { isActive: true } }
    );
    console.log('  ✓ Agregado campo isActive\n');

    // 4. Crear índices nuevos (mongoose lo hace automático al importar modelos)
    console.log('📦 Sincronizando índices con Mongoose...');
    await AnalyticsEvent.syncIndexes();
    await AnalyticsDaily.syncIndexes();
    await Link.syncIndexes();

    console.log('\n✅ Migración completada!\n');

    // Mostrar índices actuales
    console.log('📋 Índices actuales:');
    console.log('\nAnalyticsEvent:', await eventCollection.indexes());
    console.log('\nAnalyticsDaily:', await dailyCollection.indexes());
    console.log('\nLink:', await linkCollection.indexes());

    process.exit(0);
}

migrateIndexes().catch(err => {
    console.error('❌ Error en migración:', err);
    process.exit(1);
});