var crypto = require ("crypto");
var request = require("superagent");
var jade = require("jade");
var moment = require("moment");
var config = require('./config.json');
var cancelPath = "/cancel";
var okPath = "/ok";
var rejectPath = "/reject";

exports.initialize = function (vendorId, appHandler, hostUrl, baseUrl, callback) {

  var returnUrls = {
      ok : hostUrl + baseUrl + okPath,
      cancel : hostUrl + baseUrl + cancelPath,
      reject : hostUrl + baseUrl + rejectPath
  }

  appHandler.get("/form", form(vendorId, "FI", returnUrls));
  appHandler.post(baseUrl + okPath, ok(callback));
  appHandler.post(baseUrl + cancelPath, cancel(callback));
  appHandler.post(baseUrl + rejectPath, reject(callback));
}

function form(vendorId, languageCode, returnUrls) {
   return function(req, res) {
       var now = moment().format('YYYYMMDDhhmmss');
       var bankParams = config.banks.map(function(bank) {
         var params = {
            bankAuthUrl : bank.authUrl,
            messageType : "701",
            version : bank.version,
            vendorId : vendorId,
            identifier : now + "123456",
            languageCode : languageCode,
            idType : bank.idType,
            returnLink : returnUrls.ok,
            cancelLink : returnUrls.cancel,
            rejectLink : returnUrls.reject,
            keyVersion : bank.keyVersion,
            algorithmType : "03",
            checksumKey: "xxxxxxxxxxxxxxxxx"
          }
          var mac = generateMAC(params);
          params.mac = mac;
          return params;
       });

       var html = jade.renderFile('./views/form.jade', {banks : bankParams});
       res.send(html);
    }
}

function generateMAC(p) {
    var macParams = [
        p.messageType,
        p.version,
        p.vendorId,
        p.languageCode,
        p.identifier,
        p.idType,
        p.returnLink,
        p.cancelLink,
        p.rejectLink,
        p.keyVersion,
        p.algorithmType,
        p.checksumKey]

    var joinedParams =  macParams.join("&") + "&";
    return crypto.createHash('sha256').update(joinedParams).digest('hex');
}

function ok(callback) {
  return function (req, res) {
    callback('OK', req.query)
  }
}

function cancel(callback) {
  return function (req, res) {
    callback('CANCEL', req.query)
  }
}

function reject(callback) {
  return function (req, res) {
    callback('REJECT', req.query)
  }
}
