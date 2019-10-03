
const osmHelper = {
    fract(num) {
        return num % 1;
    },

    getXFromLon(lon, zoom) {
        return (
            (lon + 180) / 360 * Math.pow(2, zoom)
        );
    },

    getYFromLat(lat, zoom) {
        return (
            (1 - Math.log(
                Math.tan(lat * Math.PI / 180) +
                1 / Math.cos(lat * Math.PI / 180)
            ) / Math.PI) / 2 * Math.pow(2, zoom)
        );
    },

    getLonFromTileX(x, zoom) {
        return (x / Math.pow(2, zoom) * 360 - 180);
    },

    getLatFromTileY(y, zoom) {
        const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    },

    xyToLatLon(x, y, zoom) {
        const lat = this.getLatFromTileY(y, zoom);
        const lon = this.getLonFromTileX(x, zoom);
        return {
            lat,
            lon
        };
    },

    xyToCenterLatLon(x, y, zoom) {
        const latNW = this.getLatFromTileY(y, zoom);
        const lonNW = this.getLonFromTileX(x, zoom);
        const latSE = this.getLatFromTileY(y + 1, zoom);
        const lonSE = this.getLonFromTileX(x + 1, zoom);
        return {
            lat: (latNW + latSE) / 2,
            lon: (lonNW + lonSE) / 2
        };
    },

    getPixelOffset(lat, lon, zoom) {
        const xPos = this.getXFromLon(lon, zoom);
        const yPos = this.getYFromLat(lat, zoom);

        const pxX = this.fract(xPos) * 256;
        const pxY = this.fract(yPos) * 256;
        return {
            pxX,
            pxY
        };
    },

    latLonToXY(lat, lon, zoom) {
        const tileX = Math.floor(this.getXFromLon(lon, zoom));
        const tileY = Math.floor(this.getYFromLat(lat, zoom));
        return {
            tileX,
            tileY,
            zoom
        };
    },

    getBoundingBox(locations) {
        const max = locations.length - 1;
        if (max < 1) {
            return null;
        }

        const allLat = [];
        const allLon = [];
        locations.forEach(item => {
            allLat.push(item.lat);
            allLon.push(item.lon);
        });

        allLat.sort();
        allLon.sort();

        return {
            north: allLat[max],
            west: allLon[0],
            south: allLat[0],
            east: allLon[max]
        }
    },

    getCenterAndZoomForLocations(locations, wd, ht) {
        const bb = this.getBoundingBox(locations);
        const getWidthAndHeight = (bb, zoom) => {
            const northWest = this.latLonToXY(bb.north, bb.west, zoom);
            const southEast = this.latLonToXY(bb.south, bb.east, zoom);
            const width = Math.abs(northWest.tileX - southEast.tileX);
            const height = Math.abs(northWest.tileY - southEast.tileY);
            return {
                width,
                height
            }
        }

        /* loop until zoom found to place bounds within available dimensions */
        let zoom = 18;
        let dimensions = getWidthAndHeight(bb, zoom);
        do {
            zoom -= 1;
            dimensions = getWidthAndHeight(bb, zoom);
        }
        while ((dimensions.width > wd || dimensions.height > ht) && zoom > 1);

        const lat = (bb.north + bb.south) / 2;
        const lon = (bb.west + bb.east) / 2;
        return { lat, lon, zoom };
    }
};

export default osmHelper;

