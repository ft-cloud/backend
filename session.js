var uuid = require('uuid');

var session ={
    startsession: function (user) {

        const session = uuid.v4();
      
        var sql = `INSERT INTO session (uuid,user,timeout) VALUES ('${session}', '${user}', DATE_ADD(now(),interval 10 minute))`;
        global.connection.query(sql, function (err, result) {
          if (err) throw err;
        });
      
      return session;
      
      },

      reactivateSession: function(session) {

        var sql = `UPDATE session SET timeout = DATE_ADD(now(),interval 10 minute) WHERE uuid = '${session}'`
        global.connection.query(sql, function (err, result) {
            if (err) throw err;
          });
      },


      getUserUUID: function(session,callback) {

        var sql = `SELECT 'UUID' FROM session WHERE uuid = '${session.toString()}';`;
        global.connection.query(sql, function (err, result) {
          if(result&&result[0]) {
            callback(result[0])
      
          }else{
      
           callback(undefined);
      
          }
        
      
        });
        

      },


      deleteSession: function(session,res) {

        var sql = `delete from session where uuid='${session}'`; 

        global.connection.query(sql, function (err, result) {
          if (err) throw err;
          res.send(`{\"info\":\"loged out\"}`)

         });



      }

      

}

module.exports = session;

 function deleteSessions() {
    var sql = `delete from session where timeout < DATE_SUB(now(),interval 10 minute)`;
    global.connection.query(sql, function (err, result) {
      if (err) throw err;
    });
  }

  setInterval(deleteSessions,1000*60*2);