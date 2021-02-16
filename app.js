const account = require('./account')
const apps = require('./app.js')
var uuid = require('uuid');
var currentWriteDelete;
var counter =0;
module.exports = {


    getUserAppConfig: function(scoreuuid,callback) {

        var sql = `SELECT data FROM score WHERE uuid = '${scoreuuid}'`
        global.connection.query(sql, function(err, result){

            if(result&&result[0]&&result[0].data){

                callback(result[0].data)

            }else{
                callback(undefined);
            }

        })
    

      
    },


    deleteScoresEntry: function(useruuid, callback){
        var sql = `SELECT scoreWritePermission, scoreReadPermission FROM account WHERE uuid = '${useruuid}';`
        global.connection.query(sql, function(err, result){
            if(err) throw err;
            console.log("result: ");
            console.log(result);
            var datatata=JSON.parse(result[0].scoreWritePermission);
            for(var i=0;i<datatata.length; i++){
                console.log(datatata[i]);
            }
        });
      },


    
    getWriteScores: function(appid,useruuid, callback){
        var sql = `SELECT scoreWritePermission FROM account WHERE uuid = '${useruuid}';`
        global.connection.query(sql, function(err, result){
            if (err) throw err;

            currentWriteDelete =JSON.parse(result[0].scoreWritePermission)

            if(JSON.parse(result[0].scoreWritePermission).length==0) {
            callback([]);
            }else{
                var counter = 0;
                var return_result = [];
                for(var i=0;i<JSON.parse(result[0].scoreWritePermission).length;i++) {
                    getScoreObject(appid,JSON.parse(result[0].scoreWritePermission)[i],(r)=>{
                            
                        counter++;
                        if(r!=undefined) {
                        r.readonly = false;
                        return_result.push(r);
                        }else{

                          var sql = `SELECT uuid FROM score WHERE uuid= '${appid}';`;
                          global.connection.query(sql, function(err, result){
                            if (err) throw err;
                            
                            if(!result.uuid) {
                           

                            }

                          });

                        }
                        if(counter==JSON.parse(result[0].scoreWritePermission).length) {

                            callback(return_result);
                        }

                    })
                } 
                
            }
    });
    }
    ,
    getReadScores: function(appid,useruuid, callback){
        var sql = `SELECT scoreReadPermission FROM account WHERE uuid = '${useruuid}';`
        global.connection.query(sql, function(err, result){
            if (err) throw err;
            console.log("result: ");
            console.log(JSON.parse(result[0].scoreReadPermission));
            

            if(JSON.parse(result[0].scoreReadPermission).length==0) {
                callback([]);
                }else{
                    var counter = 0;
                    var return_result = [];
                    for(var i=0;i<JSON.parse(result[0].scoreReadPermission).length;i++) {
                        getScoreObject(appid,JSON.parse(result[0].scoreReadPermission)[i],(r)=>{
                                
                            counter++;
                            if(r!=undefined) {
                                r.readonly = true;
                            return_result.push(r);
                            }else{
                                removeReadScoreEntry(result[0].scoreReadPermission,useruuid,JSON.parse(result[0].scoreReadPermission)[i]);
                            }
                            if(counter==JSON.parse(result[0].scoreReadPermission).length) {
    
                                callback(return_result);
                            }
    
                        })
                    } 
                    
                }



    });
    },

    hasReadPermission: function(scoreuuid, useruuid,callback) {
        
        var sql_getWritePermissionapps=`SELECT scoreWritePermission FROM account WHERE uuid = '${useruuid.toString()}';`;
        global.connection.query(sql_getWritePermissionapps, function(err, resultWrite){


        var sql_getWritePermissionapps=`SELECT scoreReadPermission FROM account WHERE uuid = '${useruuid.toString()}';`;
        global.connection.query(sql_getWritePermissionapps, function(err, resultRead){
        callback( JSON.parse(resultWrite[0].scoreWritePermission).includes(scoreuuid)||JSON.parse(resultRead[0].scoreReadPermission).includes(scoreuuid));

        })
    })

    },
    hasWritePermission: function(scoreuuid, useruuid,callback) {

        var sql_getWritePermissionapps=`SELECT scoreWritePermission FROM account WHERE uuid = '${useruuid.toString()}';`;
        global.connection.query(sql_getWritePermissionapps, function(err, result){
            if (err) throw err;
        callback(  JSON.parse(result[0].scoreWritePermission).includes(scoreuuid));
        })

    },

  
    addScore: function(useruuid, name, Appuuid, callback){
        var scoreuuid=uuid.v4();
        var sql_addScore=`INSERT INTO score (uuid,name,data,app) VALUES ('${scoreuuid}', '${name}','{}','${Appuuid}')`;
        global.connection.query(sql_addScore, function(err, result){
            if (err) throw err;
        
        var old_scoreWritePermission;
        var sql_getWritePermissionapps=`SELECT scoreWritePermission FROM account WHERE uuid = '${useruuid.toString()}';`;
        global.connection.query(sql_getWritePermissionapps, function(err, result){
            if (err) throw err;
            old_scoreWritePermission=result[0];


         const jsonArray =   JSON.parse(old_scoreWritePermission.scoreWritePermission)
         jsonArray.push(scoreuuid); 

        var sql_write=`UPDATE account SET scoreWritePermission = '${JSON.stringify(jsonArray)}' WHERE uuid = '${useruuid}'`;
        global.connection.query(sql_write, function(err, result){
        
        callback(scoreuuid);

        
        });
        });
    });
    },

    updateScore: function(scoreuuid, data, callback){
        console.log(data)
        var sql = `UPDATE score SET data = '${data}' WHERE UUID = '${scoreuuid}'`
         global.connection.query(sql, function (err, result) {
            console.log(err);
            console.log(result);
            callback();


         })
    },

    deleteScore: function(scoreuuid, callback){
        var sql = `DELETE FROM score WHERE UUID = '${scoreuuid}'`
         global.connection.query(sql, function (err, result) {
            console.log(err);
            console.log(result);
            callback();


         })
    },
    listInstalledApps: function(user, callback) {

        account.getAccountByUUID(user, (user) => {

            if(user==undefined) {
                callback(undefined)
                return;
            }
            var rawinstalledapps=JSON.parse(user.installedApps);
            var output = [];
            counter = 0;
            console.log(rawinstalledapps.installedApps)
            if(rawinstalledapps.installedApps===undefined||!rawinstalledapps) {
                callback(undefined)
                return;
            }
            for(var i=0;i<rawinstalledapps.installedApps.length; i++){
                var sql = `SELECT * FROM application WHERE uuid = '${rawinstalledapps.installedApps[i]}';`;
                global.connection.query(sql, function (err, result) {

                    if(result&&result[0]) {
                        const tempObject = {
                            UUID: result[0].UUID,
                            name: result[0].name,
                        }
                         tempObject["config"] = JSON.parse(result[0].config);
                         tempObject["info"] = JSON.parse(result[0].info);
                         output.push(tempObject);
                         counter++;
                        if(counter==(rawinstalledapps.installedApps.length)) {
                            callback(JSON.stringify(output));
                        }

                    }
                  });
            }
            

           
        })

    },

    installApp: function(useruuid, appuuid, callback){

        var old_installedApps;
        var sql_getInstalledApps=`SELECT installedApps FROM account WHERE uuid = '${useruuid.toString()}';`;
        global.connection.query(sql_getInstalledApps, function(err, result){
            if (err) throw err;
            old_installedApps=result[0];


         const jsonArray =   JSON.parse(old_installedApps.installedApps)
         jsonArray.installedApps.push(appuuid); 

        var sql_write=`UPDATE account SET installedApps = '${JSON.stringify(jsonArray)}' WHERE uuid = '${useruuid}'`;
        global.connection.query(sql_write, function(err, result){
        
        callback();

        
        });
        });
 
    },


    removeApp: function(useruuid, appuuid, callback){

        var old_installedApps;
        var sql_getInstalledApps=`SELECT installedApps FROM account WHERE uuid = '${useruuid.toString()}';`;
        global.connection.query(sql_getInstalledApps, function(err, result){
            if (err) throw err;
            old_installedApps=result[0];


         const jsonArray =   JSON.parse(old_installedApps.installedApps)

         const index = jsonArray.installedApps.indexOf(appuuid);
         if (index > -1) {
            jsonArray.installedApps.splice(index, 1);
         }

         

        var sql_write=`UPDATE account SET installedApps = '${JSON.stringify(jsonArray)}' WHERE uuid = '${useruuid}'`;
        global.connection.query(sql_write, function(err, result){
        
        callback();

        
        });
        });
 
    }



}



 function getScoreObject(appid,uuid,callback) {

    var sql = `SELECT * FROM score WHERE uuid = '${uuid}' AND app = '${appid}';`
    global.connection.query(sql, function(err, result){
        if (err) throw err;
        
        console.log(result[0]);
        callback(result[0]);
});


}




function removeWriteScoreEntry(writescores,useruuid,uuid) {
    const jsonArray = JSON.parse(writescores)

    const index = jsonArray.indexOf(uuid);
    if (index > -1) {
        jsonArray.splice(index, 1);
    }

   var sql_write=`UPDATE account SET scoreWritePermission = '${JSON.stringify(jsonArray)}' WHERE uuid = '${useruuid}'`;
   global.connection.query(sql_write, function(err, result){

   })
}

function removeReadScoreEntry(readscores,useruuid,uuid) {
    const jsonArray = JSON.parse(readscores)

    const index = jsonArray.indexOf(uuid);
    if (index > -1) {
        jsonArray.splice(index, 1);
    }

   var sql_write=`UPDATE account SET scoreReadPermission = '${JSON.stringify(jsonArray)}' WHERE uuid = '${useruuid}'`;
   global.connection.query(sql_write, function(err, result){

   })
}