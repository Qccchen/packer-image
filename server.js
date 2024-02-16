const express = require('express');
const bodyParser = require('body-parser');
const { Users, sequelize } = require('./users');
const { generateToken, verifyToken } = require('./auth');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

sequelize.sync();

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
    }).catch(err => {
        res.status(503).header('Cache-Control', 'no-cache, no-store, must-revalidate').send();
    });
});

app.use('/healthz', (req, res) => {
    res.status(405).header('Cache-Control', 'no-cache, no-store, must-revalidate').send();
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
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'Username already exists' });
        } else if (err.name === 'SequelizeValidationError') {
            res.status(400).json({ error: 'Username is not an email' });
        }
        else {
            res.status(500).json({ error: 'Invalid request' });
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
        } else {
            res.status(404).json({ error: 'User not found' });
        }        
    } catch (err) {
        res.status(500).json({ error: 'Invalid request' });
    }
});

app.put('/v1/user/self', verifyToken, async (req, res) => {
    try {
        const { first_name, last_name, password, username } = req.body;

        const existingUser = await Users.findOne({ where: { username } });

        if (!existingUser) {
            return res.status(400).json({ error: 'User not found' });
        }

        try { 
            await Users.update({ first_name: first_name, last_name: last_name, password: password }, { where: { username: username } })
            res.status(204).end();
        } catch (err) {
            res.status(400).json({ error: 'Invalid update data' });
        }        
    } catch (err) {
        res.status(500).json({ error: 'Invalid request' });
    }

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;