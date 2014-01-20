var crypto = require ("crypto");
var request = require("superagent");
var cancelPath = "/cancel";
var okPath = "/ok";
var rejectPath = "/reject";

exports.initialize = function (vendorId, appHandler, hostUrl, baseUrl, callback) {

  var returnUrls = {
      ok : hostUrl + baseUrl + okPath,
      cancel : hostUrl + baseUrl + cancelPath,
      reject : hostUrl + baseUrl + rejectPath
  }

  appHandler.get(baseUrl, bankSelection);
  appHandler.post(baseUrl + '/select/:bankId', makeTupasRequest(vendorId, "FI", returnUrls))
  appHandler.post(baseUrl + okPath, ok(callback));
  appHandler.post(baseUrl + cancelPath, cancel(callback));
  appHandler.post(baseUrl + rejectPath, reject(callback));
}

function bankSelection(req, res) {
  res.send(bankSelectionHTML())
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

function makeTupasRequest(vendorId, languageCode, returnUrls) {
  return function (req, res) {

      var prefix = "A01Y_";
      var params = {
          messageType : "701",
          version : "000",
          vendorId : vendorId,
          languageCode : languageCode,
          identifier : new Date().toDateString() + "VAIHDA-GENEROITU-ID-TAHAN",
          idType : "12",
          returnLink : returnUrls.ok,
          cancelLink : returnUrls.cancel,
          rejectLink : returnUrls.reject,
          keyVersion : "001",
          algorithmType : "03",
          checksumKey: "xxxxxxxxxxxxxxx"
      }

      request.post('/user')
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
