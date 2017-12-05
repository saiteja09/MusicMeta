var appSettings = require("application-settings");

function logRequest(URL, httpMethod, bodyPosted){
    var d = new Date();
    var loggedTime = d.toISOString();

    if(!appSettings.hasKey("log"))
    {

        var log = [{
            httpmethod: httpMethod,
            url: URL,
            body: bodyPosted,
            loggedtime: loggedTime
        }];

        appSettings.setString("log", JSON.stringify(log));
    } else
    {
        var log ={
            
            httpmethod: httpMethod,
            url: URL,
            body: bodyPosted,
            loggedtime: loggedTime
        };

        var currentLog = JSON.parse(appSettings.getString("log"));
        currentLog.push(log);

        appSettings.setString("log", JSON.stringify(currentLog));
        
    }

}

exports.logRequest = logRequest;