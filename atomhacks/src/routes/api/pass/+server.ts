import { json, error } from '@sveltejs/kit';
import { N2YO_API_KEY } from '$env/static/private';
import type { N2YOVisualPassResponse } from '$lib/types/types';
import type { RequestHandler } from './$types';

const ISS_NORAD_ID = 25544;

export const GET: RequestHandler = async ({ url }) => {
    const LAT = url.searchParams.get('lat');
	const LONG = url.searchParams.get('lon');
	const ALT = url.searchParams.get('alt') ?? "0";

    let DAYS = "1";
    let MIN_VISIBILITY = "10";
    const furl =
        `https://api.n2yo.com/rest/v1/satellite/visualpasses/` +
        `/${ISS_NORAD_ID}/${LAT}/${LONG}/${ALT}/${DAYS}/${MIN_VISIBILITY}/&apiKey=${N2YO_API_KEY}`;

    const res = await fetch(furl);
    if (!res.ok) {
        throw error(502, 'N2YO request failed');
    }

    const data: N2YOVisualPassResponse = await res.json();
    const p = data.passes[0];

    return json({
        start: p.startUTC,
        end: p.endUTC
    });
};