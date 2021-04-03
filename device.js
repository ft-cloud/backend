var uuid = require('uuid');

var device = {

    createDeviceEntry: function (deviceUUID, name, callback) {
        if (!deviceUUID) callback(undefined);
        const uuidGen = uuid.v4();
        var sql = `INSERT INTO deviceData (uuid, name, config, deviceUUID)
                   VALUES (?, ?, '{}', ?)`;

        global.connection.query(sql, [uuidGen, name, deviceUUID], function (err, result) {
            if (err) throw err;

            callback(uuidGen);
        });


    },


    getDeviceConfig: function (uuid, deviceUUID, callback) {
        if (!uuid) callback(undefined);

        var sql = `SELECT config
                   FROM deviceData
                   WHERE uuid = ?`;
        global.connection.query(sql, [deviceUUID], function (err, result) {

            if (result && result[0]) {
                callback(result[0].config);

            } else {
                callback(undefined);
            }

        });

    },

    storeUserDevices: function (userDeviceUUID, userUUID, deviceUUID, callback) {
        if (!userDeviceUUID) callback(undefined);
        var sql_addDevicePermission = `INSERT INTO userDeviceAccess (user, device, deviceType)
                                       VALUES (?, ?, ?)`;

        global.connection.query(sql_addDevicePermission, [userUUID, userDeviceUUID, deviceUUID], function (err, result) {
            if (err) throw err;
            callback();
        });

    },


    updateDeviceConfig: function (deviceuuid, config, callback) {
        var sql = `UPDATE deviceData
                   SET config = ?
                   WHERE UUID = ?`;
        global.connection.query(sql, [config, deviceuuid], function (err, result) {

            callback();

        });
    },

    deleteDeviceConnection: function (deviceuuid, callback) {

        var sql = `DELETE
                   FROM userDeviceAccess
                   WHERE device = ?`;
        global.connection.query(sql, [deviceuuid], function (err, result) {
            if (result.affectedRows > 0) {
                var sql = `DELETE
                           FROM deviceData
                           WHERE UUID = ?`;
                global.connection.query(sql, [deviceuuid], function (err, result) {

                    callback(true);

                });
            } else {
                callback(false);
            }
        });
    },


    listAll: function (callback) {

        var sql = `SELECT *
                   FROM device`;

        global.connection.query(sql, function (err, result) {
            if (err) throw err;

            callback(result);
        });


    },

    deleteAPIKey: function (deviceuuid, callback) {

        var sql = `DELETE
                   FROM session
                   WHERE usedBy = ?`;
        global.connection.query(sql, [deviceuuid], function (err, result) {

            callback();


        });


    },

    getDeviceUUID: function (session, callback) {


        var sql = `SELECT usedBy
                   FROM session
                   WHERE uuid = ?`;
        global.connection.query(sql, [session], function (err, result) {

            if (result[0] != undefined) {
                callback(result[0].usedBy);
            } else {
                callback(undefined);
            }


        });


    },

    getOnlineState: function (deviceuuid, callback) {

        var sql = `SELECT online
                   FROM deviceData
                   WHERE uuid = ?`;
        global.connection.query(sql, [deviceuuid], function (err, result) {

            if (result[0] != undefined) {
                callback(result[0].online);
            } else {
                callback(undefined);
            }


        });


    },

    setOnlineState: function (state, deviceuuid, callback) {

        var sql = `UPDATE deviceData
                   SET online = ?
                   WHERE uuid = ?`;
        global.connection.query(sql, [state, deviceuuid], function (err, result) {

            callback();


        });


    },

    getDeviceTypFromDevice: function (deviceuuid, callback) {
        const sql = `SELECT deviceUUID
                     FROM deviceData
                     WHERE uuid = ?`;
        global.connection.query(sql, [deviceuuid], function (err, result) {
            const sql_getDeviceType = `SELECT *
                                       FROM device
                                       WHERE UUID = ?`;
            global.connection.query(sql_getDeviceType, [result[0].deviceUUID], function (err, result) {

                callback(result[0]);


            });
        });

    },


    listSpecificDevice: function (uuid, device, callback) {
        var sql = `SELECT name, uuid, config, deviceUUID, online
                   FROM deviceData d,
                        userDeviceAccess u
                   WHERE (d.uuid = u.device)
                     AND (d.deviceUUID = ?)
                     AND (u.user = ?)`;
        global.connection.query(sql, [device, uuid], function (err, result) {

            callback(result);

        });


    }


};


module.exports = device;


