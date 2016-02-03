var _ = require("underscore");
var assert = require("assert");

var tupasCreator = require("../../tupas");

var VALID_HANDLER = {
  post: function(req, res) {},
  get: function(req, res) {}
};

function createTupas() {
  var generalOpts = {
    appHandler: VALID_HANDLER,
    hostUrl: "https://foo.bar.com"
  };

  return tupasCreator.create(generalOpts);
}

describe("create(generalOpts)", function () {

  var create = tupasCreator.create;

  it("returns valid module with valid generalOpts", function () {
    var generalOpts = {
      appHandler: VALID_HANDLER,
      hostUrl: "https://foo.bar.com"
    };

    assert.ok(_.isObject(create(generalOpts)));
  });

  it("throws if hostUrl uses http", function () {
    var generalOpts = {
      appHandler: VALID_HANDLER,
      hostUrl: "http://foo.bar.com"
    };

    assert.throws(function() {
      create(generalOpts);
    }, /https/);
  });

  it("throws if hostUrl is not a valid absolute URL with https protocol", function () {
    var generalOpts = {
      appHandler: VALID_HANDLER,
      hostUrl: "foo.bar.com"
    };

    assert.throws(function() {
      create(generalOpts);
    });
  });

  it("throws if appHandler is not a valid one", function () {
    var options = [
      {},
      {
        post: function() {},
        get: "not a function"
      },
      {
        get: function() {},
      },
    ];

    _.forEach(options, function(handler) {
      var generalOpts = {
          appHandler: handler,
          hostUrl: "https://foo.bar.com"
        };

      assert.throws(function() {
        create(generalOpts);
      }, /appHandler/);
    });
  });

});

describe("buildRequestParams(bankId, languageCode, requestId)", function () {

  var VALID_REQUEST_ID = '12345678901234567890';
  var tupas;

  beforeEach(function () {
    tupas = createTupas();
  });

  it("accepts requestId if it is 20 chars long", function () {
    assert.ok(_.isObject(tupas.buildRequestParams('nordea', 'FI', VALID_REQUEST_ID)));
  });

  it("accepts requestId if it is less than 20 chars long", function () {
    assert.ok(_.isObject(tupas.buildRequestParams('nordea', 'FI', VALID_REQUEST_ID.slice(2))));
  });

  it("throws if requestId is more than 20 chars", function () {
    assert.throws(function () {
      tupas.buildRequestParams('nordea', 'FI', VALID_REQUEST_ID + "1");
    }, /requestId/);
  });

  it("accepts all supported language codes", function () {
    _.forEach(['FI', 'SV', 'EN'], function (languageCode) {
      assert.ok(_.isObject(tupas.buildRequestParams('nordea', languageCode, VALID_REQUEST_ID)));
    });
  });

  it("throws if languageCode is not supported", function () {
    assert.throws(function () {
      tupas.buildRequestParams('nordea', 'FOO', VALID_REQUEST_ID);
    }, /language code/);
  });

  it("throws if bankId is not supported", function () {
    assert.throws(function () {
      tupas.buildRequestParams('fooBank', 'FI', VALID_REQUEST_ID);
    }, /bank/);
  });

});
