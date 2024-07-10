const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const PORT = process.env.PORT || 4000;

const app = express();

const errorhandler = require('errorhandler');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(errorhandler());

module.exports = app;
