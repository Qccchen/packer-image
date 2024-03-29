const { Users, sequelize } = require('./users');
const logger = require('./logger');

const verifyUserStatus = async (req, res, next) => {
    try {
        const user = await Users.findByPk(req.id);

        if (!user) {
            logger.warn('User not found', { userId: req.id });
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.is_verified) {
            logger.warn('User not verified', { userId: req.id });
            return res.status(403).json({ error: 'User not verified' });
        }

        next();
    } catch (err) {
        logger.error('Error checking user verification status', { error: err.toString(), userId: req.id });
        return res.status(500).json({ error: 'Error checking verification status' });
    }
};

module.exports = {
    verifyUserStatus
};
