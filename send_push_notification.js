'use strict';
const webpush = require('web-push');
const AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
    var message = JSON.parse(event._body).message;
    var docClient = new AWS.DynamoDB.DocumentClient();
    var privateparams = {
        TableName: "notification_endpoints"
    };
    var publicparams = {
        TableName: "endpoint_data"
    }


    docClient.scan(privateparams, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            docClient.scan(publicparams, function(perr, pdata) {
                if (perr) {
                    console.error("Unable to query. Error:", JSON.stringify(perr, null, 2));
                } else {
                    var d = data.Items[0];
                    var pd = pdata.Items[0];
                    //webpush.setGCMAPIKey(d.publicKey);

                    const options = {
                        TTL: 24 * 60 * 60,
                        vapidDetails: {
                            subject: 'mailto:stevencarnes54@gmail.com',
                            publicKey: d.publicKey,
                            privateKey: d.privateKey
                        }
                    };

                    const pushSubscription = {
                        endpoint: pd.endpoint,
                        keys: pd.keys,
                        data: { TheColor: "Yellow" }
                    };

                    webpush.sendNotification(pushSubscription, message, options).then(function(dt) {
                        console.log(dt);
                    }).catch(function(err) {
                        console.log(err);
                    });
                }
            });
            console.log("Query succeeded.");

            // This is the same output of calling JSON.stringify on a PushSubscription

        }
    });


};