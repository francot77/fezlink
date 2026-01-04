/* eslint-disable @typescript-eslint/no-explicit-any */
// components/insights/insightMapper.ts
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Globe,
    Calendar,
    Layers,
    Target,
    Smartphone,
    Link2,
    MapPin,
    Activity,
    Zap
} from 'lucide-react';

export function mapInsight(raw: any) {
    const baseInsight = {
        id: raw._id || raw.key,
        type: raw.type,
        category: raw.category,
        priority: raw.priority,
        metricValue: raw.metricValue,
        metricDelta: raw.metricDelta,
        chartData: raw.chartData,
        metadata: raw.metadata,
        relatedIds: raw.relatedIds
    };

    // Traffic insights
    if (raw.key.includes('traffic_growth')) {
        return {
            ...baseInsight,
            icon: TrendingUp,
            title: 'Crecimiento de Tráfico',
            description: `Tu tráfico creció ${Math.abs(raw.metricDelta || 0).toFixed(1)}% en este período.`,
            detail: `Has tenido ${raw.metricValue.toLocaleString()} clicks totales, lo que representa un crecimiento significativo comparado con el período anterior.`,
            metricUnit: 'count'
        };
    }

    if (raw.key.includes('traffic_decline')) {
        return {
            ...baseInsight,
            icon: TrendingDown,
            title: 'Disminución de Tráfico',
            description: `El tráfico disminuyó ${Math.abs(raw.metricDelta || 0).toFixed(1)}% respecto al período anterior.`,
            detail: `Se registraron ${raw.metricValue.toLocaleString()} clicks. Considera revisar tus estrategias de distribución y promoción.`,
            metricUnit: 'count'
        };
    }

    if (raw.key.includes('traffic_spike')) {
        const date = raw.metadata?.date || 'Desconocida';
        return {
            ...baseInsight,
            icon: Zap,
            title: 'Pico de Tráfico Detectado',
            description: `Se detectó un pico inusual de ${raw.metricValue.toLocaleString()} clicks.`,
            detail: `El ${date} hubo un incremento de ${Math.abs(raw.metricDelta || 0).toFixed(1)}% sobre el promedio diario. Esto puede indicar contenido viral o campaña exitosa.`,
            metricUnit: 'count'
        };
    }

    // Geography insights
    if (raw.key.includes('geo_concentration')) {
        const country = raw.metadata?.country || 'desconocido';
        return {
            ...baseInsight,
            icon: MapPin,
            title: 'Concentración Geográfica',
            description: `${raw.metricValue.toFixed(0)}% de tu tráfico proviene de ${country}.`,
            detail: `Tu audiencia está altamente concentrada en ${country}. Considera estrategias específicas para este mercado o explora oportunidades en otras regiones.`,
            metricUnit: 'percent'
        };
    }

    if (raw.key.includes('geo_diversification')) {
        return {
            ...baseInsight,
            icon: Globe,
            title: 'Audiencia Diversificada',
            description: `Tu audiencia está distribuida en ${raw.metricValue} países diferentes.`,
            detail: `Tienes presencia internacional con tráfico significativo desde múltiples países. Esto indica un alcance global saludable.`,
            metricUnit: 'count'
        };
    }

    if (raw.key.includes('geo_emerging')) {
        const country = raw.metadata?.country || 'desconocido';
        return {
            ...baseInsight,
            icon: Globe,
            title: 'Mercado Emergente',
            description: `${country} está generando ${raw.metricValue.toFixed(0)}% de tu tráfico.`,
            detail: `${country} se está convirtiendo en una fuente importante de tráfico. Considera crear contenido específico para esta audiencia.`,
            metricUnit: 'percent'
        };
    }

    // Performance insights
    if (raw.key.includes('performance_high_engagement')) {
        const avgClicks = raw.metadata?.avgClicksPerLink || 0;
        return {
            ...baseInsight,
            icon: Target,
            title: 'Alto Engagement',
            description: `Promedio de ${Math.round(raw.metricValue)} clicks por link.`,
            detail: `Tus links están teniendo excelente rendimiento con ${avgClicks} clicks por link en promedio. Tu contenido resuena bien con tu audiencia.`,
            metricUnit: 'count'
        };
    }

    if (raw.key.includes('performance_low_engagement')) {
        const activeLinks = raw.metadata?.activeLinks || 0;
        return {
            ...baseInsight,
            icon: AlertTriangle,
            title: 'Engagement Bajo',
            description: `Solo ${raw.metricValue.toFixed(1)} clicks promedio por link.`,
            detail: `Con ${activeLinks} links activos, el engagement es bajo. Considera optimizar tus títulos, descripciones o estrategia de distribución.`,
            metricUnit: 'count'
        };
    }

    if (raw.key.includes('performance_top_link')) {
        const slug = raw.metadata?.slug || 'link';
        const clicks = raw.metadata?.clicks || 0;
        return {
            ...baseInsight,
            icon: Link2,
            title: 'Link Destacado',
            description: `/${slug} concentra ${raw.metricValue.toFixed(0)}% del tráfico total.`,
            detail: `Este link ha generado ${clicks.toLocaleString()} clicks. Analiza qué hace que este contenido sea exitoso y replica esa estrategia.`,
            metricUnit: 'percent'
        };
    }

    // Temporal insights
    if (raw.key.includes('temporal_peak_day')) {
        const dayName = raw.metadata?.dayOfWeek || 'Desconocido';
        return {
            ...baseInsight,
            icon: Calendar,
            title: 'Día Pico Identificado',
            description: `${dayName} concentra ${raw.metricValue.toFixed(0)}% del tráfico semanal.`,
            detail: `Los ${dayName}s son tu día más fuerte. Considera programar contenido importante o campañas en este día.`,
            metricUnit: 'percent'
        };
    }

    if (raw.key.includes('temporal_weekend_peak')) {
        const weekendAvg = raw.metadata?.weekendAvg || 0;
        const weekdayAvg = raw.metadata?.weekdayAvg || 0;
        return {
            ...baseInsight,
            icon: Calendar,
            title: 'Fines de Semana Activos',
            description: `Los fines de semana tienen ${raw.metricValue.toFixed(0)}% más actividad.`,
            detail: `Promedio de fin de semana: ${weekendAvg.toLocaleString()} clicks vs ${weekdayAvg.toLocaleString()} entre semana. Tu audiencia es más activa los fines de semana.`,
            metricUnit: 'percent'
        };
    }

    if (raw.key.includes('temporal_weekday_peak')) {
        const weekdayAvg = raw.metadata?.weekdayAvg || 0;
        const weekendAvg = raw.metadata?.weekendAvg || 0;
        return {
            ...baseInsight,
            icon: Calendar,
            title: 'Semana Laboral Activa',
            description: `Los días de semana tienen ${raw.metricValue.toFixed(0)}% más actividad.`,
            detail: `Promedio entre semana: ${weekdayAvg.toLocaleString()} clicks vs ${weekendAvg.toLocaleString()} fin de semana. Tu audiencia es más activa durante la semana.`,
            metricUnit: 'percent'
        };
    }

    // Device insights
    if (raw.key.includes('device_dominance')) {
        const device = raw.metadata?.device || 'desconocido';
        return {
            ...baseInsight,
            icon: Smartphone,
            title: 'Dispositivo Dominante',
            description: `${raw.metricValue.toFixed(0)}% del tráfico viene desde ${device}.`,
            detail: `La mayoría de tu audiencia usa ${device}. Optimiza tu experiencia para este dispositivo.`,
            metricUnit: 'percent'
        };
    }

    // Source insights
    if (raw.key.includes('source_concentration')) {
        const source = raw.metadata?.source || 'desconocida';
        return {
            ...baseInsight,
            icon: Activity,
            title: 'Fuente Concentrada',
            description: `${raw.metricValue.toFixed(0)}% del tráfico viene de ${source}.`,
            detail: `Dependes mucho de ${source}. Considera diversificar tus canales de distribución para reducir riesgos.`,
            metricUnit: 'percent'
        };
    }

    if (raw.key.includes('source_diversification')) {
        return {
            ...baseInsight,
            icon: Layers,
            title: 'Fuentes Diversificadas',
            description: `Tráfico balanceado desde ${raw.metricValue} fuentes diferentes.`,
            detail: `Tienes una buena diversificación de canales. Esto reduce el riesgo de dependencia de una sola plataforma.`,
            metricUnit: 'count'
        };
    }

    // Fallback genérico
    return {
        ...baseInsight,
        icon: AlertTriangle,
        title: 'Insight Detectado',
        description: `Se detectó un patrón en ${raw.category}.`,
        detail: `Valor: ${raw.metricValue}`,
        metricUnit: 'count'
    };
}