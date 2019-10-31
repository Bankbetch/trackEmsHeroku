const express = require('express');
const line = require('@line/bot-sdk');
const request = require('request-promise');
// require('dotenv').config();

const app = express();
const router = express.Router();

const config = {
    channelAccessToken: "PupFw1RvM5pHKd7nKgRaVwEvkWefDMSrSgX6FDTqfNusLc2Kpqo+rvqQvs83SlnLU35xWTSiZPgvSKxYCdYF3wsFzH9BwkDCyls+qBMY0EFTgzCVgMdb+DWkG/i/H4iu//K4E7nJqac8W6Vkdza3lAdB04t89/1O/w1cDnyilFU=",
    channelSecret: "788244dc6a3f8d8f57b6a22b3367e98a"
};
const thaipost = "H6KCA$M+KFF-DcAXAgP?N|GIOyQTZwUjJJLaDISuI?HIQ7ANWnOxL;CwA-ZKLbZzIOMsVLX+O$NiOQHzPwCjEZWAJ|YIF@DcYnJu"
const client = new line.Client(config);
var reqLi

// router.get("/webhook", (req, res) => {
//     res.json({
//       hello: "hi!"
//     });
//   });

app.post('/webhook', line.middleware(config), (req, res) => {
    reqLi = req;
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

function handleEvent(event) {

    console.log(event);
    if (event.type === 'message' && event.message.type === 'text') {
        handleMessageEvent(event);
    } else {
        return Promise.resolve(null);
    }
}
// function handleEvent(event) {

//     //console.log(event);
//     if (event.type === 'message' && event.message.type === 'text') {
//         handleMessageEvent(event);
//     } else {
//         return Promise.resolve(null);
//     }
// }

function handleMessageEvent(event) {
   // console.log(event.message.text);
    // var msg = {
    //     type: 'text',
    //     text: 'สวัสดีครัช'
    // };

    gettrack(reqLi,event)
   //return client.replyMessage(event.replyToken, msg);
}
//
async function gettrack(req,message)
    {
        // console.log(message)
        let promise_token = new Promise(resolve => {
            var options = {
                method: 'POST',
                uri: 'https://trackapi.thailandpost.co.th/post/api/v1/authenticate/token',
                strictSSL: false,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + thaipost
                }
            };
            
            request(options, function(error, response, body) {
                resolve(JSON.parse(body));
            });
        });
        
        let access_token = await promise_token;
        let params = {
            "status": "all",
            "language": "TH",
            "barcode": [
                message.message.text
           ]
        };
       // console.log(params)
        let promise_track = new Promise(resolve => {
            var options = {
                method: 'POST',
                uri: 'https://trackapi.thailandpost.co.th/post/api/v1/track',
                strictSSL: false,
                body: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + access_token.token
                }
            };
            
            request(options, function(error, response, body) {
             
                resolve( JSON.parse(body) );
            });
        });

        let tracks = await promise_track;
        let item_json = [];
        let { response } = tracks;
        // console.log("tracks"+tracks)
        let { items } = response;
        // console.log("item"+items)
        let key = Object.keys(tracks.response.items);
        //console.log()
        if (items[key[0]].length > 0) {
            console.log("เข้า")
            let bgcolor;
            items[key[0]].forEach(function(detail) {
                //console.log(detail);
                bgcolor = (detail.delivery_status == 'S') ? '#ABEBC6' : '#EEEEEE';
                delivery_description = (detail.delivery_description !== null) ? detail.delivery_description : " ";
                splitStatus = detail.status_date.split('+')
                const item_temp = {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                {
                                    "type": "text",
                                    "text": splitStatus[0]+" น."
                                }
                                ]
                            },
                            {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "spacer",
                                        "size": "xxl"
                                    },
                                    {
                                        "type": "text",
                                        "text": detail.status_description,
                                        "size": "sm"
                                    }
                                ],
                                "spacing": "none",
                                "margin": "md"
                            },
                            {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "spacer",
                                        "size": "xxl"
                                    },
                                    {
                                        "type": "text",
                                        "text": detail.location,
                                        "size": "sm"
                                    },
                                    {
                                        "type": "text",
                                        "text": detail.postcode,
                                        "size": "sm"
                                    }
                                ],
                                "spacing": "none",
                                "margin": "md"
                            },
                            {

                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "spacer",
                                        "size": "xxl"
                                    },
                                    {
                                        "type": "text",
                                        "text": delivery_description,
                                        "size": "sm"
                                    }
                                ],
                                "spacing": "none",
                                "margin": "md"
                            },
                        ]
                    }
                    ],
                    "backgroundColor": bgcolor,
                    "cornerRadius": "md",
                    "paddingAll": "10px"
                };

                item_json.push(item_temp);
               // console.log(item_json)
            });


            payload = {
                "type": "bubble",
                "size": "giga",
                "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                    "type": "text",
                    "text": key[0],
                    "decoration": "none",
                    "size": "xl",
                    "weight": "bold"
                    },
                    {
                    "type": "box",
                    "layout": "vertical",
                    "contents": item_json,
                    "spacing": "sm",
                    "margin": "md"
                    }
                ]
                }
            }
          //  reply_track(req,payload)
            var messages =
        {
            "type": "flex",
            "altText": "สถานะการส่งของ",
            "contents": {
                "type": "carousel",
                "contents": [payload]
            } 
        }
        return client.replyMessage(message.replyToken, messages);
        } 
        else {
            console.log("ไม่เข้า")
            var msg = {
                type: 'text',
                text: 'ไม่พบหมายเลขพัสดุที่ระบุ'
            };
            return client.replyMessage(message.replyToken, msg);
        }
    }

    const reply_track = (req, payload) => {
        var messages =
        {
            "type": "flex",
            "altText": "สถานะการส่งของ",
            "contents": {
                "type": "carousel",
                "contents": [payload]
            } 
        }
      //  console.log(JSON.stringify(messages))
    return client.replyMessage(req.replyToken, messages);
    };

    const reply_notfound = (req, playload) => {
        console.log("playload"+ playload)
        // return request({
        //     method: `POST`,
        //     uri: `${LINE_MESSAGING_API}/reply`,
        //     headers: LINE_HEADER,
        //     body: JSON.stringify({
        //         replyToken: req.body.events[0].replyToken,
        //         messages: [
        //             {
        //                 type: `text`,
        //                 text: 'ไม่พบหมายเลขพัสดุที่ระบุ'
        //             }
        //         ]
        //     })
        // });
       // return client.replyMessage(req.replyToken, "ไม่พบหมายเลขพัสดุที่ระบุ");
    };

//
// app.use(`/.netlify/functions/index`, router);
app.set('port', ("server run",5000));

app.listen(app.get('port'), function () {
    console.log('run at port', app.get('port'));
});

// module.exports.handler = serverless(app);