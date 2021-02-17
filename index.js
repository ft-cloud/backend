var mysql = require('mysql');
var express = require('express');
var uuid = require('uuid');
var account = require('./account');
var session = require('./session')
var apps = require('./app')
var cors = require('cors');
const { deleteScore } = require('./app');
const app = express()
const port = 8146
var device = require('./device')


global.connection = mysql.createConnection({
  host     : '172.17.0.2',
  user     : 'root',
  password : 'LEDWall$246#',
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


app.get('/account/info',(req,res) => {

    if(req.query.session) {
        session.validateSession2(req.query.session.toString(),(isValid) => {
            if(isValid) {
                session.reactivateSession(req.query.session);
                session.getUserUUID(req.query.session.toString(),(uuid)=> {

                    if(uuid) {
                       account.getAccountByUUID(uuid,(account)=> {
                           if(account) {
                               res.send(JSON.stringify(account));
                           }else{
                               res.send();
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

})


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
             apps.listInstalledApps(uuid, (InstalledApps) => {

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
                    res.send(`{"success":true,"config":${userconfig}}`)
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


app.get('/app/saveAppScore',(req,res)=>{

if(req.query.session && req.query.scoreuuid && req.query.params){
  console.log(req.query.params)
    session.validateSession2(req.query.session.toString(),(isValid) => {
      if(isValid) {
        session.reactivateSession(req.query.session);
        session.getUserUUID(req.query.session.toString(),(uuid)=> {
          if(uuid) {

         apps.hasWritePermission(req.query.scoreuuid,uuid,(permission)=>{
          if(permission) {
            apps.updateScore(req.query.scoreuuid,req.query.params,() =>{
              res.send('{\"success\":\"Updated Settings\"}' )
            })


          }else{

            res.send('{\"error\":\"No write Permission!\",\"errorcode\":\"009\"}' )
         
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
})


app.get('/app/deleteAppScore',(req,res)=>{

  if(req.query.session && req.query.scoreuuid){
    console.log(req.query.params)
      session.validateSession2(req.query.session.toString(),(isValid) => {
        if(isValid) {
          session.reactivateSession(req.query.session);
          session.getUserUUID(req.query.session.toString(),(uuid)=> {
            if(uuid) {
  
           apps.hasWritePermission(req.query.scoreuuid,uuid,(permission)=>{
            if(permission) {
              apps.deleteScore(req.query.scoreuuid,() =>{
                res.send('{\"success\":\"Delete Settings\"}' )
              })
            }else{
              res.send('{\"error\":\"No write Permission!\",\"errorcode\":\"009\"}' )
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
  })



  app.get('/device/listAvailable',(req,res)=>{
 
    if(req.query.session) {
      session.validateSession2(req.query.session.toString(),(isValid) => {
        if(isValid) {
          session.reactivateSession(req.query.session);
          
              device.listAll( (devices) => {
                if(devices) {
                res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                }else{
                  res.send(`{"success":false}`);
                }
              });
              
  
  
        }else{
          res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}')
      
        }
    }) 
    }else{
      res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}')
    }
  
  })

  app.get('/device/listAvailable',(req,res)=>{
 
    if(req.query.session) {
      session.validateSession2(req.query.session.toString(),(isValid) => {
        if(isValid) {
          session.reactivateSession(req.query.session);
          
              device.listAll( (devices) => {
                if(devices) {
                res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                }else{
                  res.send(`{"success":false}`);
                }
              });
              
  
  
        }else{
          res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}')
      
        }
    }) 
    }else{
      res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}')
    }
  
  })

  app.get('/device/listSpecificUserDevice',(req,res)=>{
 
    if(req.query.session&&req.query.device) {
      session.validateSession2(req.query.session.toString(),(isValid) => {
        if(isValid) {
          session.reactivateSession(req.query.session);
          session.getUserUUID(req.query.session.toString(),(uuid)=> {
            if (uuid) {

              device.listSpecificDevice(uuid,req.query.device.toString(), (devices) => {
                if(devices) {
                res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                }else{
                  res.send(`{"success":false}`);
                }
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
  
  })


  app.get('/device/getDeviceConfig',(req,res)=>{
 
    if(req.query.session&&req.query.device) {
      session.validateSession2(req.query.session.toString(),(isValid) => {
        if(isValid) {
          session.reactivateSession(req.query.session);
          session.getUserUUID(req.query.session.toString(),(uuid)=> {
            if (uuid) {

              device.getDeviceConfig(uuid,req.query.device.toString(), (devices) => {
                if(devices) {
                res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                }else{
                  res.send(`{"success":false}`);
                }
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
  
  })


 const registrationCodes = [];
app.get('/device/getRegistrationCode',(req,res) => {
    var regCode;
    while(true) {
        const random = Math.floor(Math.random() * 16383); //Because this is in bin 14 length
        if (!registrationCodes.includes(random)) {
            regCode = random;
            console.log(regCode);
            registrationCodes.push(regCode)
            break;
        }

    }

    res.send(regCode+"");

   })

const waitForRegistrationDevices = [];

app.get('/device/waitForRegistration',(req,res)=>{

    if(req.query.regCode&&req.query.deviceUUID&&req.query.deviceName) {

        if(registrationCodes.includes(Number.parseInt(req.query.regCode))) {
            const obj = {
                uuid: req.query.deviceUUID.toString(),
                res: res,
                name: req.query.deviceName
            }

            waitForRegistrationDevices[req.query.regCode.toString()] = obj;

        }else {
            res.send('{\"error\":\"No valid registration code!\",\"errorcode\":\"010\"}')


        }

    }else{

        res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}')
    }

})


app.get('/device/registerByCode',(req,res)=>{

    if(req.query.regCode&&req.query.session) {


        session.validateSession2(req.query.session.toString(),(isValid) => {
            if(isValid) {
                session.reactivateSession(req.query.session);
                session.getUserUUID(req.query.session.toString(),(uuid)=> {
                    if (uuid) {

                        if (registrationCodes.includes(Number.parseInt(req.query.regCode))) {
                            session.generateAPIKey(uuid, waitForRegistrationDevices[req.query.regCode.toString()].uuid.toString(),(apiKey)=>{

                                waitForRegistrationDevices[req.query.regCode.toString()].res.send(`{"success":"true","apiKey":"${apiKey}"}`);
                                //Create Devices in Database
                                device.createDeviceEntry(waitForRegistrationDevices[req.query.regCode.toString()].uuid.toString(),waitForRegistrationDevices[req.query.regCode.toString()].name.toString(),(AddUuid)=>{
                                    //Get User Devices
                                    device.getUserDevices(uuid,(userDevices)=>{
                                    userDevices.push(AddUuid)
                                        //Store User Device
                                        device.storeUserDevices(JSON.stringify(userDevices),uuid,()=>{

                                            //Answer Request
                                            res.send('{\"success\":\"Registration done\"}')


                                            //Remove Temp vars
                                            const indexOfCode = registrationCodes.indexOf(Number.parseInt(req.query.regCode));
                                            if (indexOfCode > -1) registrationCodes.splice(indexOfCode, 1);

                                            const indexOfRequest = waitForRegistrationDevices.indexOf(waitForRegistrationDevices[req.query.regCode.toString()]);
                                            if (indexOfRequest > -1) registrationCodes.splice(indexOfRequest, 1);


                                        })


                                    });

                                })





                            })

                        } else {
                            res.send('{\"error\":\"No valid registration code!\",\"errorcode\":\"010\"}')
                        }

                    }else{
                        res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}')

                    }
                })
            }else{
                res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}')
            }
        })

    }else{

        res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}')
    }

})


app.get('/app/install',(req,res)=>{
 
  if(req.query.session  && req.query.appuuid) {
    session.validateSession2(req.query.session.toString(),(isValid) => {
      if(isValid) {
        session.reactivateSession(req.query.session);
        session.getUserUUID(req.query.session.toString(),(uuid)=> {
          if(uuid) {

            apps.installApp(uuid, req.query.appuuid, () => {
              res.send(`{"success":true}`);
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

})


app.get('/app/remove',(req,res)=>{
 
  if(req.query.session  && req.query.appuuid) {
    session.validateSession2(req.query.session.toString(),(isValid) => {
      if(isValid) {
        session.reactivateSession(req.query.session);
        session.getUserUUID(req.query.session.toString(),(uuid)=> {
          if(uuid) {

            apps.removeApp(uuid, req.query.appuuid, (success) => {
              if(success) {
              res.send(`{"success":true}`);
              }else{
                res.send(`{"success":false}`);
              }
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

}),


app.get('/app/removeReadScore',(req,res)=>{
 
  if(req.query.session  && req.query.scoreuuid) {
    session.validateSession2(req.query.session.toString(),(isValid) => {
      if(isValid) {
        session.reactivateSession(req.query.session);
        session.getUserUUID(req.query.session.toString(),(uuid)=> {
          if(uuid) {

            apps.removeReadScore(uuid, req.query.scoreuuid, (success) => {
              if(success) {
              res.send(`{"success":true}`);
              }else{
                res.send(`{"success":false}`);
              }
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

})

app.get('/app/removeWriteScore',(req,res)=>{
 
  if(req.query.session  && req.query.scoreuuid) {
    session.validateSession2(req.query.session.toString(),(isValid) => {
      if(isValid) {
        session.reactivateSession(req.query.session);
        session.getUserUUID(req.query.session.toString(),(uuid)=> {
          if(uuid) {

            apps.removeWriteScore(uuid, req.query.scoreuuid, (success) => {
              if(success) {
              res.send(`{"success":true}`);
              }else{
                res.send(`{"success":false}`);
              }
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

})

app.get('/device/deleteDevice',(req,res)=>{

  if(req.query.session && req.query.deviceuuid){
    console.log(req.query.params)
      session.validateSession2(req.query.session.toString(),(isValid) => {
        if(isValid) {
          session.reactivateSession(req.query.session);
          session.getUserUUID(req.query.session.toString(),(uuid)=> {
            if(uuid) {
              device.getUserDevices(uuid,(data)=>{
                if(data.indexOf(req.query.deviceuuid)!=-1) {
                  device.deleteScore(req.query.deviceuuid,()=>{
                    res.send('{\"success\":\"true\"}' )
                  })

                }else{
                  res.send('{\"error\":\"No write Permission!\",\"errorcode\":\"009\"}' )

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
  })


  app.get('/device/saveConfig',(req,res)=>{

    if(req.query.session && req.query.deviceuuid && req.query.params){
        session.validateSession2(req.query.session.toString(),(isValid) => {
          if(isValid) {
            session.reactivateSession(req.query.session);
            session.getUserUUID(req.query.session.toString(),(uuid)=> {
              if(uuid) {
    
             
                device.updateDeviceConfig(req.query.deviceuuid,req.query.params,() =>{
                  res.send('{\"success\":\"Updated Settings\"}' )

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



