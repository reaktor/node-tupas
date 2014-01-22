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

var tupas = Object.create(events.EventEmitter.prototype),
    vendorOpts = {},
    banks = config.banks;

tupas.initialize = function (globalOpts, bankOpts) {
  vendorOpts = globalOpts;
  banks = updatedBankConfigsWith(bankOpts);
  console.log(banks);

  vendorOpts.returnUrls = {
    ok: vendorOpts.hostUrl + okPath,
    cancel: vendorOpts.hostUrl + cancelPath,
    reject: vendorOpts.hostUrl + rejectPath
  };

  initializeReturnUrls(vendorOpts.appHandler, vendorOpts.returnUrls);
  vendorOpts.appHandler.use(express.static(__dirname + '/public'))
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

function initializeReturnUrls (handler, returnUrls) {
  handler.post(returnUrls.ok, ok);
  handler.get(returnUrls.cancel, cancel);
  handler.get(returnUrls.reject, reject);
}

tupas.tupasForm = function (bankId, languageCode) {
  return jade.renderFile('./views/form.jade', {
    bank: tupas.paramsForBank(bankId, languageCode)
  });
}

tupas.paramsForBank = function (bankId, languageCode) {
  var bank = tupas.bankConfig(bankId);
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
    returnLink: vendorOpts.returnUrls.ok,
    cancelLink: vendorOpts.returnUrls.cancel,
    rejectLink: vendorOpts.returnUrls.reject,
    keyVersion: bank.keyVersion,
    algorithmType: "03",
    checksumKey: bank.checksumKey,
    imgPath : bank.imgPath
  };

  params.mac = tupas.generateMAC(params);

  return params;
}

tupas.bankConfig = function (bankId) {
  return _.find(banks, function (bank) {
    return bank.id == bankId;
  });
}

tupas.generateMAC = function (p) {
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

  var joinedParams = macParams.join("&") + "&";
  return crypto.createHash('sha256').update(joinedParams).digest('hex');
}

function ok(req, res) {
  vendorOpts.callback('OK', req.query)
}

function cancel(req, res) {
  vendorOpts.callback('CANCEL', req.query)
}

function reject(req, res) {
  vendorOpts.callback('REJECT', req.query)
}

module.exports = tupas
