module.exports =  (mockData) => {
    return Promise.resolve({
        ok: true,
        status,
        json: () => {
            return mockData;
        },
    });
};
