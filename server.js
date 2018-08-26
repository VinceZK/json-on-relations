const express = require('express');
const session = require('express-session');
const cors = require('cors')
// const redisStore = require('connect-redis')(session);
const passport = require('passport');
const compress = require('compression');
const path = require('path');
const entityDB = require('./server/models/connections/mysql_mdb.js');

const app = express();

// We don't want to serve sessions for static resources
// app.use(express.static(path.join(__dirname, 'dist')));

// app.use(session({
//   name: 'sessionID',
//   secret:'darkhouse',
//   saveUninitialized: false,
//   store: new redisStore(),
//   unset: 'destroy', //Only for Redis session store
//   resave: false,
//   cookie: {httpOnly: false, maxAge: 15 * 60 * 1000 }
// }));
app.use(cors());
app.use(require('body-parser').json());
// app.use(passport.initialize());
// app.use(passport.session());
app.use(compress());

// Routing
const routes = require('./server/routes');
app.use('/', routes);

process.on('SIGINT',function(){
  console.log("Closing.....");
  process.exit()
});

entityDB.loadEntities(['person','system_role'], function (err) {
  if(err) console.log(err);
  else app.listen(3001, () => console.log('Example app listening on port 3001!'));
});

