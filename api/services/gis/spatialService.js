/**
 * Spatial Intelligence Service
 * Uses Haversine calculations instead of PostGIS to keep the database lightweight.
 */

class SpatialService {
    
    // Calculates distance between two coordinates in kilometers
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Check if point is inside a geofence (Ray-Casting Algorithm for Polygon)
    isInsideGeofence(pointLat, pointLon, geofenceCoordinates) {
        let isInside = false;
        let j = geofenceCoordinates.length - 1;
        
        for (let i = 0; i < geofenceCoordinates.length; i++) {
            const xi = geofenceCoordinates[i].lat;
            const yi = geofenceCoordinates[i].lon;
            const xj = geofenceCoordinates[j].lat;
            const yj = geofenceCoordinates[j].lon;

            const intersect = ((yi > pointLon) !== (yj > pointLon))
                && (pointLat < (xj - xi) * (pointLon - yi) / (yj - yi) + xi);
                
            if (intersect) isInside = !isInside;
            j = i;
        }

        return isInside;
    }

    async findNearbyAssets(baseLat, baseLon, radiusKm, assets) {
        return assets.filter(asset => {
            if (!asset.metadata || !asset.metadata.coordinates) return false;
            const dist = this.calculateDistance(baseLat, baseLon, asset.metadata.coordinates.lat, asset.metadata.coordinates.lon);
            return dist <= radiusKm;
        });
    }
}

module.exports = new SpatialService();
