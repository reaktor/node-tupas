var crypto = require("crypto")
  , events = require('events')
  , _ = require('underscore')._
  , express = require('express')
  , config = require('./config.json');

var tupasPath = "/tupas"
  , cancelPath = tupasPath + "/cancel"
  , okPath = tupasPath + "/ok"
  , rejectPath = tupasPath + "/reject";

var SHA256 = "03"
  , TUPAS_MESSAGE_TYPE = "701"
  , LANG_CODES = ['FI', 'SV', 'EN'];

var tupasFormTemplate = _.template(
                         '<form id="<%= id %>-form" method="POST" action="<%= bankAuthUrl %>" class="tupas-button">'+
                         '<div id="<%= id %>-login" style="cursor: pointer">' +
                         '<div class="bank-login-image"><img src="<%= imgPath %>" alt="<%= name %>"></div>' +
                         '<div class="bank-login-name"><a href="#"><%= name %></a></div>' +
                         '</div>' +
                         '<input name="A01Y_ACTION_ID" type="hidden" value="<%= messageType %>">' +
                         '<input name="A01Y_VERS" type="hidden" value="<%= version %>">' +
                         '<input name="A01Y_RCVID" type="hidden" value="<%= vendorId %>">' +
                         '<input name="A01Y_LANGCODE" type="hidden" value="<%= languageCode %>">' +
                         '<input name="A01Y_STAMP" type="hidden" value="<%= identifier %>">' +
                         '<input name="A01Y_IDTYPE" type="hidden" value="<%= idType %>">' +
                         '<input name="A01Y_RETLINK" type="hidden" value="<%= returnLink %>">' +
                         '<input name="A01Y_CANLINK" type="hidden" value="<%= cancelLink %>">' +
                         '<input name="A01Y_REJLINK" type="hidden" value="<%= rejectLink %>">' +
                         '<input name="A01Y_KEYVERS" type="hidden" value="<%= keyVersion %>">' +
                         '<input name="A01Y_ALG" type="hidden" value="<%= algorithmType %>">' +
                         '<input name="A01Y_MAC" type="hidden" value="<%= mac %>">' +
                         '<script>' +
                         'var bankLogin = document.getElementById("<%= id %>-login");' +
                         'var clickHandler = function() {' +
                            'document.getElementById("<%= id %>-form").submit();' +
                          '};' +
                         'if(bankLogin.addEventListener) {' +
                           'bankLogin.addEventListener("click", clickHandler, false);' +
                          '}'+
                         'else if (bankLogin.attachEvent) {' +
                           'bankLogin.attachEvent("onclick", clickHandler);' +
                         '}' +
                         '</script>' +
                         '</form>');

exports.create = function (globalOpts, bankOpts) {
  requireArgument(globalOpts.appHandler, "globalOpts.appHandler");
  requireArgument(globalOpts.hostUrl, "globalOpts.hostUrl");

  var tupas = Object.create(events.EventEmitter.prototype);
  var banks = updatedBankConfigsWith(bankOpts);
  var vendorOpts = _.extend({}, globalOpts,
    { returnUrls : returnUrls(globalOpts.hostUrl) });

  bindReturnUrlsToHandler(tupas, vendorOpts.appHandler);
  vendorOpts.appHandler.use(express.static(__dirname + '/public'));

  tupas.banks = _.pluck(banks, 'id');
  tupas.requestMac = generateMacForRequest;
  tupas.responseMac = function (params) {
    return generateMacForResponse(params, banks)
  };

  tupas.buildRequestParams = function (bankId, languageCode, requestId) {
    return buildParamsForRequest(findConfig(bankId, banks),
      languageCode, vendorOpts.returnUrls, requestId);
  };

  tupas.tupasButton = function (bankId, languageCode, requestId) {
    var formParams = tupas.buildRequestParams(bankId, languageCode, requestId);
    return tupasFormTemplate(formParams);
  };

  return tupas;
};

function requireArgument(argValue, argName) {
  if (typeof argValue === "undefined" || argValue === null) {
    throw "Missing required argument " + argName + ".";
  }
}

function returnUrls (hostUrl) {
  return {
    ok: hostUrl + okPath,
    cancel: hostUrl + cancelPath,
    reject: hostUrl + rejectPath
  };
}

function updatedBankConfigsWith (bankOpts) {
  var updatedDefaults = mergeWithDefaults(bankOpts);
  var defaultBankIds = _.pluck(updatedDefaults, 'id');
  var newBanks = _.reject(bankOpts, function (bank) {
    return _.contains(defaultBankIds, bank.id)
  });

  return updatedDefaults.concat(newBanks);
}

function mergeWithDefaults (bankOpts) {
  return _.map(config.banks, function (bank) {
    var vendorOpts = _.find(bankOpts, function (bankConf) {
      return bankConf.id == bank.id;
    });

    if (vendorOpts) {
      return _.extend({}, bank, vendorOpts)
    } else {
      return bank
    }
  });
}

function bindReturnUrlsToHandler (tupas, handler) {
  handler.post(okPath, ok(tupas)); // Danske Bank uses POST.
  handler.post(cancelPath, cancel(tupas));
  handler.post(rejectPath, reject(tupas));
  handler.get(okPath, ok(tupas));  // Others use GET.
  handler.get(cancelPath, cancel(tupas));
  handler.get(rejectPath, reject(tupas));
}

function buildParamsForRequest (bank, languageCode, returnUrls, requestId) {
  if (invalidLangCode(languageCode))
    throw "Unsupported language code: " + languageCode + ".";
  if (requestId.length > 20)
    throw "Request id too long: " + requestId + ".";

  var params = {
    name : bank.name,
    id : bank.id,
    bankAuthUrl: bank.authUrl,
    messageType: TUPAS_MESSAGE_TYPE,
    version: bank.version,
    vendorId: bank.vendorId,
    identifier: requestId,
    languageCode: languageCode,
    idType: bank.idType,
    returnLink: returnUrls.ok,
    cancelLink: returnUrls.cancel,
    rejectLink: returnUrls.reject,
    keyVersion: bank.keyVersion,
    algorithmType: SHA256,
    checksumKey: bank.checksumKey,
    imgPath : bank.imgPath
  };

  params.mac = generateMacForRequest (params);

  return params;
}

function invalidLangCode(langCode) {
  return !_.contains(LANG_CODES, langCode);
}

function findConfig (bankId, bankConfig) {
  return _.find(bankConfig, function (bank) {
    return bank.id == bankId;
  });
}

function generateMacForRequest (requestParams) {
  var macParams = [
    requestParams.messageType,
    requestParams.version,
    requestParams.vendorId,
    requestParams.languageCode,
    requestParams.identifier,
    requestParams.idType,
    requestParams.returnLink,
    requestParams.cancelLink,
    requestParams.rejectLink,
    requestParams.keyVersion,
    requestParams.algorithmType,
    requestParams.checksumKey
  ];

  return generateMac(macParams);
}

function generateMacForResponse (queryParams, bankConfig) {
  var bankNumber = queryParams.B02K_TIMESTMP.substr(0, 3);
  var bank = _.find(bankConfig, function (bank) {
    return bank.number == bankNumber;
  });

  var macParams = _.map(_.compact([
    queryParams.B02K_VERS,
    queryParams.B02K_TIMESTMP,
    queryParams.B02K_IDNBR,
    queryParams.B02K_STAMP,
    queryParams.B02K_CUSTNAME,
    queryParams.B02K_KEYVERS,
    queryParams.B02K_ALG,
    queryParams.B02K_CUSTID,
    queryParams.B02K_CUSTTYPE,
    queryParams.B02K_USERID,
    queryParams.B02K_USERNAME,
    bank.checksumKey
  ]), function (val) {
    return unescape(val).replace(/\+/g, ' ');
  });

  return generateMac(macParams);
}

function generateMac(params) {
  var joinedParams = params.join("&") + "&";
  return crypto.createHash('sha256').update(joinedParams).digest('hex').toUpperCase();
}

function ok (tupas) {
  return function (req, res) {
    if (req.query.B02K_MAC && req.query.B02K_MAC.toUpperCase() === tupas.responseMac(req.query)) {
      tupas.emit('success', req, res);
    } else {
      tupas.emit('mac-check-failed', req, res);
    }
  }
}

function cancel (tupas) {
  return function (req, res) {
    tupas.emit('cancel', req, res);
  }
}

function reject (tupas) {
  return function (req, res) {
    tupas.emit('reject', req, res);
  }
}
