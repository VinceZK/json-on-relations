const express = require('express');
const cors = require('cors'); // Allow cross site requests
const compress = require('compression');
const path = require('path');
const entityDB = require('./server/models/connections/mysql_mdb.js');

const app = express();

// We don't want to serve sessions for static resources
app.use(express.static(path.join(__dirname, 'dist')));

app.use(cors());
app.use(require('body-parser').json());
app.use(compress());

// Routing
const routes = require('./server/routes');
app.use('/', routes);

process.on('SIGINT',function(){
  console.log("Closing.....");
  process.exit()
});

entityDB.executeSQL("select ENTITY_ID from ENTITY", function (err, rows) {
  if(err) debug("bootstrap: get entities==> %s", err);
  else {
    const entities = [];
    rows.forEach( row => entities.push(row.ENTITY_ID));
    entityDB.loadEntities(entities, function (err) {
      if(err) debug("bootstrap: load entities==> %s", err);
      else app.listen(3001, () => console.log('Example app listening on port 3001!'));
    })
  }
});
