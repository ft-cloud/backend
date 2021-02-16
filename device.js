
var uuid = require('uuid');

var device = {

   createDeviceEntry: function(deviceUUID,name, callback) {
       if(!deviceUUID) callback(undefined);
       const uuidGen = uuid.v4();
        var sql = `INSERT INTO deviceData (uuid,name,data) VALUES (?, ?,'')`;

       global.connection.query(sql,[uuidGen,name], function (err, result) {
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

    storeUserDevices: function (userDevices,userUUID,callback) {
       if(!userDevices) callback(undefined);
        var sql = `UPDATE account SET accessibleDevices = ? WHERE uuid = ?`;

        global.connection.query(sql,[userDevices,userUUID], function (err, result) {
            if (err) throw err;

            callback();
        });

    }



}


module.exports = device;