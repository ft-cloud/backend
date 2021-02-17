const account = require('./account')
const apps = require('./app.js')
var uuid = require('uuid');
var currentWriteDelete;
var counter =0;
module.exports = {


    getUserAppConfig: function(scoreuuid,callback) {

       
        var sql = `SELECT data FROM score WHERE uuid = ?`
        global.connection.query(sql,[scoreuuid], function(err, result){

            if(result&&result[0]&&result[0].data){

                callback(result[0].data)

            }else{
                callback(undefined);
            }

        })
    

      
    },


    


    
    getWriteScores: function(appid,useruuid, callback){
        var sql = `SELECT scoreWritePermission FROM account WHERE uuid = ?;`
        global.connection.query(sql,[useruuid], function(err, result){
            if (err) throw err;

            currentWriteDelete =JSON.parse(result[0].scoreWritePermission)

            if(JSON.parse(result[0].scoreWritePermission).length==0) {
            callback([]);
            }else{
                var counter = 0;
                var return_result = [];
                for(var i=0;i<JSON.parse(result[0].scoreWritePermission).length;i++) {
                    getScoreObject(appid,JSON.parse(result[0].scoreWritePermission)[i],(r)=>{
                            
                        if(r!=undefined&&r.app===appid) {
                        r.readonly = false;
                        return_result.push(r);
                        }else{
                            if(r==undefined||r.app===appid)
                            removeWriteScoreEntry(result[0].scoreWritePermission,useruuid,JSON.parse(result[0].scoreWritePermission)[counter]);
                        }
                        counter++;

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
        var sql = `SELECT scoreReadPermission FROM account WHERE uuid = ?;`
        global.connection.query(sql, [useruuid],function(err, result){
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
                                
                            if(r!=undefined&&r.app===appid) {
                                r.readonly = true;

                            return_result.push(r);
                            }else{
                                if(r.app===appid)
                                removeReadScoreEntry(result[0].scoreReadPermission,useruuid,JSON.parse(result[0].scoreReadPermission)[counter]);
                            
                            }

                            counter++;

                            if(counter==JSON.parse(result[0].scoreReadPermission).length) {
    
                                callback(return_result);
                            }
    
                        })
                    } 
                    
                }



    });
    },

    hasReadPermission: function(scoreuuid, useruuid,callback) {
        
        var sql_getWritePermissionapps=`SELECT scoreWritePermission FROM account WHERE uuid = ?;`;
        global.connection.query(sql_getWritePermissionapps,[useruuid.toString()], function(err, resultWrite){


        var sql_getWritePermissionapps=`SELECT scoreReadPermission FROM account WHERE uuid = ?;`;
        global.connection.query(sql_getWritePermissionapps,[useruuid.toString()], function(err, resultRead){
        callback( JSON.parse(resultWrite[0].scoreWritePermission).includes(scoreuuid)||JSON.parse(resultRead[0].scoreReadPermission).includes(scoreuuid));

        })
    })

    },
    hasWritePermission: function(scoreuuid, useruuid,callback) {

        var sql_getWritePermissionapps=`SELECT scoreWritePermission FROM account WHERE uuid = ?;`;
        global.connection.query(sql_getWritePermissionapps,[useruuid.toString()], function(err, result){
            if (err) throw err;
        callback(  JSON.parse(result[0].scoreWritePermission).includes(scoreuuid));
        })

    },

  
    addScore: function(useruuid, name, Appuuid, callback){
        var scoreuuid=uuid.v4();
        var sql_addScore=`INSERT INTO score (uuid,name,data,app) VALUES (?, ?,'{}',?)`;
        global.connection.query(sql_addScore,[scoreuuid,name,Appuuid], function(err, result){
            if (err) throw err;
        
        var old_scoreWritePermission;
        var sql_getWritePermissionapps=`SELECT scoreWritePermission FROM account WHERE uuid = ?;`;
        global.connection.query(sql_getWritePermissionapps, [useruuid.toString()],function(err, result){
            if (err) throw err;
            old_scoreWritePermission=result[0];


         const jsonArray =   JSON.parse(old_scoreWritePermission.scoreWritePermission)
         jsonArray.push(scoreuuid); 

        var sql_write=`UPDATE account SET scoreWritePermission = ? WHERE uuid = ?`;
        global.connection.query(sql_write, [JSON.stringify(jsonArray),useruuid], function(err, result){
        
        callback(scoreuuid);

        
        });
        });
    });
    },

    updateScore: function(scoreuuid, data, callback){
        console.log(data)
        var sql = `UPDATE score SET data = ? WHERE UUID = ?`
         global.connection.query(sql, [data,scoreuuid],function (err, result) {
            console.log(err);
            console.log(result);
            callback();


         })
    },

    deleteScore: function(scoreuuid, callback){
        var sql = `DELETE FROM score WHERE UUID = ?`
         global.connection.query(sql,[scoreuuid], function (err, result) {
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
                var sql = `SELECT * FROM application WHERE uuid = ?;`;
                global.connection.query(sql,[ rawinstalledapps.installedApps[i]], function (err, result) {

                    if(result&&result[0]) {
                        const tempObject = {
                            UUID: result[0].UUID,
                            name: result[0].name,
                        }
                         tempObject["config"] = JSON.parse(result[0].config);
                         tempObject["info"] = JSON.parse(result[0].info);
                         output.push(tempObject);
                       

                    }
                    counter++;
                    if(counter==(rawinstalledapps.installedApps.length)) {
                        callback(JSON.stringify(output));
                    }

                  });
            }
            

           
        })

    },

    installApp: function(useruuid, appuuid, callback){

        var old_installedApps;
        var sql_getInstalledApps=`SELECT installedApps FROM account WHERE uuid = ?;`;
        global.connection.query(sql_getInstalledApps, [useruuid.toString()],function(err, result){
            if (err) throw err;
            old_installedApps=result[0];


         const jsonArray =   JSON.parse(old_installedApps.installedApps)
         jsonArray.installedApps.push(appuuid); 

        var sql_write=`UPDATE account SET installedApps = ? WHERE uuid = ?`;
        global.connection.query(sql_write,[JSON.stringify(jsonArray),useruuid], function(err, result){
        
        callback();

        
        });
        });
 
    },


    removeApp: function(useruuid, appuuid, callback){

        var old_installedApps;
        var sql_getInstalledApps=`SELECT installedApps FROM account WHERE uuid = ?;`;
        global.connection.query(sql_getInstalledApps,[useruuid.toString()], function(err, result){
            if (err) throw err;
            old_installedApps=result[0];


         const jsonArray =   JSON.parse(old_installedApps.installedApps)

         const index = jsonArray.installedApps.indexOf(appuuid);
         if (index > -1) {
            jsonArray.installedApps.splice(index, 1);
         }else{
             callback(false)
         }

         

        var sql_write=`UPDATE account SET installedApps = ? WHERE uuid = ?`;
        global.connection.query(sql_write,[JSON.stringify(jsonArray),useruuid], function(err, result){
        
        callback(true);

        
        });
        });
 
    },

    removeReadScore: function(useruuid, scoreuuid, callback){

        var old_scores;
        var sql_getReadScores=`SELECT scoreReadPermission FROM account WHERE uuid = ?;`;
        global.connection.query(sql_getReadScores,[useruuid.toString()], function(err, result){
            if (err) throw err;
            old_scores=result[0];


         const jsonArray =   JSON.parse(old_scores.scoreReadPermission)

         const index = jsonArray.indexOf(scoreuuid);
         if (index > -1) {
            jsonArray.splice(index, 1);
         }else{
             callback(false)
         }

         

        var sql_write=`UPDATE account SET scoreReadPermission = ? WHERE uuid = ?`;
        global.connection.query(sql_write,[JSON.stringify(jsonArray),useruuid], function(err, result){
        
        callback(true);

        
        });
        });
 
    },

    removeWriteScore: function(useruuid, scoreuuid, callback){

        var old_scores;
        var sql_getWriteScores=`SELECT scoreWritePermission FROM account WHERE uuid = ?;`;
        global.connection.query(sql_getWriteScores,[useruuid.toString()], function(err, result){
            if (err) throw err;
            old_scores=result[0];


         const jsonArray =   JSON.parse(old_scores.scoreWritePermission)

         const index = jsonArray.indexOf(scoreuuid);
         if (index > -1) {
            jsonArray.splice(index, 1);
         }else{
             callback(false)
         }

         

        var sql_write=`UPDATE account SET scoreWritePermission = ? WHERE uuid = ?`;
        global.connection.query(sql_write,[JSON.stringify(jsonArray),useruuid], function(err, result){
        
        callback(true);

        
        });
        });
 
    }


}



 function getScoreObject(appid,uuid,callback) {

    var sql = `SELECT * FROM score WHERE uuid = ?;`
    global.connection.query(sql, [uuid,appid],function(err, result){
        if (err) throw err;
        callback(result[0]);
});


}




function removeWriteScoreEntry(writescores,useruuid,uuid) {
    const jsonArray = JSON.parse(writescores)

    const index = jsonArray.indexOf(uuid);
    if (index > -1) {
        jsonArray.splice(index, 1);
    }

   var sql_write=`UPDATE account SET scoreWritePermission = ? WHERE uuid = ?`;
   global.connection.query(sql_write,[JSON.stringify(jsonArray),useruuid], function(err, result){

   })
}

function removeReadScoreEntry(readscores,useruuid,uuid) {
    const jsonArray = JSON.parse(readscores)

    const index = jsonArray.indexOf(uuid);
    if (index > -1) {
        jsonArray.splice(index, 1);
    }

   var sql_write=`UPDATE account SET scoreReadPermission = ? WHERE uuid =  ?`;
   global.connection.query(sql_write, [JSON.stringify(jsonArray),useruuid], function(err, result){

   })
}