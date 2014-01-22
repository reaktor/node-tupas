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

  initializeReturnUrls(tupas, vendorOpts);
  vendorOpts.appHandler.use(express.static(__dirname + '/public'));

  tupas.banks = _.pluck(banks, 'id');

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

function initializeReturnUrls (eventEmitter, vendorOpts) {
  var handler = vendorOpts.appHandler;
  handler.post(okPath, ok(eventEmitter));
  handler.get(cancelPath, cancel(eventEmitter));
  handler.get(rejectPath, reject(eventEmitter));
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

  var joinedParams = macParams.join("&") + "&";
  return crypto.createHash('sha256').update(joinedParams).digest('hex');
}

function ok (eventEmitter) {
  return function (req, res) {
    eventEmitter.emit('success', req.query, res);
  }
}

function cancel (eventEmitter) {
  return function (req, res) {
    eventEmitter.emit('cancel', res);
  }
}

function reject (eventEmitter) {
  return function (req, res) {
    eventEmitter.emit('reject', res);
  }
}
