const express = require('express');
const cors = require('cors'); // Allow cross site requests
const compress = require('compression');
const path = require('path');

const app = express();

// We don't want to serve sessions for static resources
app.use(express.static(path.join(__dirname, 'dist/jor')));

app.use(cors());
app.use(require('body-parser').json());
app.use(compress());

// API Routing
const routes = require('./server/routes');
app.use('/', routes);

// The index page as an entry point
app.route('*').get( (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/jor/index.html'));
});

// User Function
const userFunction = require('./server/models/userFunction');
userFunction.register('testFunction', function (input, user, callback) {
  callback(null, 'The input is ' + input.data + '. The user session is ' + user);
});

process.on('SIGINT',function(){
  console.log("Closing.....");
  process.exit()
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
