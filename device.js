
var uuid = require('uuid');

var device = {

   createDeviceEntry: function(deviceUUID,name, callback) {
       if(!deviceUUID) callback(undefined);
       const uuidGen = uuid.v4();
        var sql = `INSERT INTO deviceData (uuid,name,config,deviceUUID) VALUES (?, ?,'{}',?)`;

       global.connection.query(sql,[uuidGen,name,deviceUUID], function (err, result) {
           if (err) throw err;

           callback(uuidGen);
       });


   },



   getDeviceConfig: function(uuid,deviceUUID,callback) {
    if(!uuid) callback(undefined);

         var sql = `SELECT config FROM deviceData WHERE uuid = ?`
        global.connection.query(sql,[deviceUUID], function(err, result){

            if(result&&result[0]){
                console.log(result[0])
                callback(result[0].config)

            }else{
                callback(undefined);
            }

        })

   },

    storeUserDevices: function (userDeviceUUID,userUUID,deviceUUID,callback) {
       if(!userDeviceUUID) callback(undefined);
       var sql_addDevicePermission=`INSERT INTO userDeviceAccess (user,device,deviceType) VALUES (?, ?,?)`;

       global.connection.query(sql_addDevicePermission,[userUUID,userDeviceUUID,deviceUUID], function(err, result){
           if (err) throw err;
           callback();
       });

    },

    

    updateDeviceConfig: function(deviceuuid, config, callback){
        var sql = `UPDATE deviceData SET config = ? WHERE UUID = ?`
         global.connection.query(sql, [config,deviceuuid],function (err, result) {
            console.log(err);
            console.log(result);
            callback();

         })
    },

    deleteDeviceConnection: function(deviceuuid, callback){
       
            var sql = `DELETE FROM userDeviceAccess WHERE device = ?`
            global.connection.query(sql,[deviceuuid], function (err, result) {
                if(result.affectedRows>0) {
                var sql = `DELETE FROM deviceData WHERE UUID = ?`
                global.connection.query(sql,[deviceuuid], function (err, result) {

            callback(true);

        })
    }else{
        callback(false);
    }
         })
    },


    listAll: function(callback) {

        var sql = `SELECT * FROM device`;

        global.connection.query(sql, function (err, result) {
            if (err) throw err;

            callback(result);
        });


    },

    deleteAPIKey: function(deviceuuid,callback) {

        var sql = `DELETE FROM session WHERE usedBy = ?`
        global.connection.query(sql,[deviceuuid], function (err, result) {
           console.log(err);
           console.log(result);
           callback();


        })

       
    },


    listSpecificDevice: function(uuid,device,callback) {
            var sql = `SELECT name,uuid,config,deviceUUID FROM deviceData d, userDeviceAccess u WHERE (d.uuid=u.device) AND  (d.deviceUUID=?) AND (u.user=?)`
            global.connection.query(sql, [device,uuid],function(err, result){
              
                callback(result);
    
        });
        


    }



}


module.exports = device;


