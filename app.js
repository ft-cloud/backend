const account = require('./account')
var uuid = require('uuid');

var counter =0;
module.exports = {

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
        
        callback();

        
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