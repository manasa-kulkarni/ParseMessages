const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');

const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload()); //Used for parsing files in request bodies

//Import modular message router, all requests with '/api' path will be redirected to message.router
const messageRouter = require('./message.router.js');
app.use('/api', messageRouter);

app.listen(PORT, function () {
    console.log(`Server Listening on ${PORT}`);
});
