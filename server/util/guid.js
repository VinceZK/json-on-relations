/**
 * Created by VinceZK on 10/12/14.
 */
const uuid = require('node-uuid');

module.exports = {
    /**
     * Return a time-based upper case UUID with out '-'.
     */
    genTimeBased:function(){
        let timeBasedGuid = uuid.v1();
        return timeBasedGuid.replace(/-/g,"").toUpperCase();
    },

    genRandom:function(){
        let randomGuid = uuid.v4();
        return randomGuid.replace(/-/g,"").toUpperCase();
    }
};
