#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (err0, connection) => {
    if (err0) {
        console.error(err0);
        throw err0;
    }
    connection.createChannel((err1, channel) => {
        if (err1) {
            console.error(err1);
            throw err1;
        }
        var queue = 'task_queue';

        channel.assertQueue(queue, {
            durable: true
        });
        channel.prefetch(1);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, (msg) => {
            var secs = msg.content.toString().split('.').length - 1;

            console.log(" [x] Received %s", msg.content.toString());
            setTimeout(() => {
                console.log(" [x] Done");
            }, secs * 1000);
        }, {
            noAck: false
        });
    });
});