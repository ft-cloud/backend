const account = require('./account')
module.exports = {


    listIstalledApps: function(user,callback) {

        account.getAccountByUUID(user, (user) => {
       
            callback(user.installedApps)

        })

    }



}