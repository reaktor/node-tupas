var crypto = require ("crypto");
var request = require("superagent");
var jade = require("jade");
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
  appHandler.get(baseUrl, bankSelection);
  appHandler.get(baseUrl + '/select/:bankId', makeTupasRequest(vendorId, "FI", returnUrls))
  appHandler.post(baseUrl + okPath, ok(callback));
  appHandler.post(baseUrl + cancelPath, cancel(callback));
  appHandler.post(baseUrl + rejectPath, reject(callback));
}

function bankSelection(req, res) {
  return res.send(bankSelectionHTML())
}

function bankSelectionHTML() {
  return "<html><body>"+
        "<div class='bank-buttons'>"+
        "<form method='post'>"+
        "<div class='bank-logo'>"+
        "</div>"+
        "<div class='bank-url'><a href='/tupas/select/1'> linkki </a>"+
        "</div>"+
        "</form>"+
        "</div>"+
        "</body></html>";
}

function form(vendorId, languageCode, returnUrls) {
   return function(req, res) {

       var bankParams = config.banks.map(function(bank) {
        return {
            bankAuthUrl : bank.authUrl,
            messageType : "701",
            version : bank.version,
            vendorId : vendorId,
            identifier : new Date().toDateString() + "12345",
            languageCode : languageCode,
            idType : bank.idType,
            returnLink : returnUrls.ok,
            cancelLink : returnUrls.cancel,
            rejectLink : returnUrls.reject,
            keyVersion : bank.keyVersion,
            algorithmType : "03",
            checksumKey: "xxxxxxxxxxxxxxxxx"

           }
       });

       var html = jade.renderFile('./views/form.jade', {banks : bankParams});
       res.send(html);

   }

}

function makeTupasRequest(vendorId, languageCode, returnUrls) {
  return function (req, res) {

      var prefix = "A01Y_";
      var params = {
          messageType : "701",
          version : "0003",
          vendorId : vendorId,
          languageCode : languageCode,
          identifier : new Date().toDateString() + "VAIHDA-GENEROITU-ID-TAHAN",
          idType : "12",
          returnLink : returnUrls.ok,
          cancelLink : returnUrls.cancel,
          rejectLink : returnUrls.reject,
          keyVersion : "001",
          algorithmType : "03",
          checksumKey: " pAwfvWTD7g9etWGNTVR5zCj5EhHt5yuHdLrxQH2BD5gZxk7xBUrfqubtYv8vZvs4"
      }

      request.post("https://tunnistepalvelu.samlink.fi/TupasTunnistus/SHBtupas.html")
          .send(prefix + "ACTION_ID = " + params.messageType)
          .send(prefix + "VERS = " + params.version)
          .send(prefix + "RCVID = " + params.vendorId)
          .send(prefix + "LANGCODE = " + params.languageCode)
          .send(prefix + "STAMP =" + params.identifier)
          .send(prefix + "IDTYPE = " + params.idType)
          .send(prefix + "RETLINK = " + params.returnLink)
          .send(prefix + "CANLINK = " + params.cancelLink)
          .send(prefix + "REJLINK = " + params.rejectLink)
          .send(prefix + "KEYVERS = " + params.keyVersion)
          //03 is value used after 1.1.2012
          .send(prefix + "ALG = " + params.algorithmType)
          .send(prefix + "MAC = " + generateMAC(params))

          .end(function(res){
              if (res.ok) {
                  console.log('yay got ' + JSON.stringify(res.body));
              } else {
                  console.log('Oh no! error ' + res.text);
              }
              res.send(200);
          });


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
