const logger = require('./logger');
const express = require('express');
const bodyParser = require('body-parser');
const { Users, sequelize } = require('./users');
const { generateToken, verifyToken } = require('./auth');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

sequelize.sync().then(() => {
    logger.info('Database synced successfully');
}).catch(err => {
    logger.error('Database syncing failed', { error: err.toString() });
});

app.use('/healthz', (req, res, next) => {
    if (Object.keys(req.query).length > 0) {
        res.status(400).header('Cache-Control', 'no-cache, no-store, must-revalidate').send();
    } else if (Object.keys(req.body).length > 0){
        res.status(400).header('Cache-Control', 'no-cache, no-store, must-revalidate').send();
    } else {
        next();
    }
});

app.get('/healthz', (req, res) => {
   sequelize.authenticate().then(() => {
        res.status(200).header('Cache-Control', 'no-cache, no-store, must-revalidate').send();
        logger.info('Health check passed');
    }).catch(err => {
        res.status(503).header('Cache-Control', 'no-cache, no-store, must-revalidate').send();
        logger.error('Health check failed', { error: err.toString() });
    });
});

app.use('/healthz', (req, res) => {
    res.status(405).header('Cache-Control', 'no-cache, no-store, must-revalidate').send();
    logger.warn('Method not allowed for health check');
});

app.post('/v1/user', async (req, res) => {
    try {
        const { username, password, first_name, last_name } = req.body;
        const token = generateToken(username, password);
        const newUser = await Users.create({ username, password, first_name, last_name });
        
        res.status(201).header('Authorization', token).json({
            id: newUser.id,
            username: newUser.username,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            account_created: newUser.createdAt,
            account_updated: newUser.updatedAt,
        });
        logger.info('User created successfully', { userId: newUser.id });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'Username already exists' });
            logger.warn('Attempt to create a user with an existing username', { username: req.body.username });
        } else if (err.name === 'SequelizeValidationError') {
            res.status(400).json({ error: 'Username is not an email' });
            logger.warn('User data validation failed', { error: err.toString() });
        }
        else {
            res.status(500).json({ error: 'Invalid request' });
            logger.error('Error creating user', { error: err.toString() });
        }
    }
});

app.get('/v1/user/self', verifyToken, async (req, res) => {
    try {
        const user = await Users.findByPk(req.id, { attributes: { exclude: ['password'] } });
        if (user) {
            res.status(200).json({
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                account_created: user.createdAt,
                account_updated: user.updatedAt,
            });
            logger.info('User data retrieved successfully', { userId: req.id });
        } else {
            res.status(404).json({ error: 'User not found' });
            logger.warn('User not found', { userId: req.id });
        }        
    } catch (err) {
        res.status(500).json({ error: 'Invalid request' });
        logger.error('Error retrieving user', { error: err.toString(), userId: req.id });
    }
});

app.put('/v1/user/self', verifyToken, async (req, res) => {
    try {
        const { first_name, last_name, password, username } = req.body;
        const existingUser = await Users.findOne({ where: { username } });

        if (!existingUser) {
            logger.warn('Attempt to update non-existent user.', { username });
            return res.status(400).json({ error: 'User not found' });
        }

        try { 
            await Users.update({ first_name: first_name, last_name: last_name, password: password }, { where: { username: username } })
            logger.info('User updated successfully.', { username });
            res.status(204).end();
        } catch (err) {
            res.status(400).json({ error: 'Invalid update data' });
        }        
    } catch (err) {
        logger.error("Error updating user.", { error: err.toString(), username: req.body.username });
        res.status(500).json({ error: 'Invalid request' });
    }

});

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;