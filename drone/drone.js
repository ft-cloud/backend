var uuid = require('uuid');
const account = require("../account/account");


var drone = {

    addDroneMission: function (user, name,data) {
        return new Promise((resolve => {
            const missionUUID = uuid.v4();
            const sql = `INSERT INTO droneMission
                         values ('${missionUUID}', ?, ?, ?)`;
            global.connection.query(sql, [name, user,data!==undefined?data:'{}'], function (err, result) {

                resolve(missionUUID);
            });

        }));


    },
    getAllUserMissions: function (user) {
        return new Promise((resolve, reject) => {

            const sql = `SELECT uuid, name
                         FROM droneMission
                         WHERE user = ?`;
            global.connection.query(sql, [user], function (err, result) {

                resolve(result);
            });


        });
    },


    getDroneMissionData: function (user, missionUUID) {


        return new Promise((resolve, reject) => {

            const sql = `SELECT droneMission.uuid, droneMission.name, droneMission.data
                         FROM droneMission,
                              account
                         WHERE ((droneMission.user = ?) OR ((account.admin = 1) AND (account.uuid = ?)))
                           AND droneMission.uuid = ?`;
            global.connection.query(sql, [user, user, missionUUID], function (err, result) {

                if (result && result[0]) {
                    resolve(result[0]);
                } else {
                    resolve({name: "Not found", error: true});
                }
            });


        });
    },
    saveMissionData: function (user, missionUUID, data) {


        return new Promise((resolve, reject) => {
            const sql = `UPDATE droneMission,account
                         SET droneMission.data = ?
                         WHERE ((droneMission.user = ?) OR ((account.admin = 1) AND (account.uuid = ?)))
                           AND droneMission.uuid = ? `;
            global.connection.query(sql, [data, user, user, missionUUID], function (err, result) {

                resolve();
            });


        });
    },
    deleteMission: function (user, missionUUID) {
        return new Promise((resolve, reject) => {
        this.getDroneMissionData(user, missionUUID).then(check => {
            if (!check.error) {

                    const sql = `DELETE
                                 FROM droneMission
                                 WHERE (droneMission.uuid = ?) `;
                    global.connection.query(sql, [missionUUID], function (err, result) {

                        resolve(true);
                    });



            }else{
                resolve(false);

            }
        });
        });

    },


};

module.exports = drone;


