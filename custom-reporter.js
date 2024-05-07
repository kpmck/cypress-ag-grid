const Mocha = require('mocha');
const amqp = require('amqplib/callback_api');
const {v4: uuidv4} = require('uuid');

class CustomReporter extends Mocha.reporters.Base {
    constructor(runner) {
        super(runner);

        this.connection = null;
        this.channel = null;
        this.testRunId = uuidv4(); // Generate a unique ID for the test run

        // Connect to RabbitMQ and create a channel
        amqp.connect('amqp://localhost', (err, connection) => {
            if (err) throw err;
            this.connection = connection;
            connection.createChannel((err, channel) => {
                if (err) throw err;
                this.channel = channel;
            });
        });

        runner.on('suite start', (suite) => {
            if (!suite.title) return;
            suite.testSuiteId = uuidv4(); // Generate a unique ID for the test suite
            this.publishMessage('suite', {
                startTime: new Date(),
                testRunId: this.testRunId,
                testSuiteId: suite.testSuiteId,
                title: suite.title,
                status: 'running'
            });
        });

        // Create a runner event for when a test ends
        runner.on('test end', (test) => {
            this.publishMessage('test end', {
                endTime: new Date(),
                testRunId: this.testRunId,
                testSuiteId: test.parent.testSuiteId,
                testCaseId: test.testCaseId,
                title: test.title,
                status: test.state
            });
        });

        runner.on('test start ', (test) => {
            test.testCaseId = uuidv4(); // Generate a unique ID for the test case
            this.publishMessage('test', {
                startTime: new Date(),
                testRunId: this.testRunId,
                testSuiteId: test.parent.testSuiteId,
                testCaseId: test.testCaseId,
                title: test.title,
                status: 'running'
            });
        });

        runner.on('pass', (test) => {
            this.publishMessage('pass', {
                testRunId: this.testRunId,
                testSuiteId: test.parent.testSuiteId,
                testCaseId: test.testCaseId,
                title: test.title,
                status: 'passed'
            });
        });

        runner.on('fail', (test, err) => {
            this.publishMessage('fail', {
                testRunId: this.testRunId,
                testSuiteId: test.parent.testSuiteId,
                testCaseId: test.testCaseId,
                title: test.title,
                error: err.toString(),
                status: 'failed'
            });
        });

        // add event for when suite completes
        runner.on('suite end', (suite) => {
            this.publishMessage('suite end', {
                endTime: new Date(),
                testRunId: this.testRunId,
                testSuiteId: suite.testSuiteId,
                title: suite.title,
                status: suite.tests.filter(t => t.state === 'failed').length > 0 ? 'failed' : 'passed'
            });
        });
    }

    publishMessage(event, data) {
        if (!this.channel) {
            console.error('Channel not initialized');
            return;
        }

        const exchange = 'logs';
        this.channel.assertExchange(exchange, 'fanout', {durable: false});

        // Create a message object
        const message = {
            event: event,
            data: data
        };

        // Convert the message object to a JSON string
        const messageString = JSON.stringify(message);

        // Publish the JSON string to the exchange
        this.channel.publish(exchange, '', Buffer.from(messageString));
    }
}

module.exports = CustomReporter;