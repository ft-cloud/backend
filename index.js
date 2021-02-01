var mysql      = require('mysql');
var express        = require('express');
var uuid = require('uuid');
const app = express()
const port = 8146


var connection = mysql.createConnection({
  host     : '192.168.2.146',
  user     : 'phpmyadmin',
  password : '*******',
  database: "ledtable"
});

connection.connect();



app.get('/', (req, res) => {
  res.send('LEDWall API V1.0')
})

app.get('/auth', (req,res) => {
  res.send('please provide credentials')
})

app.get('/signup',(req,res)=> {

  const error = validateSignUp(req.query.name,req.query.email,req.query.password)
  if(error) {
    res.send(error);
  }else{
    

const user = uuid.v4();
    var sql = `INSERT INTO account (uuid,email,passwort,name) VALUES ('${user}', '${req.query.email.toString()}','${req.query.password.toString()}','${req.query.name.toString()}')`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });

  res.send("success "+startsession(user))
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})






function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateSignUp(name, email, password) {

  if(name&&password&&email) {
    if(name.toString().trim()!=''&&password.toString().trim()!=''&&email.toString().trim()!='') {
        if(validateEmail(email.toString())) {

            if(name.toString().trim().length>=3) {

                if(checkUserNameExisting(name)) {
                  return '{\"error\":\"Username already exists\",\"errorcode\":\"replace\"}'

                }else{
                  if(checkUserEmailExisting(email)) {
                    return '{\"error\":\"Email already exists\",\"errorcode\":\"replace\"}'

                  }else{
                    return undefined;

                  }

                }


            } else{
             return '{\"error\":\"Username must contain at least 3 Characters\",\"errorcode\":\"replace\"}'

            }


        }else{
          return '{\"error\":\"No valid email!\",\"errorcode\":\"replace\"}'
        }

    }else{
      return'{\"error\":\"No valid inputs!\",\"errorcode\":\"replace\"}'

    }

}else{
  return'{\"error\":\"please provide name, password and email!\",\"errorcode\":\"replace\"}'
}
}

function startsession(user) {

  const session = uuid.v4();

  var sql = `INSERT INTO session (uuid,user,timeout) VALUES ('${session}', '${user}','${new Date().getTime() + 600000}')`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
  });

return session;

}

//TODO 

function checkUserNameExisting(name) {

  var sql = `SELECT * FROM account WHERE name = '${name.toString()}';`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    
    if(result[0]) {
      console.log(result[0]);

      return true
    }else{
      return false
    }

  });

return false;
}


function checkUserEmailExisting(email) {

  var sql = `SELECT 1 FROM account WHERE email = '${email.toString()}';`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    
    if(result[0]) {
      return true
    }else{
      return false
    }

  });

return false;
}