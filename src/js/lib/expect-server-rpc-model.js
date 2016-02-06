module.exports = function (outerOptions) {
  var app = outerOptions.app
  return function (options) {
    var model = options.model
    var reqProp = options.reqProp
    var baseUrl = options.baseUrl || '/' + reqProp
    var remoteProcedures = []
    for (var prop in options) {
      if (prop !== 'model' && prop !== 'reqProp' && prop !== 'baseUrl') {
        remoteProcedures.push({name: prop, func: options[prop](model)})
      }
    }
    remoteProcedures.forEach(function (proc) {
      var name = proc.name
      app.post(baseUrl + '/' + name + '.json', function (req, res) {
        proc.func(req, res, req.body, function (err, obj) {
          if (err) {
            return res.status(500).send(err)
          }
          res.status(200).send(obj)
        })
      })
    })
    return function expectServerRpcModel (req, res, next) {
      res.outgoingMessage.rpcModels = res.outgoingMessage.rpcModels || {}
      res.outgoingMessage.rpcModels[reqProp] = res.outgoingMessage.rpcModels[reqProp] || {}
      var rpcModel = res.outgoingMessage.rpcModels[reqProp]
      // rpcModel.cachedResponses = {}
      rpcModel.methods = []
      rpcModel.baseUrl = baseUrl
      req[reqProp] = {}
      remoteProcedures.forEach(function (proc) {
        var name = proc.name
        rpcModel.methods.push(name)
        // req[reqProp][name] = function (options, callback) {
        //   // options.cachedResponses = rpcModel.cachedResponses
        //   proc.func(req, res, options, function (err, obj) {
        //     // TODO: fix cachedResponses to handle different options
        //     // rpcModel.cachedResponses[name] = obj
        //     callback(err, obj)
        //   })
        // }
        req[reqProp][name] = function (_options) {
          var options = _options || {}
          return new Promise(function (resolve, reject) {
            try {
              proc.func(req, res, options, function (err, obj) {
                if (err) return reject(err)
                // TODO: fix cachedResponses to handle different options
                // rpcModel.cachedResponses[name] = obj
                resolve(obj)
              })
            } catch (err) {
              reject(err)
            }
          })
        }
      })
      next()
    }
  }
}
