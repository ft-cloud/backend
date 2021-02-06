const account = require('./account')
const apps = require('./app.js')
var uuid = require('uuid');

var counter =0;
module.exports = {

    getWriteScores: function(appid,useruuid, callback){
        var sql = `SELECT scoreWritePermission FROM account WHERE uuid = '${useruuid}';`
        global.connection.query(sql, function(err, result){
            if (err) throw err;
            console.log("result: ");
            console.log(JSON.parse(result[0].scoreWritePermission));

            if(JSON.parse(result[0].scoreWritePermission).length==0) {
            callback([]);
            }else{
                var counter = 0;
                var return_result = [];
                for(var i=0;i<JSON.parse(result[0].scoreWritePermission).length;i++) {
                    getScoreObject(appid,JSON.parse(result[0].scoreWritePermission)[i],(r)=>{
                            
                        counter++;
                        if(r!=undefined)
                        return_result.push(r);
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
                            if(r!=undefined)
                            return_result.push(r);
                            if(counter==JSON.parse(result[0].scoreReadPermission).length) {
    
                                callback(return_result);
                            }
    
                        })
                    } 
                    
                }



    });
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
            console.log("old: ");
            console.log(old_scoreWritePermission.scoreWritePermission);

         const jsonArray =   JSON.parse(old_scoreWritePermission.scoreWritePermission)
         jsonArray.push(scoreuuid); 

        var sql_write=`UPDATE account SET scoreWritePermission = '${JSON.stringify(jsonArray)}' WHERE uuid = '${useruuid}'`;
        global.connection.query(sql_write, function(err, result){
        
        callback(scoreuuid);

        
        });
        });
    });
    }

    ,
    listIstalledApps: function(user,callback) {

        account.getAccountByUUID(user, (user) => {

            if(user==undefined) {
                callback(undefined);
            }

            var rawinstalledapps=JSON.parse(user.installedApps);
            var output = [];
            counter = 0;
            console.log("installedapps: ");
            for(var i=0;i<rawinstalledapps.installedApps.length; i++){
                console.log(rawinstalledapps.installedApps[i]);
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