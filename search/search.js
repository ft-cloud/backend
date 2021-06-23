var search = {

    searchForDeviceNames: function (searchString, user) {
        return new Promise(function (resolve, reject) {
            let search = generateSearchSQL(searchString,Array("deviceData.name"));
            const values = generateValues(searchString,Array("deviceData.name"));
            const sql = `SELECT DISTINCT "device"        as "resultType",
                                deviceData.name as "foundString",
                                deviceData.uuid,
                                deviceData.name,
                                device.name as "deviceTypeName",
                                device.UUID as "deviceTypeUUID"
                         FROM device,
                              deviceData,
                              userDeviceAccess
                         WHERE userDeviceAccess.device = deviceData.uuid
                           AND userDeviceAccess.user = ?
                           AND deviceData.deviceUUID = device.UUID
                           AND ${search}`;
            console.log(sql)
            global.connection.query(sql,[user].concat(values), function (err, result) {
                resolve(result);
            });

        });
    },
    searchForDeviceTypeNames: function (searchString) {
        return new Promise(function (resolve, reject) {
            let search = generateSearchSQL(searchString,Array("device.name"));
            const values = generateValues(searchString,Array("device.name"));


            const sql = `SELECT DISTINCT "deviceType" as "resultType", device.name as "foundString", device.name as "deviceTypeName", device.UUID
                         FROM device
                         WHERE ${search}`;
            console.log(values)

            global.connection.query(sql,values, function (err, result) {
                resolve(result);
            });

        });
    }


};


function generateSearchSQL(searchString, ...columnnames) {

    let sql = "(";
    let first = true;

    columnnames.forEach((column) => {
        searchString.split(" ").forEach((word) => {
            if(word.length>=2) {
                if (first) {
                    first = false;
                } else {
                    sql += " AND "
                }
                sql += `${column} LIKE ?`
            }

        })
    });
    sql += ")"

    return sql;

}

function generateValues(searchString,...columnnames) {

    const values = [];
    columnnames.forEach(() => {
        searchString.split(" ").forEach((word) => {
            if(word.length>=2) {
                values.push(`%${word}%`);
            }
        })
    })
    return values;
}


module.exports = search;