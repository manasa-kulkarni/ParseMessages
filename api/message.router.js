const express = require('express');
const router = express.Router();
const fs = require('fs');
const readline = require('readline');
const { Readable } = require('stream');

/**
    Parse request body, expecting ".msg" file and create
    response with the following fields:
    * (String) From
    * (String) To
    * (String) Subject
    * (String) Date
    * (String) Message ID
    * (Array) Body
        - Body contains an array of objects with type of data
        (text/html, text/plain etc.) and contentType for multipart messages
        - Example: [{text/plain: 'Plain Text'}, {text/html: '<div>Hello World</div>'}]

**/
router.post('/message', (req, res) => {

    //file-upload module allows access to file object using req.files
    if (req.files === null) {
        //Check for file input, send error status code if no file is found
        res.status(400).send("No File Found!")
    }
    else {
        //Parse File Object

        //String representation of file data
        let fileData = req.files.myFile.data.toString();
        var to = "";
        var from = "";
        var subject = "";
        var date = "";
        var messageID = "";


        var body = [];
        var contentType = "";
        var content = ""

        var foundContent = false;
        var parseContent = false;


        //Create array consisting of each line in file, iterate through array
        var lines = fileData.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line += '\n';

            if (!foundContent) {
                //Parse Message Header Info (To, From, Subject, Date and Message ID)
                if (line.toLowerCase().startsWith('to:')) {
                    to = line.match(/(?<=To:)(.*?)(?=;|\n)/ig)[0];
                }
                else if (line.toLowerCase().startsWith('from:')) {
                    from = line.match(/(?<=From:)(.*?)(?=;|\n)/ig)[0];
                }
                else if (line.toLowerCase().startsWith('date:')) {
                    date = line.match(/(?<=Date:)(.*?)(?=;|\n)/ig)[0];
                }
                else if (line.toLowerCase().startsWith('subject:')) {
                    subject = line.match(/(?<=Subject:)(.*?)(?=;|\n)/ig)[0];
                }
                else if (line.toLowerCase().startsWith('message-id:')) {
                    messageID = line.match(/(?<=Message-ID:)(.*?)(?=;|\n)/ig)[0];
                }
                //When line contains "content-type", begin parsing body of message,
                //store current contentType
                else if (line.toLowerCase().startsWith('content-type:')) {
                    contentType = line.match(/(?<=Content-Type:)(.*?)(?=;|\n)/ig)[0];
                    foundContent = true;
                }

            }
            else {
                //Concatenate content for current contentType
                if (line.toLowerCase().startsWith('content-transfer-encoding:')) {
                    //Begin parsing content after finding "content-transfer-encoding"
                    parseContent = true;
                }
                else if (line.toLowerCase().startsWith('content-type:')) {
                    //Completed current contentType data, store in body field
                    body.push({[contentType]: content});

                    //Find next contentType and reinitialize content variable
                    contentType = line.match(/(?<=Content-Type:)(.*?)(?=;|\n)/ig)[0];
                    content = ""
                    parseContent = false;
                }
                else if (line.startsWith('<!DOCTYPE') && !parseContent) {
                    //If line contains HTML elements without content-transfer-encoding, begin parsing html data
                    parseContent = true;
                    content += line;
                }
                else if (parseContent) {
                    //Parse Content
                    if (contentType.includes('html')) {
                        //Ignore Certain lines in html
                        if (line.search(/X-ID:/g) !== -1 ||
                            line.search(/X-RPTags:/ig) !== -1 ||
                            line.search(/X-NLCID:/ig) !== -1 ||
                            line.search(/X-OSTN-RCP:/ig) !== -1 ||
                            line.search(/Date:/ig) !== -1) {

                            content += ""
                        }
                        else {
                            //.msg data contains "3D" before many html field elements.
                            //This causes inaccurate rendering of html elements.
                            //For example 3DFFFF renders an incorrect cyan color instead of FFFF color (black)
                            content += line.replace(/=3D/g,"=")

                        }
                    }
                    else if (line.search(/--=(.*?)/ig) !== -1 )
                    {
                        //Ignore hex multipart labels
                        content += ""
                    }
                    else {
                        content += line;
                    }
                }
            }
        }
        //Push remaining body data
        body.push({[contentType]: content})

        res.status(201).send({
            from: from,
            to: to,
            subject: subject,
            date: date,
            messageID: messageID,
            body: body
        })
    }


})

module.exports = router;
