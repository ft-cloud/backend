var uuid = require('uuid');


var drone = {

    addDroneMission: function (user,name) {
       return new Promise((resolve => {
            const missionUUID = uuid.v4()
           const sql = `INSERT INTO droneMission
                     values ('${missionUUID}',?,?,'{}')`;
           global.connection.query(sql, [name,user], function (err, result) {
               console.log(result);

            resolve(missionUUID)
           });

       }))


    },
    getAllUserMissions: function (user) {
        return new Promise((resolve,reject) => {

            const sql = `SELECT uuid,name FROM droneMission WHERE user = ?`;
            global.connection.query(sql, [user], function (err, result) {

                resolve(result)
            });


        })
    }


};

module.exports = drone;


