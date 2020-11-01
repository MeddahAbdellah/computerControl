const express    = require('express')
const app        = express();
const mysql      = require('mysql');
const mosca      = require("mosca");
const bodyParser = require('body-parser');

var server = new mosca.Server({
      port:8080,
      http: {
              port: 9000,
              bundle: true,
              static: './'
            }
});
server.on('clientConnected', function(client) {
        console.log('client connected', client.id);
});
server.on('published', function(packet, client) {
       //console.log(packet);
      if(packet.topic.toString().includes("computer")){
        var data = packet.payload.toString().split(',');
        connection.query('SELECT * FROM users WHERE users.key="'+data[0]+'"', function(err, result) {
          if (err) throw err;
        });

      }
});
server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database: 'computerControl'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', (req, res) => {

  res.send('Hello World!');
});
app.post('/login',(req,res)=>{
  const user = {username: req.body.username, password: req.body.password};
  connection.query('SELECT * FROM users Where ?', user, function (error, results, fields) {
    if (error) throw error;
    console.log('LOGIN :', results);
    res.send(results);
  });
});
app.post('/signup',(req,res)=>{
  var user  = {username: req.body.username, password: req.body.surname};
  connection.query('INSERT INTO users SET ?', user, function(err, result) {
    if (err) throw err;
    console.log('SIGNUP :', results);
    res.send("success");
  });
});


app.listen(80, () => {
  console.log('app listening on port 80!')
});
