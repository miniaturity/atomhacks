import { json, error } from '@sveltejs/kit';
import { N2YO_API_KEY } from '$env/static/private';
import type { N2YOPositionResponse } from '$lib/types/types';
import type { RequestHandler } from './$types';

const ISS_NORAD_ID = 25544;

export const GET: RequestHandler = async () => {
    const url =
        `https://api.n2yo.com/rest/v1/satellite/positions` +
        `/${ISS_NORAD_ID}/0/0/0/1&apiKey=${N2YO_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw error(502, 'N2YO request failed');
    }

    const data: N2YOPositionResponse = await res.json();
    const p = data.positions[0];

    return json({
        name:       data.info.satname,
        id:         data.info.satid,
        latitude:   p.satlatitude,
        longitude:  p.satlongitude,
        altitude:   p.sataltitude,
        velocity:   0,           
        visibility: p.eclipsed ? 'eclipsed' : 'daylight',
        footprint:  0,
        timestamp:  p.timestamp,
        daynum:     0,
        solar_lat:  0,
        solar_lon:  0,
        units:      'kilometers',
    });
};