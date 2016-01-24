# Node-tupas
[![Build Status](https://travis-ci.org/reaktor/node-tupas.png?branch=master)](https://travis-ci.org/reaktor/node-tupas)

Configurable Node.js module for TUPAS identification. Includes test
configurations for Nordea, DanskeBank, Handelsbanken, OP,
Aktia, Ålandsbanken, S-Pankki, Säästöpankki and POP Pankki.

## About

![Reaktor](public/images/logo_reaktor.png "Reaktor")

Made at [Reaktor](http://reaktor.com).

Apply for juicy positions at [reaktor.fi/careers](http://reaktor.com/careers).

## Install

```
npm install tupas
```

## Testing

Run tests with grunt.

## Usage and configuration

### Basic usage (using default configurations)

```javascript
var generalOptions = {
  appHandler: app, // an Express-like application
  hostUrl: 'http://domain.here.com:port[/path]', // required for return URLs, and binding to optional /path
};

var tupas = require('tupas').create(generalOptions);
```

`appHandler` must be an Express-like application object. For the purposes of this package,
it is enough for it to have `post(path, handler)` and `get(path, handler)` functions.
Each `handler` function will be called with `request` and `response` objects. The only property used from
these is `request.query`, which should match the [implementation of Express](http://expressjs.com/en/api.html#req.query)
(contain request query parameters as an object).

The `request` and `response` objects will be given back to the client application's event
handlers intact (see below).

An imaginary customized `appHandler` implementation:

```javascript
var appHandler = {
    post: function(path, handler) {
        myServer.registerHandler('POST', path, function(request, reply) {
            // Parsing query params our own way. It's highly likely that,
            // if using a popular framework, you're given this automatically.
            var queryParams = myServer.parseQueryParams(request);

            handler({ query: queryParams }, reply);
        });
    },
    get: function(path, handler) {
        myServer.registerHandler('GET', path, handler);
    }
}
```

### Change configurations for existing banks or add new ones

```javascript
var bankOptions = [
  {
    id : 'nordea',
    imgPath : '/path/to/my/image.png',
    vendorId : 'production id',
    checksumKey : 'production key'
  },
  {
    id : 'my-new-bank',
    authUrl : "https://my.banks.url.com/tupas",
    version : "0002",
    keyVersion : "0001",
    idType : "01",
    imgPath : "/path/to/my/image.png",
    number : "420",
    vendorId : "xxxxxxx",
    checksumKey : "xxxxxxx"
  }
];

var tupas = require('tupas').create(generalOptions, bankOptions);
```

***Options for banks:***

- `id` - identifier for the bank (always use when configuring, see `config.json` for built-in options)
- `authUrl` - url for the tupas authentication service
- `version` - A01Y_VERS
- `keyVersion` - A01Y_KEYVERS
- `idType` - A01Y_IDTYPE
- `imgPath` - path for the image used for the HTML form
- `number` - bank number (e.g. 800 for DanskeBank)
- `vendorId` - A01Y_RCVID
- `checksumKey` - vendor specific key used in computing the MAC

### Create TUPAS authentication "buttons" for configured banks

```javascript
var requestId = "12345678987654321234"; // used as A01Y_STAMP
var buttonHtml = tupas.tupasButton('nordea', 'FI', requestId);
```

...or if you just want the request parameters without generating any HTML:

```javascript
var params = tupas.buildRequestParams('nordea', 'FI', requestId);
```

### Get a listing of all configured banks (IDs)

```javascript
var banks = tupas.banks
// => ['danskebank', 'handelsbanken', 'nordea',
//     'op', 'aktia', 'alandsbanken', 'spankki',
//     'saastopankki', 'poppankki', 'my-new-bank']
```

### Response handling

The module binds paths `/tupas/ok` (GET and POST), `/tupas/cancel` (only GET)
and `/tupas/reject` (only GET) to the given application handler for use as return urls.

Response handling is event based.
```javascript
tupas.on('success', function (request, response) {
  // Successful tupas authentication. Get auth data from request.query.
});

tupas.on('mac-check-failed', function (request, response) {
  // Successful tupas authentication but the message was faulty.
});

tupas.on('cancel', function (request, response) {
  // User cancelled authentication.
});

tupas.on('reject', function (request, response) {
  // Authentication attempt was rejected by the bank.
});
```

### Sample applications

Examples of host applications are provided:

- See `sample/express/app.js` for a simple usage example with [Express](http://expressjs.com). Run the
sample app locally with `node sample/express/start-sample.js`.
- See `sample/hapi/tupas-plugin.js` for a simple usage example with [Hapi](http://hapijs.com). Run the sample app
locally with `node sample/hapi/start-sample.js`.
