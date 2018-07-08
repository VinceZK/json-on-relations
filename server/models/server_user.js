/**
 * Created by VinceZK on 9/16/14.
 */
'use strict';
const debug = require('debug')('darkhouse/user');
const entity = require('./entity.js');
const path = require('path');
const Message = require('ui-message').Message;
const MsgFileStore = require('ui-message').MsgFileStore;

const msgStore = new MsgFileStore(path.join(__dirname, '../../data/message.json'));
const message = new Message(msgStore, 'EN');



const userEntity = new entity('user');
var userMsg = new msg('user');

module.exports = {
    /**
     * Create a new user
     * @param userObj
     * @param callback(msg)
     */
    createUser:function(userObj,callback){
        // Add business validation to userObj here
        userEntity.createObject(userObj, function(err){
            if(err){
                debug("Error occurs in createUser()");
                return callback(userMsg.reportMsg('USER_CREATION_FAIL','E',userObj.USER_ID));
                // message.reportShortText('LOGON', 'USER_PASSWORD_WRONG', 'E')
            }
            callback(userMsg.reportMsg('USER_CREATION_SUCCESS','S',userObj.USER_ID));
        })
    },

    /**
     * Soft delete a user.
     * @param userId
     * @param callback(msg)
     */
    softDeleteUser: function(userId,callback){
        userEntity.softDeleteById({USER_ID:userId}, function (err, retCode) {
            if(err){
                debug("Error occurs in softDeleteUser()");
                return callback(userMsg.reportMsg('SOFT_DELETE_FAIL','E',userId))
            }
            switch (retCode){
                case -1:
                    callback(userMsg.reportMsg('ID_NOT_EXIST','E', 'USER_ID'));
                    break;
                case 0:
                    callback(userMsg.reportMsg('KEY_NOT_EXIST','E',userId));
                    break;
                case 1:
                default :
                    callback(userMsg.reportMsg('SOFT_DELETE_SUCCESS','S', userId));
            }
        });
    },

    /**
     * Restore the soft deleted user
     * @param userId
     * @param callback(msg)
     */
    restoreUser: function(userId,callback){
        userEntity.restoreObjectById({USER_ID:userId}, function (err, retCode) {
            if(err){
                debug("Error occurs in restoreUser()");
                return callback(userMsg.reportMsg('RESTORE_FAIL','E',userId))
            }
            switch (retCode){
                case -1:
                    callback(userMsg.reportMsg('ID_NOT_EXIST','E', 'USER_ID'));
                    break;
                case 0:
                    callback(userMsg.reportMsg('KEY_NOT_EXIST','E',userId));
                    break;
                case 1:
                default :
                    callback(userMsg.reportMsg('RESTORE_SUCCESS','S', userId));
            }
        });
    },

    /**
     * Delete the user from the DB
     * @param userId
     * @param callback(msg)
     */
    hardDeleteUser: function(userId,callback){
        userEntity.hardDeleteById({USER_ID:userId}, function (err, retCode) {
            if(err){
                debug("Error occurs in hardDeleteUser()");
                return callback(userMsg.reportMsg('HARD_DELETE_FAIL','E',userId))
            }
            switch (retCode){
                case -2:
                    callback(userMsg.reportMsg('REQUIRE_SOFT_DELETE','E', userId));
                    break;
                case -1:
                    callback(userMsg.reportMsg('ID_NOT_EXIST','E', 'USER_ID'));
                    break;
                case 0:
                    callback(userMsg.reportMsg('KEY_NOT_EXIST','E',userId));
                    break;
                case 1:
                default :
                    callback(userMsg.reportMsg('HARD_DELETE_SUCCESS','S', userId));
            }
        });
    },

    /**
     * Get all the attributes value in a join SQL
     * @param userID
     * @param callback(msg, loginUser)
     * loginUser is a JSON object or NULL if the userId is not exist!
     */
    getUserByID:function(userID,callback) {
        userEntity.getObjectById({USER_ID:userID}, function (err, instance) {
            if(err){
                debug("The attribute 'USER_ID' is not an ID attribute!");
                return callback(userMsg.reportMsg(err,'E','USER_ID'));
            }

            var msg;
            if(instance){
                msg = userMsg.reportMsg('USER_GET_SUCCESS','S',userID);
            }else{
                msg = userMsg.reportMsg('USER_NOT_EXIST','E',userID);
            }
            return callback(msg, instance);
        });
    },

    /**
     * Get all the attributes value in a join SQL
     * @param email
     * @param callback(msg, loginUser)
     * loginUser is a JSON object or Null if the email is not exist
     */
    getUserByEmail:function(email,callback) {
        userEntity.getObjectById({EMAIL:email}, function (err, instance) {
            if(err){
                debug("The attribute 'EMAIL' is not an ID attribute!");
                return callback(userMsg.reportMsg('ID_NOT_EXIST','E','USER_ID'));
            }

            var msg;
            if(instance){
                msg = userMsg.reportMsg('USER_GET_SUCCESS','S',email);
            }else{
                msg = userMsg.reportMsg('USER_NOT_EXIST','E',email);
            }
            return callback(msg, instance);
        });
    },

    /**
     * Renew the password. update PASSWORD & PWD_STATE at same time.
     * @param email
     * @param newPWD
     * @param callback
     */
    changePWD: function(email, newPWD, callback) {
        console.log(email);
        userEntity.changeObjectById({EMAIL: email}, {PWD_STATE: 1, PASSWORD: newPWD}, function (err, retCode) {
            if (err) {
                debug("Error occurs in changePWD()");
                return callback(userMsg.reportMsg('USER_PWD_CHANGE_FAIL', 'E'))
            }
            switch (retCode) {
                case -4:
                    callback(userMsg.reportMsg('UNIQUE_ATTRIBUTE_LIMIT', 'E', err));
                    break;
                case -3:
                    callback(userMsg.reportMsg('ATTRIBUTE_NOT_EXIST', 'E', 'user', err));
                    break;
                case -2:
                    callback(userMsg.reportMsg('REQUIRE_SOFT_DELETE', 'E', email));
                    break;
                case -1:
                    callback(userMsg.reportMsg('ID_NOT_EXIST', 'E', 'EMAIL'));
                    break;
                case 0:
                    callback(userMsg.reportMsg('KEY_NOT_EXIST', 'E', email));
                    break;
                case 1:
                default :
                    callback(userMsg.reportMsg('USER_PWD_CHANGE_SUCCESS', 'S'));
            }
        });
    },

    /**
     * Get the meta data of user entity
     */
    getUserEntityMeta:function(){
        return userEntity.entityMeta;
    }
};


