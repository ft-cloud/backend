var mysql      = require('mysql');
var express        = require('express');
const app = express()
const port = 8146


var connection = mysql.createConnection({
  host     : '192.168.2.146',
  user     : 'phpmyadmin',
  password : '*****++'
});

connection.connect();



app.get('/', (req, res) => {
  res.send('LEDWall API V1.0')
})

app.get('/auth', (req,res) => {

  res.send('please provide credentials')

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;
  console.log('The solution is: ', rows[0].solution);
});

connection.end();

