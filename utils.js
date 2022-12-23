//get parameters from command
var args = process.argv.slice(2);
const mapping = [
    'method',
    'address'
]
const methods = [
    'update',
    'load',
    'report'
]
module.exports = {
    args : () => {
        var _ = {}
        if(!methods.includes(args[0])) throw Error("Invalid method");
        _[mapping[0]] = args[0]
        _[mapping[1]] = args[1]
        return _
    },
    query : require("./config.json").query,
    delay: require("./config.json").delay,
    zero : '0x0000000000000000000000000000000000000000',
    parsePeriod : (period_) => {
        //period is in seconds 
        //if period is < 60 seconds, return seconds
        //if period is > 60 seconds, return minutes and seconds
        //if period is > 60 minutes, return hours, minutes and seconds
        //if period is > 24 hours, return days, hours, minutes and seconds
        const period = parseInt(period_);
        var seconds = period % 60;
        var minutes = Math.floor(period / 60) % 60;
        var hours = Math.floor(period / 3600) % 24;
        var days = Math.floor(period / 86400);
        var result = "";
        if (days > 0) result += days + "d ";
        if (hours > 0) result += hours + "h ";
        if (minutes > 0) result += minutes + "m ";
        if (seconds > 0) result += seconds + "s";
        console.log(result)
        return result;
    }



}