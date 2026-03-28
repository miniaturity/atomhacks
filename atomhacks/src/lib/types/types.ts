export interface Position {
    name: string;
    id: number;
    latitude: number;
    longitude: number;
    altitude: number;
    velocity: number;
    visibility: string;
    footprint: number;
    timestamp: number;
    daynum: number;
    solar_lat: number;
    solar_lon: number;
    units: string;
}

export interface People {
    people: Person[];
}

interface Person {
    craft: string;
    name: string;
}

export interface N2YOPositionResponse {
    info: {
        satname: string;
        satid: number;
        transactionscount: number;
    };
    positions: N2YOSatPosition[];
}

export interface N2YOSatPosition {
    satlatitude: number;
    satlongitude: number;
    sataltitude: number;
    azimuth: number;
    elevation: number;
    ra: number;
    dec: number;
    timestamp: number;
    eclipsed: boolean;
}

export interface N2YOVisualPassResponse {
    info: {
        satid: number;
        satname: string;
        transactioncount: number;
        passescount: number;
    },
    passes: N2YOPass[];
    
}

export interface N2YOPass {
    startAz: number;
    startAzCompass: number;
    startUTC: number;
    maxAz: number;
    maxAzCompass: number;
    maxEl: number;
    maxUTC: number;
    endAz: number;
    endAzCompass: number;
    endUTC: number;
}