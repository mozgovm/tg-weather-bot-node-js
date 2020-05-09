const fetch = require('node-fetch');

module.exports = { 
    getLocationName: async function  (lat, lon) {
        const url = `http://whatsthere.maps.sputnik.ru/point?lat=${lat}&lon=${lon}`;
        console.log(url);
        const res = await fetch(url);
        const geodata = await res.json();
        const locationName = geodata.result.address[0].features[0].properties.description;
        return locationName;
    },

    getCoordsByLocationName: async function  (receivedLocation) {
        const url = `http://search.maps.sputnik.ru/search/addr?q=${encodeURIComponent(receivedLocation)}`;
        const res = await fetch(url);
        const geodata = await res.json();
        const address = geodata.result.address;

        if (!address) {
            return;
        }

        const coords = address[0].features[0].geometry.geometries[0].coordinates;
        const locationName = address[0].features[0].properties.title;
        return { coords, locationName };
    },

    getIndexOfLocation: function (lastLocations, locationName) {
        return lastLocations.map((location) => location.locationName === locationName).indexOf(true);
    },

    moveLocation: function (locations, currentIndex, newIndex = 0) {
        if (currentIndex === newIndex) {
            return;
        }
    
        locations.splice(newIndex, 0, locations.splice(currentIndex, 1)[0]);
    }
};
