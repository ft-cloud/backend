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

    getAppUUIDByScore: function(scoreuuid,callback) {
        var sql = `SELECT app FROM score WHERE uuid = ?`
        global.connection.query(sql,[scoreuuid], function(err, result){

            if(result&&result[0]&&result[0].app){

                callback(result[0].app)

            }else{
                callback(undefined);
            }

        })


    },


    setDefaultScore: function(scoreuuid,appuuid,useruuid,callback) {

        this.hasReadPermission(scoreuuid,useruuid,(permission)=> {
            if (!permission) {
                callback(undefined);
                return;
            }

            const CheckExist = "SELECT * FROM selectedScore WHERE useruuid = ? AND appuuid = ?;";
            global.connection.query(CheckExist, [useruuid.toString(), appuuid.toString()], function (err, exist) {

                if(!exist[0]) {
                    const createSelectedScore = "INSERT INTO selectedScore (useruuid,appuuid,scoreuuid) VALUES (?,?,?);"
                    global.connection.query(createSelectedScore, [useruuid.toString(), appuuid.toString(),scoreuuid.toString()], function (err, insert) {
                        callback(true);
                    });
                }else{
                    const updateSelectedScore = "UPDATE selectedScore SET scoreuuid = ? WHERE useruuid = ? AND appuuid = ?"
                    global.connection.query(updateSelectedScore, [scoreuuid.toString(),useruuid.toString(), appuuid.toString()], function (err, insert) {
                        callback(true);
                    });
                }


            });

        });
    },

    getScores: function(appuuid,user,callback) {

        const sql_getScores = ' SELECT name,uuid FROM score s, readScoreAccess r WHERE (r.score=s.uuid) AND  (s.app=?) AND (r.user=?)'
        global.connection.query(sql_getScores,[appuuid.toString(),user.toString()], function(err, resultRead){

            const sql_getScores = 'SELECT name,uuid FROM score s, writeScoreAccess w WHERE (w.score=s.uuid) AND  (s.app=?) AND  (w.user=?)'
            global.connection.query(sql_getScores,[appuuid.toString(),user.toString()], function(err, resultWrite){
                const tempOBJ = {
                    read: resultRead,
                    write: resultWrite
                }

                callback(tempOBJ)

            });

        });


    },




    hasReadPermission: function(scoreuuid, useruuid,callback) {
        
        var sql_getWritePermissionapps=`SELECT * FROM writeScoreAccess WHERE (user = ?) AND (score = ?);`;
        global.connection.query(sql_getWritePermissionapps,[useruuid.toString(),scoreuuid.toString()], function(err, resultWrite){


        var sql_getWritePermissionapps=`SELECT * FROM readScoreAccess WHERE (user = ?) AND (score = ?);`;
        global.connection.query(sql_getWritePermissionapps,[useruuid.toString(),scoreuuid.toString()], function(err, resultRead){
        callback( resultWrite.length>0||resultRead.length>0);

        })
    })

    },
    hasWritePermission: function(scoreuuid, useruuid,callback) {

        var sql_getWritePermissionapps=`SELECT * FROM writeScoreAccess WHERE (user = ?) AND (score = ?);`;
        global.connection.query(sql_getWritePermissionapps,[useruuid.toString(),scoreuuid.toString()], function(err, result){
            if (err) throw err;
            callback( result.length>0);
        })

    },

  
    addScore: function(useruuid, name, Appuuid, callback){
        var scoreuuid=uuid.v4();
        var sql_addScore=`INSERT INTO score (uuid,name,data,app,owner) VALUES (?, ?,'{}',?,?)`;
        global.connection.query(sql_addScore,[scoreuuid,name,Appuuid,useruuid], function(err, result){
            if (err) throw err;
        
            var sql_addScorePermission=`INSERT INTO writeScoreAccess (user,score,appid) VALUES (?, ?,?)`;

            global.connection.query(sql_addScorePermission,[useruuid,scoreuuid,Appuuid], function(err, result){
                if (err) throw err;
                callback(scoreuuid);
            });

       
    });
    },

    updateScore: function(scoreuuid, data, callback){
        var sql = `UPDATE score SET data = ? WHERE UUID = ?`
         global.connection.query(sql, [data,scoreuuid],function (err, result) {
            callback();


         })
    },

    deleteScore: function(scoreuuid, callback){
        var sql = `DELETE FROM score WHERE UUID = ?`
         global.connection.query(sql,[scoreuuid], function (err, result) {
            var sql_access = `DELETE FROM writeScoreAccess WHERE score = ?`
            global.connection.query(sql_access,[scoreuuid], function (err1, result1) {


            callback();

            })
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


    listInstalledCompatibleApps: function(user,deviceuuid, callback) {
        account.getAccountByUUID(user, (user) => {

       
            var rawinstalledapps=JSON.parse(user.installedApps);
            var output = [];
            counter = 0;

            if(rawinstalledapps.installedApps===undefined||!rawinstalledapps) {
               
                callback(undefined)
                return;
            }


            const sql_getCompatibleApps = `SELECT compatibleApps FROM device WHERE UUID = ?`
            global.connection.query(sql_getCompatibleApps,[deviceuuid],function(err,resultApps) {

                if(resultApps&&resultApps[0]) {
                    const comApps = JSON.parse(resultApps[0].compatibleApps)
                
                 



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
                         if(comApps.indexOf(result[0].UUID)!=-1)
                         output.push(tempObject);
                       

                    }
                    counter++;
                    if(counter==(rawinstalledapps.installedApps.length)) {
                        callback(JSON.stringify(output));
                    }

                  });
            }
            

        }
        })

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





        var sql_getReadScores=`SELECT * FROM readScoreAccess WHERE user = ? AND score = ?;`;
        global.connection.query(sql_getReadScores,[useruuid.toString(),scoreuuid.toString()], function(err, result){
            if (err) throw err;

         if(!result[0]) {
             callback(false);
             return;
         }


        var sql_write=`DELETE FROM readScoreAccess WHERE user = ? AND score = ?`;
        global.connection.query(sql_write,[useruuid,scoreuuid], function(err, result){
        
        callback(true);

        
        });
        });
 
    },

    removeWriteScore: function(useruuid, scoreuuid, callback){


        var old_scores;
        var sql_getWriteScores=`SELECT * FROM writeScoreAccess WHERE user = ? AND score = ?;`;
        global.connection.query(sql_getWriteScores,[useruuid.toString(),scoreuuid.toString()], function(err, result){
            if (err) throw err;
            old_scores=result[0];



            if(!result[0]) {
                callback(false);
                return;
            }



            var sql_write=`DELETE FROM writeScoreAccess WHERE user = ? AND score = ?`;
            global.connection.query(sql_write,[useruuid,scoreuuid], function(err, result){

                callback(true);


            });
        });
    },

    getInstallURL: function(appuuid,callback) {
        var sql=`SELECT url FROM application WHERE uuid = ?;`;
        global.connection.query(sql,[appuuid], function(err, result){
            if (err) throw err;
         callback(result[0]);
    })


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