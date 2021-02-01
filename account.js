var uuid = require('uuid');
var session = require('./session');

var account = {


    checkAndCreateUser: function (name,email,res,req) {

        var sql = `SELECT * FROM account WHERE name = '${name.toString()}';`;
        global.connection.query(sql, function (err, result) {
          if(result[0]) {
            console.log(result[0]);
      
            res.send('{\"error\":\"Username already exists\",\"errorcode\":\"replace\"}');
      
          }else{
      
            checkUserEmailExisting(email,res,req);
      
          }
        
      
        });
      
      },

      login: function(nameOrEmail,password,res) {

        var sql = `SELECT * FROM account WHERE (name='${nameOrEmail}' OR email='${nameOrEmail}') AND password='${password}'`;
        global.connection.query(sql, function (err, result) {
            console.log(result);
            if(result&&result[0]) {
             
               res.send( session.startsession(result[0].uuid));
        
            }else{
                res.send('{\"error\":\"email or password incorrect\",\"errorcode\":\"replace\"}');

        
            }
          
        
          });




      },

      getAccountByUUID: function(uuid,callback) {

        var sql = `SELECT * FROM account WHERE uuid = '${uuid.toString()}';`;
        global.connection.query(sql, function (err, result) {
          if(result&&result[0]) {
            callback(result[0])
      
          }else{
      
           callback(undefined);
      
          }
        
      
        });


      }



}

module.exports = account;



  
  
   function checkUserEmailExisting(email,res,req) {
  
    var sql = `SELECT 1 FROM account WHERE email = '${email.toString()}';`;
  
     global.connection.query(sql, function (err, result) {
      if (err) throw err;
      
      if(result[0]) {
        res.send('{\"error\":\"Email already exists\",\"errorcode\":\"replace\"}');
  
      }else{
        createUser(req,res);
  
      }
     
  
    });
  
  }
  
  function createUser(req,res) {
    const user = uuid.v4();
      var sql = `INSERT INTO account (uuid,email,password,name) VALUES ('${user}', '${req.query.email.toString()}','${req.query.password.toString()}','${req.query.name.toString()}')`;
      global.connection.query(sql, function (err, result) {
        if (err) throw err;
      });
  
    res.send("success "+session.startsession(user))
  }