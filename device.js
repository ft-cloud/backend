
var uuid = require('uuid');

var device = {

   createDeviceEntry: function(deviceUUID,name, callback) {
       if(!deviceUUID) callback(undefined);
       const uuidGen = uuid.v4();
        var sql = `INSERT INTO deviceData (uuid,name,data,deviceUUID) VALUES (?, ?,'',?)`;

       global.connection.query(sql,[uuidGen,name,deviceUUID], function (err, result) {
           if (err) throw err;

           callback(uuidGen);
       });


   },

   getUserDevices: function (userUUID,callback) {
       if(!userUUID) callback(undefined);
       var sql = `SELECT accessibleDevices  FROM account WHERE uuid = ? `;

       global.connection.query(sql,[userUUID], function (err, result) {
           if (err) throw err;

           callback(JSON.parse(result[0].accessibleDevices));
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

    storeUserDevices: function (userDevices,userUUID,callback) {
       if(!userDevices) callback(undefined);
        var sql = `UPDATE account SET accessibleDevices = ? WHERE uuid = ?`;

        global.connection.query(sql,[userDevices,userUUID], function (err, result) {
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


    listAll: function(callback) {

        var sql = `SELECT * FROM device`;

        global.connection.query(sql, function (err, result) {
            if (err) throw err;

            callback(result);
        });


    },


    listSpecificDevice: function(uuid,device,callback) {
            var sql = `SELECT accessibleDevices FROM account WHERE uuid = ?;`
            global.connection.query(sql, [uuid],function(err, result){
                if (err) throw err;
                console.log(JSON.parse(result[0].accessibleDevices));
                
    
                if(JSON.parse(result[0].accessibleDevices).length==0) {
    
                    callback([]);
                    }else{
    
                        var counter = 0;
                        var return_result = [];
                        for(var i=0;i<JSON.parse(result[0].accessibleDevices).length;i++) {
                            getDevice(JSON.parse(result[0].accessibleDevices)[i],(r)=>{
                                    
                                if(r!=undefined&&r.deviceUUID===device) {
                                return_result.push(r);
                                }else{
                                    //if(r.deviceUUID===device)
                                    //removeReadScoreEntry(result[0].accessibleDevices,useruuid,JSON.parse(result[0].accessibleDevices)[counter]);
                                    //TODO remove this
                                }
    
                                counter++;
    
                                if(counter==JSON.parse(result[0].accessibleDevices).length) {
                                    callback(return_result);
                                }
        
                            })
                        } 
                        
                    }
    
    
    
        });
        


    }



}


module.exports = device;


function getDevice(deviceID,callback) {

    var sql = `SELECT * FROM deviceData WHERE uuid = ?;`
    global.connection.query(sql, [deviceID],function(err, result){
        if (err) throw err;
        callback(result[0]);
});


}
