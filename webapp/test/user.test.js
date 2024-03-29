const { expect }= require('chai');
const request = require('supertest');
const app = require('../server');
const { Users, sequelize } = require('../users');

describe ('Integration tests for /v1/user endpoint', () => {
    let authToken;

    it ('create an account and validate its existence', async () => {
        const response = await request(app)
            .post('/v1/user')
            .send({
                username: 'testuser@email.com',
                password: 'testpassword',
                first_name: 'Test',
                last_name: 'User',
            })
            .expect(201);

        const user = await Users.findByPk(response.body.id);
        await user.update({ is_verified: true });
        await user.save();

        authToken = response.headers.authorization;

        await request(app)
            .get('/v1/user/self')
            .set('Authorization', authToken)
            .expect(200);
    });

    it ('update the account and validate the update', async () => {
        await request(app)
            .put('/v1/user/self')
            .set('Authorization', authToken)
            .send({
                username: 'testuser@email.com',
                password: 'testpassword',
                first_name: 'Updated',
                last_name: 'User',
            })
            .expect(204);

        const updatedResponse = await request(app)
            .get('/v1/user/self')
            .set('Authorization', authToken) 
            .expect(200);
            
        expect(updatedResponse.body.first_name).to.equal('Updated');
    });
});