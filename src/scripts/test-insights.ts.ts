// scripts/test-insights.ts
/**
 * Script para testear el cálculo de insights de un usuario específico
 *
 * Uso:
 *   npm run insights:test -- --user-id=USER_ID_HERE
 *   ts-node scripts/test-insights.ts --user-id=USER_ID_HERE
 */

import mongoose from 'mongoose';
import analyticsDaily from '@/app/models/analyticsDaily';
import insightsCache from '@/app/models/insightsCache';
import { Link } from '@/app/models/links';

// Tipos para los documentos
interface LinkDocument {
  _id: mongoose.Types.ObjectId;
  shortCode: string;
  userId: string;
}

interface AnalyticsDailyDocument {
  _id: mongoose.Types.ObjectId;
  linkId: mongoose.Types.ObjectId;
  date: string;
  totalClicks: number;
  byCountry?: Map<string, number>;
  bySource?: Map<string, number>;
  byDevice?: Map<string, number>;
}

interface InsightsCacheDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  period: string;
  calculationStatus: string;
  insights?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
  }>;
  updatedAt: Date;
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI no está definida');
  }
  await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB');
  console.log('mongoose conn:', mongoose.connection.id);
  console.log('Link conn:', Link.db.id);
  console.log('Link collection:', Link.collection.namespace);
}

function getDateRange(period: string) {
  const endDate = new Date();
  const startDate = new Date();

  if (period === '7d') startDate.setDate(endDate.getDate() - 7);
  else if (period === '30d') startDate.setDate(endDate.getDate() - 30);
  else if (period === '90d') startDate.setDate(endDate.getDate() - 90);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

async function testUserInsights(userId: string) {
  console.log(`\n🔍 Probando insights para usuario: ${userId}`);
  console.log('='.repeat(60));

  try {
    await connectDB();

    // 1. Verificar que el usuario tiene links
    const links = await Link.find({ userId }).select('_id shortCode').lean<LinkDocument[]>();

    console.log(`\n📎 Links encontrados: ${links.length}`);

    if (links.length === 0) {
      console.log('⚠️  Usuario no tiene links');
      return;
    }

    links.slice(0, 5).forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.shortCode}`);
    });
    if (links.length > 5) {
      console.log(`  ... y ${links.length - 5} más`);
    }

    // 2. Verificar analytics
    const { startDate, endDate } = getDateRange('30d');
    const linkIds = links.map((l) => l._id);

    const analytics = await analyticsDaily
      .find({
        linkId: { $in: linkIds },
        date: { $gte: startDate, $lte: endDate },
      })
      .lean<AnalyticsDailyDocument[]>();

    console.log(`\n📊 Analytics encontrados: ${analytics.length} documentos`);

    if (analytics.length === 0) {
      console.log('⚠️  No hay analytics en los últimos 30 días');
      return;
    }

    const totalClicks = analytics.reduce((sum, a) => sum + a.totalClicks, 0);
    console.log(`   Total clicks: ${totalClicks}`);

    // 3. Agrupar por link
    const clicksByLink = new Map<string, number>();
    analytics.forEach((stat) => {
      const linkId = stat.linkId.toString();
      clicksByLink.set(linkId, (clicksByLink.get(linkId) || 0) + stat.totalClicks);
    });

    console.log(`\n🔝 Top 5 links por clicks:`);
    Array.from(clicksByLink.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([linkId, clicks], i) => {
        const link = links.find((l) => l._id.toString() === linkId);
        const percentage = ((clicks / totalClicks) * 100).toFixed(1);
        console.log(
          `  ${i + 1}. ${link?.shortCode || 'unknown'}: ${clicks} clicks (${percentage}%)`
        );
      });

    // 4. Top países
    const countriesMap = new Map<string, number>();
    analytics.forEach((stat) => {
      if (stat.byCountry) {
        for (const [country, clicks] of stat.byCountry) {
          countriesMap.set(country, (countriesMap.get(country) || 0) + clicks);
        }
      }
    });

    if (countriesMap.size > 0) {
      console.log(`\n🌍 Top 5 países:`);
      Array.from(countriesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([country, clicks], i) => {
          const percentage = ((clicks / totalClicks) * 100).toFixed(1);
          console.log(`  ${i + 1}. ${country}: ${clicks} clicks (${percentage}%)`);
        });
    }

    // 5. Verificar cache existente
    const cachedInsights = await insightsCache
      .findOne({
        userId,
        period: '30d',
      })
      .lean<InsightsCacheDocument>();

    if (cachedInsights) {
      const cacheAge = Date.now() - new Date(cachedInsights.updatedAt).getTime();
      const hours = Math.floor(cacheAge / 3600000);
      const minutes = Math.floor((cacheAge % 3600000) / 60000);

      console.log(`\n💾 Cache encontrado:`);
      console.log(`   Estado: ${cachedInsights.calculationStatus}`);
      console.log(`   Insights: ${cachedInsights.insights?.length || 0}`);
      console.log(`   Última actualización: ${hours}h ${minutes}m atrás`);

      if (cachedInsights.insights && cachedInsights.insights.length > 0) {
        console.log(`\n🎯 Insights actuales:`);
        cachedInsights.insights.slice(0, 3).forEach((insight, i) => {
          console.log(`  ${i + 1}. [${insight.type}] ${insight.title}`);
          console.log(`      ${insight.description}`);
        });
      }
    } else {
      console.log(`\n💾 No hay cache para este usuario`);
    }

    console.log('\n✅ Prueba completada!');
    console.log('\n💡 Para calcular insights reales, ejecuta:');
    console.log(`   npm run worker:dev`);
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

// Ejecutar
const args = process.argv.slice(2);
const userIdArg = args.find((arg) => arg.startsWith('--user-id='));

if (!userIdArg) {
  console.error('❌ Debes proporcionar un user ID');
  console.error('Uso: npm run insights:test -- --user-id=USER_ID_HERE');
  process.exit(1);
}

const userId = userIdArg.split('=')[1];

if (!userId || userId.length < 10) {
  console.error('❌ User ID inválido');
  process.exit(1);
}

testUserInsights(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
