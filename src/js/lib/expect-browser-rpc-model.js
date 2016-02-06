/*

  http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.41.7628

  there are issues with RPC...

  one of the big annoyances is that changing the interfaces requires changes to the client...
  but in the case of an expect app, the browser and server are part of the same application
    so changes to the API will always reflect both sides of the RPC

  Also, what Waldo was worried about with 'papering over the differences' don't really apply to the
  async nature of these universal app handlers... again, both the browser and the server are exposed
  to the same request handlers, so they're both subjected to the same differences

  Waldo was talking about RPCs in an OOP setting, whereas expect has more functional paradigms...

  expect is NOT an object-oriented paradigm, ORMs, and REST, although it can very easily work in that paradigm
  expect can work just fine with functional paradigms, RPCs, and async events

*/

module.exports = function (outerOptions) {
  var request = outerOptions.request
  return function (req, res, next) {
    var models = req.rpcModels
    for (var reqProp in models) {
      var model = models[reqProp]
      var baseUrl = model.baseUrl
      var methods = model.methods
      // var cachedResponses = model.cachedResponses
      req[reqProp] = {}
      methods.forEach(function (method) {
        // req[reqProp][method] = function (options, callback) {
        //   // TODO: fix cachedResponses to handle different options
        //   // if (cachedResponses[method]) {
        //   //   callback(false, cachedResponses[method])
        //   // } else {
        //   for (var param in options) {
        //     var opt = options[param]
        //     if (opt.buffer && opt.formFile) {
        //       options[opt.fieldname] = opt.formFile
        //       delete options[param]
        //     }
        //   }
        //   // TODO: This is a real quick fix, make this WAAAAY more robust in the future!
        //   // the problem seems to be with my understanding of how to do multipart/form-data with the browser-request module
        //   // the big picture is that we need a more robust way to handle these RPC calls!
        //   // don't use POST for everything ?
        //   if (req.event && req.event.target && req.event.target.action) {
        //     var formElement = req.event.target
        //     var xhr = new XMLHttpRequest()
        //     xhr.open('POST', baseUrl + '/' + method + '.json')
        //     xhr.setRequestHeader('x-csrf-token', req.csrf)
        //     xhr.onload = function (e) {
        //       if (xhr.status >= 500) {
        //         callback(JSON.parse(xhr.response), false)
        //       } else {
        //         callback(false, JSON.parse(xhr.response))
        //       }
        //     }
        //     xhr.send(new FormData(formElement))
        //   } else {
        //     request({headers: {'x-csrf-token': req.csrf}, method: 'POST', url: baseUrl + '/' + method + '.json', json: options}, function (err, _res, body) {
        //       // TODO: fix cachedResponses to handle different options
        //       // cachedResponses[method] = body
        //       callback(err, body)
        //     })
        //   }
        //   // }
        // }
        req[reqProp][method] = function (_options) {
          var options = _options || {}
          return new Promise(function (resolve, reject) {
            try {
              // TODO: fix cachedResponses to handle different options
              // if (cachedResponses[method]) {
              //   callback(false, cachedResponses[method])
              // } else {
              for (var param in options) {
                var opt = options[param]
                if (opt.buffer && opt.formFile) {
                  options[opt.fieldname] = opt.formFile
                  delete options[param]
                }
              }
              // TODO: This is a real quick fix, make this WAAAAY more robust in the future!
              // the problem seems to be with my understanding of how to do multipart/form-data with the browser-request module
              // the big picture is that we need a more robust way to handle these RPC calls!
              // don't use POST for everything ?
              if (req.event && req.event.target && req.event.target.action) {
                var formElement = req.event.target
                var xhr = new XMLHttpRequest()
                xhr.open('POST', baseUrl + '/' + method + '.json')
                xhr.setRequestHeader('x-csrf-token', req.csrf)
                xhr.onload = function (e) {
                  if (xhr.status >= 500) {
                    reject(JSON.parse(xhr.response))
                  } else {
                    resolve(JSON.parse(xhr.response))
                  }
                }
                res.onUploadProgress ? xhr.upload.addEventListener('progress', res.onUploadProgress) : null
                res.onUploadLoad ? xhr.upload.addEventListener('load', res.onUploadLoad) : null
                res.onUploadError ? xhr.upload.addEventListener('error', res.onUploadError) : null
                res.onUploadAbort ? xhr.upload.addEventListener('abort', res.onUploadAbort) : null
                res.onProgress ? xhr.addEventListener('progress', res.onProgress) : null
                res.onLoad ? xhr.addEventListener('load', res.onLoad) : null
                res.onError ? xhr.addEventListener('error', res.onError) : null
                res.onAbort ? xhr.addEventListener('abort', res.onAbort) : null
                xhr.send(new FormData(formElement))
              } else {
                request({headers: {'x-csrf-token': req.csrf}, method: 'POST', url: baseUrl + '/' + method + '.json', json: options}, function (err, _res, body) {
                  if (err || _res.statusCode >= 500) return reject(err)
                  // TODO: fix cachedResponses to handle different options
                  // cachedResponses[method] = body
                  resolve(body)
                })
              }
              // } // END OF if (cachedResponses[method])
            } catch (err) {
              reject(err)
            }
          })
        }
      })
    }
    next()
  }
}
