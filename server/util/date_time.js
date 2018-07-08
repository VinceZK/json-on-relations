/**
 * Created by VinceZK on 3/16/15.
 * Date and Time utilities
 */

/**
 * 判断闰年
 * @returns {boolean}
 */
Date.prototype.isLeapYear = function()
{
    return (0 === this.getYear()%4&&((this.getYear()%100!== 0)||(this.getYear()%400 === 0)));
};

/**
 * Format the data and time into strings
 * @param formatStr
 * Year: YYYY/yyyy/YY/yy
 * Month: MM/M
 * W/w: Week
 * dd/DD/d/D Day
 * hh/HH/h/H Hour
 * mm/m minute
 * ss/SS/s/S Second
 * @returns {date string}
 */
Date.prototype.Format = function(formatStr){
    let str = formatStr;
    if (str === undefined || str===null){
        str = "YYYY/MM/DD hh:mm:ss";
    }
    let Week = ['日','一','二','三','四','五','六'];

    str=str.replace(/yyyy|YYYY/,this.getFullYear());
    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));

    str=str.replace(/MM/,(this.getMonth()+1)>9?(this.getMonth()+1).toString():'0' + (this.getMonth()+1));
    str=str.replace(/M/g,this.getMonth());

    str=str.replace(/w|W/g,Week[this.getDay()]);

    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());
    str=str.replace(/d|D/g,this.getDate());

    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());
    str=str.replace(/h|H/g,this.getHours());
    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());
    str=str.replace(/m/g,this.getMinutes());

    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());
    str=str.replace(/s|S/g,this.getSeconds());

    return str;
};

/**
 * Add time
 * @param strInterval s:seconds, n:minutes, h:hours, d:days, w:weeks, q:quarters, m:month, y:year
 * @param Number  number of interval
 * @returns {Date}
 * @constructor
 */
Date.prototype.DateAdd = function(strInterval, Number) {
    let dtTmp = this;
    switch (strInterval) {
        case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number));
        case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number));
        case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number));
        case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number));
        case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
        case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        case 'm' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        case 'y' :return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    }
};

/**
 * Minus time
 * @param strInterval s:seconds, n:minutes, h:hours, d:days, w:weeks, q:quarters, m:month, y:year
 * @param Number  number of interval
 * @returns {Date}
 * @constructor
 */
Date.prototype.DateMinus = function(strInterval, Number) {
    let dtTmp = this;
    switch (strInterval) {
        case 's' :return new Date(Date.parse(dtTmp) - (1000 * Number));
        case 'n' :return new Date(Date.parse(dtTmp) - (60000 * Number));
        case 'h' :return new Date(Date.parse(dtTmp) - (3600000 * Number));
        case 'd' :return new Date(Date.parse(dtTmp) - (86400000 * Number));
        case 'w' :return new Date(Date.parse(dtTmp) - ((86400000 * 7) * Number));
        case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) - Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        case 'm' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) - Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        case 'y' :return new Date((dtTmp.getFullYear() - Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    }
};

/**
 * Compare differences between this date to dtEnd
 * @param strInterval
 * @param dtEnd
 * @returns {*}
 * @constructor
 */
Date.prototype.DateDiff = function(strInterval, dtEnd) {
    let dtStart = this;
    if (typeof dtEnd === 'string' )//如果是字符串转换为日期型
    {
        dtEnd = StringToDate(dtEnd);
    }
    switch (strInterval) {
        case 'x' :return parseInt(dtEnd - dtStart);
        case 's' :return parseInt((dtEnd - dtStart) / 1000);
        case 'n' :return parseInt((dtEnd - dtStart) / 60000);
        case 'h' :return parseInt((dtEnd - dtStart) / 3600000);
        case 'd' :return parseInt((dtEnd - dtStart) / 86400000);
        case 'w' :return parseInt((dtEnd - dtStart) / (86400000 * 7));
        case 'm' :return (dtEnd.getMonth()+1)+((dtEnd.getFullYear()-dtStart.getFullYear())*12) - (dtStart.getMonth()+1);
        case 'y' :return dtEnd.getFullYear() - dtStart.getFullYear();
    }
};

/**
 * Convert YYYY-MM-dd hh:mm:ss to Date object
 * @param DateStr
 * @returns {Date}
 * @constructor
 */
function StringToDate(DateStr)
{
    var converted = Date.parse(DateStr);
    return new Date(converted);
}

module.exports = {

    /**
     * Get current time in different format
     * @returns {string}
     */
    getCurrentDateTime:function(formatStr){
        var currentDate = new Date();
        return currentDate.Format(formatStr);
    },

    /**
     * Get future time by adding number of seconds to the current time.
     * @param seconds
     * @returns {*}
     */
    getFutureDateTime:function(seconds){
        var currentDate = new Date();
        return currentDate.DateAdd('s',seconds).Format(null);
    },

    /**
     * Get past time by minus number of seconds to the current time.
     * @param seconds
     * @returns {*}
     */
    getPastDateTime:function(seconds){
        var currentDate = new Date();
        return currentDate.DateMinus('s',seconds).Format(null);
    },

    StringToDate:StringToDate
};
