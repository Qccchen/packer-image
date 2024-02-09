const { Users, sequelize } = require('./users');
const bcrypt = require('bcrypt');

function generateToken(username, password) {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

async function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    token = token.replace('Basic ', '');
    
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    const user = await Users.findOne({ where: { username } });
    if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
        res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
        return;
    } 
    req.id = user.id;
    next();
}

module.exports = {
    generateToken,
    verifyToken,
};