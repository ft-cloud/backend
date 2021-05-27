var uuid = require('uuid');
const admin = require("../account/account");

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

    checkUserDeviceAccessPermission: function (useruuid, deviceuuid) {
        return new Promise(function (resolve, reject) {
            var sql = `SELECT *
                       FROM userDeviceAccess
                       WHERE user = ?
                         AND device = ?`;

            global.connection.query(sql, [useruuid, deviceuuid], function (err, result) {
                admin.isUserAdmin(useruuid,(isAdmin) =>{
                    resolve((result && result[0])||isAdmin);

                })

            });

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


    getUserSpecificDeviceInfo: function (useruuid, device, callback) {


        admin.isUserAdmin(useruuid, (isAdmin) => {
            if (isAdmin) {
                var sql = `SELECT name, uuid, config, deviceUUID, online, statusInfo
                           FROM deviceData d
                           WHERE (d.uuid = ?)`;
                global.connection.query(sql, [device], function (err, result) {

                    if (result[0] === undefined) {
                        callback({
                            error: true,
                            errorMessage: "Device does not exist!"
                        });
                    } else {
                        callback(result[0]);
                    }


                });
            } else {

                var sql = `SELECT name, uuid, config, deviceUUID, online, statusInfo
                           FROM deviceData d,
                                userDeviceAccess u
                           WHERE (d.uuid = u.device)
                             AND (d.uuid = ?)
                             AND (u.user = ?)`;
                global.connection.query(sql, [device, useruuid], function (err, result) {


                    if (result[0] === undefined) {

                        var sqlCheckExist = `SELECT name FROM deviceData d WHERE(d.uuid = ?)`;
                        global.connection.query(sqlCheckExist, [device, useruuid], function (err, exist) {


                            if (exist[0] === undefined) {
                                callback({
                                    error: true,
                                    errorMessage: "Device does not exist!"
                                });

                            }else{
                                callback({
                                    error: true,
                                    errorMessage: "No Access!"
                                });

                            }

                        });


                    }else{
                        callback(result[0]);

                    }

                });

            }

        });


    },

    changeDeviceName: function(deviceUUID,newName,callback) {
        const sql = `UPDATE deviceData SET name = ? WHERE deviceData.uuid = ?;`
        global.connection.query(sql, [newName, deviceUUID], function (err, result) {

            callback(result);

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

    },

    updateStatusInfo: function (device, key, value, callback) {
        var sql = `SELECT statusInfo
                   FROM deviceData
                   WHERE (uuid = ?)`;
        global.connection.query(sql, [device], function (err, result) {
            console.log(result[0]);
            var statusInfoJson = JSON.parse(result[0].statusInfo);
            console.log(value);
            statusInfoJson[String(key)] = String(value);
            var setSQL = `UPDATE deviceData
                          SET statusInfo = ?
                          WHERE uuid = ?`;
            console.log(JSON.stringify(statusInfoJson));
            global.connection.query(setSQL, [JSON.stringify(statusInfoJson), device], function (err, SETresult) {
                console.log(SETresult);
                callback();


            });


        });

    }


};


module.exports = device;


