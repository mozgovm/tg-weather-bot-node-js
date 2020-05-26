jest.mock('node-fetch', ()=>jest.fn())

const fetch = require('node-fetch');
const fakeResponse = require('./mocks/fakeResponse');
const { getLocationName, getCoordsByLocationName, getIndexOfLocation, moveLocation } = require('../geolocation');
const COORDS_API_RESPONSE = require('./mocks/coords_mock');
const LOCATION_BY_NAME_API_RESPONSE = require('./mocks/location_by_name_mock');
const LOCATION_NOT_FOUND_API_RESPONSE = require('./mocks/location_not_found_mock');
const user = require('./mocks/dbUser');

describe('geolocation-tests', () => {
    test('should return location name with valid coords', async () => {
        const EXPECTED_LOCATION_NAME = 'Комсомольск-на-Амуре';

        fetch.mockImplementation(() => fakeResponse(COORDS_API_RESPONSE));

        const locationName = await getLocationName(50.549923, 137.007948); // координаты Комсомольска-на-Амуре

        expect(locationName).toBe(EXPECTED_LOCATION_NAME);

    });

    test('should return coords snd location name from received location', async () => {
        const EXPECTED_COORDS_AND_NAME = {
            coords: [
                30.316229,
                59.938732
            ],
            locationName: 'Санкт-Петербург'
        };

        fetch.mockImplementation(() => fakeResponse(LOCATION_BY_NAME_API_RESPONSE));

        const locationInfo = await getCoordsByLocationName('Санкт-Петербург');

        expect(locationInfo).toEqual(EXPECTED_COORDS_AND_NAME);
    });

    test('should return if received location not found', async () => {
        fetch.mockImplementation(() => fakeResponse(LOCATION_NOT_FOUND_API_RESPONSE))

        const result = await getCoordsByLocationName('абвгдж');

        expect(result).toBe(undefined);
    });

    test('should return index of requsted location', async () => {
        const { lastLocations } = user;

        const cases = [
            { requestedLocation: 'Москва', expectedIndex: 1 }, // локация есть в списек последних
            { requestedLocation: 'Иркутск', expectedIndex: -1 } //локации нет в списке последних
        ];

        cases.forEach(el => {
            const actualIndex = getIndexOfLocation(lastLocations, el.requestedLocation);

            expect(actualIndex).toBe(el.expectedIndex);
        });
    });

    test('should move last locations', () => {
        const EXPECTED_LOCATIONS_ARR = [
            {
                _id: '5eb943fb6d902700045b592b',
                locationName: 'Мирный',
                lat: 62.762352,
                lon: 40.328644
            },
            {
              _id: '5eb944ac6d902700045b592c',
              locationName: 'Санкт-Петербург',
              lat: 59.938732,
              lon: 30.316229
            },
            {
              _id: '5eb944ba6d902700045b592d',
              locationName: 'Москва',
              lat: 55.750717,
              lon: 37.61766
            }
        ];

        const locations = user.lastLocations.slice(0);

        moveLocation(locations, 2);

        expect(locations).toEqual(EXPECTED_LOCATIONS_ARR);
    });

    test('should not move lication if it\'s already first', () => {
        const locations = user.lastLocations.slice(0);

        const result = moveLocation(locations, 0);

        expect(result).toBe(undefined);
    });
});