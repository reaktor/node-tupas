var crypto = require("crypto")
  , request = require("superagent")
  , jade = require("jade")
  , moment = require("moment")
  , events = require('events')
  , fs = require('fs')
  , _ = require('underscore')._
  , express = require('express')
  , config = require('./config.json');

var tupasPath = "/tupas"
  , cancelPath = tupasPath + "/cancel"
  , okPath = tupasPath + "/ok"
  , rejectPath = tupasPath + "/reject";

exports.create = function (globalOpts, bankOpts) {
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

  tupas.buildRequestParams = function (bankId, languageCode) {
    return buildParamsForRequest(findConfig(bankId, banks),
      languageCode, vendorOpts.returnUrls);
  };

  tupas.tupasButton = function (bankId, languageCode) {
    return jade.renderFile('./views/form.jade', {
      bank: tupas.buildRequestParams(bankId, languageCode)
    });
  };

  return tupas;
};

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
  handler.post(okPath, ok(tupas));
  handler.get(cancelPath, cancel(tupas));
  handler.get(rejectPath, reject(tupas));
}

function buildParamsForRequest (bank, languageCode, returnUrls) {
  var now = moment().format('YYYYMMDDhhmmss');
  var params = {
    name : bank.name,
    id : bank.id,
    bankAuthUrl: bank.authUrl,
    messageType: "701",
    version: bank.version,
    vendorId: bank.vendorId,
    identifier: now + "123456",
    languageCode: languageCode,
    idType: bank.idType,
    returnLink: returnUrls.ok,
    cancelLink: returnUrls.cancel,
    rejectLink: returnUrls.reject,
    keyVersion: bank.keyVersion,
    algorithmType: "03",
    checksumKey: bank.checksumKey,
    imgPath : bank.imgPath
  };

  params.mac = generateMacForRequest (params);

  return params;
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

  var macParams = _.compact([
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
  ]);

  return generateMac(macParams);
}

function generateMac(params) {
  var joinedParams = params.join("&") + "&";
  return crypto.createHash('sha256').update(joinedParams).digest('hex');
}

function ok (tupas) {
  return function (req, res) {
    if (req.query.B02K_MAC === tupas.responseMac(req.query)) {
      tupas.emit('success', req.query, res);
    } else {
      tupas.emit('mac-check-failed', req.query, res);
    }
  }
}

function cancel (tupas) {
  return function (req, res) {
    tupas.emit('cancel', res);
  }
}

function reject (tupas) {
  return function (req, res) {
    tupas.emit('reject', res);
  }
}
