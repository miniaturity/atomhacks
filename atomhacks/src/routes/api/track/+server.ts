import { json, error } from '@sveltejs/kit';
import { N2YO_API_KEY } from '$env/static/private';
import type { N2YOPositionResponse } from '$lib/types/types';
import type { RequestHandler } from './$types';

const ISS_NORAD_ID = 25544;
const SECONDS = 300;  // 5 minutes ahead — 300 transactions per call
const SAMPLE = 5;     // every 5th position → 60 dots

export const GET: RequestHandler = async () => {
    const url =
        `https://api.n2yo.com/rest/v1/satellite/positions` +
        `/${ISS_NORAD_ID}/0/0/0/${SECONDS}&apiKey=${N2YO_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw error(502, 'N2YO request failed');

    const data: N2YOPositionResponse = await res.json();

    const points = data.positions
        .filter((_, i) => i % SAMPLE === 0)
        .map(p => ({
            lat: p.satlatitude,
            lon: p.satlongitude,
            alt: p.sataltitude,
        }));

    return json(points);
};