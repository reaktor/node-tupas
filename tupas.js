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

tupas.initialize = function (appHandler, hostUrl, callback) {
  vendorOpts.appHandler = appHandler;
  vendorOpts.hostUrl = hostUrl;
  vendorOpts.callback = callback;
  vendorOpts.returnUrls = {
    ok: hostUrl + okPath,
    cancel: hostUrl + cancelPath,
    reject: hostUrl + rejectPath
  }

  initializeReturnUrls(appHandler, vendorOpts.returnUrls);
  appHandler.use(express.static(__dirname + '/public'))
}

function initializeReturnUrls (handler, returnUrls) {
  handler.post(returnUrls.ok, ok);
  handler.get(returnUrls.cancel, cancel);
  handler.get(returnUrls.reject, reject);
}

tupas.tupasForm = function (bankId, languageCode, checksumKey) {
  var html = jade.renderFile('./views/form.jade', {
    bank: tupas.paramsForBank(bankId, languageCode, checksumKey)
  });
  return html;
}

tupas.paramsForBank = function (bankId, languageCode, vendorId, checksumKey) {
  var bank = tupas.bankConfig(bankId);
  var now = moment().format('YYYYMMDDhhmmss');
  var params = {
    name : bank.name,
    id : bank.id,
    bankAuthUrl: bank.authUrl,
    messageType: "701",
    version: bank.version,
    vendorId: vendorId,
    identifier: now + "123456",
    languageCode: languageCode,
    idType: bank.idType,
    returnLink: vendorOpts.returnUrls.ok,
    cancelLink: vendorOpts.returnUrls.cancel,
    rejectLink: vendorOpts.returnUrls.reject,
    keyVersion: bank.keyVersion,
    algorithmType: "03",
    checksumKey: checksumKey,
    imgPath : bank.imgPath
  }

  var mac = tupas.generateMAC(params);
  params.mac = mac;

  return params;
}

tupas.bankConfig = function (bankId) {
  var bankConfig = _.find(banks, function (bank) {
    return bank.id == bankId;
  });
  return bankConfig;
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
