exports.initialize = function (vendorId, appHandler, baseUrl, callback) {
  appHandler.get(baseUrl, bankSelection);
  appHandler.post(baseUrl+'/select/:bankId', makeTupasRequest(vendorId))
  appHandler.post(baseUrl+'/ok', ok(callback));
  appHandler.post(baseUrl+'/cancel', cancel(callback));
  appHandler.post(baseUrl+'/fail', fail(callback));
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
        "<div class='bank-url'>"+
        "</div>"+
        "</form>"+
        "</div>"+
        "</body></html>";
}

function makeTupasRequest(vendorId) {
  return function (req, res) {
  }
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

function fail(callback) {
  return function (req, res) {
    callback('FAILED', req.query)
  }
}
