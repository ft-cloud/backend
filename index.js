var mysql = require('mysql');
var express = require('express');
var uuid = require('uuid');
var account = require('./account');
var session = require('./session')
var apps = require('./app')
var cors = require('cors');
const app = express()
const port = 8146


global.connection = mysql.createConnection({
  host     : '192.168.2.146',
  user     : 'phpmyadmin',
  password : '*****',
  database: "ledtable"
});


global.connection.connect();

app.use(cors());

app.get('/', (req, res) => {
  res.send('LEDWall API V1.0')
})



app.get('/auth/signup',(req,res)=> {

  const error = validateSignUp(req.query.name,req.query.email,req.query.password)
  if(error) {
    res.send(error);
  }else{
    account.checkAndCreateUser(req.query.name.toString(),req.query.email.toString(),res,req);

  }
})

app.get('/auth/signin',(req,res)=>{

  if(req.query.eorn&&req.query.password) {
    account.login(req.query.eorn.toString(),req.query.password.toString(),res);
  }else{
    res.send('{\"error\":\"please provide name or email and password!\",\"errorcode\":\"001\"}');

  }
}) 
app.get('/auth/signout',(req,res)=> {
  if(req.query.session) {
    session.deleteSession(req.query.session.toString(),res);
  }else{
    res.send('{\"error\":\"please provide valid session!\",\"errorcode\":\"001\"}');
  }

})

app.get('/auth/validateSession',(req,res) => {


  if(req.query.session) {
    session.validateSession(req.query.session.toString(),res);
  }else{
    res.send('{\"error\":\"please provide valid session!\",\"errorcode\":\"001\"}');
  }
});


app.get('/resetTimeout',(req,res)=> {

  session.reactivateSession(req.query.session);
  res.send("done");

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/app/listinstalled', (req,res)=>{
  if(req.query.session) {
    session.validateSession2(req.query.session.toString(),(isValid) => {
        if(isValid) {
          session.reactivateSession(req.query.session);
          session.getUserUUID(req.query.session.toString(),(uuid)=> {

            if(uuid) {
             apps.listIstalledApps(uuid, (InstalledApps) => {

              if(InstalledApps) {
                res.send(`{"list": ${InstalledApps}}`);

              }else{
                res.send('{\"error\":\"No valid Session!\",\"errorcode\":\"006\"}' )

              }

             })
            }else{
              res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}' )
            }
          })

        }else{
          res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}')
      
        }
    }) 
  }else{
    res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}')
  }
});

app.get('/app/addScore', (req,res)=>{
  if(req.query.session && req.query.name && req.query.appuuid&&req.query.name.length>3) {
    session.validateSession2(req.query.session.toString(),(isValid) => {
      if(isValid) {
        session.reactivateSession(req.query.session);
        session.getUserUUID(req.query.session.toString(),(uuid)=> {
          if(uuid) {

            apps.addScore(uuid, req.query.name, req.query.appuuid, (r) => {
              res.send(`{"success":true,"uuid":"${r}"}`);
            });
            

          }else{
            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}' )
          }
        })

      }else{
        res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}')
    
      }
  }) 
  }else{
    res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}')
  }
});

app.get('/app/getScoreConfig', (req, res)=>{

  if(req.query.session && req.query.scoreuuid){
    session.validateSession2(req.query.session.toString(),(isValid) => {
      if(isValid) {
        session.reactivateSession(req.query.session);
        session.getUserUUID(req.query.session.toString(),(uuid)=> {
          if(uuid) {

             apps.hasReadPermission(req.query.scoreuuid.toString(),uuid,(check) =>{

              if(check) {

                apps.getUserAppConfig(req.query.scoreuuid.toString(),(userconfig)=>{

                  if(userconfig!=undefined) {
                    res.send(`{"success":true,"config",${JSON.stringify(userconfig)}}`)
                  }else{
                    res.send('{\"error\":\"No valid score!\",\"errorcode\":\"007\"}' )
                  }
    
                 });

              }else{
                
                res.send('{\"error\":\"No Read Permission!\",\"errorcode\":\"008\"}' )

              }

             })
            


          }else{
            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}' )
          }
        })

      }else{
        res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}')
    
      }
  }) 
  }else{
    res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}')
  }
});

app.get('/app/getAppScores', (req, res) =>{
  if(req.query.session && req.query.appuuid){
    session.validateSession2(req.query.session.toString(),(isValid) => {
      if(isValid) {
        session.reactivateSession(req.query.session);
        session.getUserUUID(req.query.session.toString(),(uuid)=> {
          if(uuid) {

            apps.getWriteScores(req.query.appuuid,uuid, (writeScore) => {
                apps.getReadScores(req.query.appuuid,uuid, (readScore)=> {

                  const writeObject = writeScore;
                  const readObject = readScore;
                  const tempOBJ = {
                    write: writeObject,
                    read: readObject
                  }

                  res.send(JSON.stringify(tempOBJ));


                });

            });

            

          }else{
            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}' )
          }
        })

      }else{
        res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}')
    
      }
  }) 
  }else{
    res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}')
  
  }
});







function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateSignUp(name, email, password) {

  if(name&&password&&email) {
    if(name.toString().trim()!=''&&password.toString().trim()!=''&&email.toString().trim()!='') {
        if(validateEmail(email.toString())) {

            if(name.toString().trim().length>=3) {

        
                    return undefined;

            } else{
             return '{\"error\":\"Username must contain at least 3 Characters\",\"errorcode\":\"002\"}'

            }


        }else{
          return '{\"error\":\"No valid email!\",\"errorcode\":\"002\"}'
        }

    }else{
      return'{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}'

    }

}else{
  return'{\"error\":\"please provide name, password and email!\",\"errorcode\":\"001\"}'
}
}



