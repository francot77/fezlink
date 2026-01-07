export type AnalyticsQuery = {
  linkId: string;
  startDate: string;
  endDate: string;
  country?: string;
  deviceType?: string;
  source?: string;
};

export async function fetchLinkAnalytics(query: AnalyticsQuery) {
  const url = new URL(`/api/analytics/link/${query.linkId}`, window.location.origin);
  url.searchParams.append('from', query.startDate);
  url.searchParams.append('to', query.endDate);
  if (query.country) url.searchParams.append('country', query.country);
  if (query.deviceType) url.searchParams.append('device', query.deviceType);
  if (query.source) url.searchParams.append('source', query.source);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('errors.analytics.fetchFailed');
  const apiData = await res.json();
  return apiData;
}

