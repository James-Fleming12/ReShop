const server = require('../index.ts');
import request from './request';
// const supertest = require('supertest');

beforeAll( async () => {
    // create testing users
    // one for retrieving data and one for deletion checking
});

describe('User Information', () => {
    test("Get User Information from /user", async () => {
        /* example:
        const res = await request(server).get("/user/createduser");
            expect(res.status).toEqual(200);
            expect(res.type).toEqual(expect.stringContaining('json));
            expect(res.body).toHaveProperty('user');
        */
       /*
        https://jestjs.io/docs/tutorial-async   
       */
    });
    test("Can't create user with same credential", async () => {
        /*
        const params = { // data for post }; 
        const res = request(server).post('/register')
        */
    });
});

afterAll( async () => {
    // delete testing users
});