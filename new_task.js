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
        var queue = "task_queue";
        var msg = process.argv.slice(2).join(" ") || "Hello World!";

        channel.assertQueue(queue, {
            durable: true
        });

        channel.sendToQueue(queue, Buffer.from(msg), {
            persistent: true
        });
        console.log(" [x] Sent '%s'", msg);
    });

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
});