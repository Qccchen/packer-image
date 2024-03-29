const {PubSub} = require('@google-cloud/pubsub');
const logger = require('./logger'); 

const pubSubClient = new PubSub();
const TOPIC_NAME = 'verify_email'; 

async function publishMessage(userData) {
    const dataBuffer = Buffer.from(JSON.stringify(userData));

    try {
        const messageId = await pubSubClient
            .topic(TOPIC_NAME)
            .publishMessage({data: dataBuffer});
        logger.info(`Message ${messageId} published to ${TOPIC_NAME}.`);
    } catch (error) {
        logger.error('Error publishing new user message to Pub/Sub', { error: error.toString() });
    }
}

module.exports = {
    publishMessage
};
