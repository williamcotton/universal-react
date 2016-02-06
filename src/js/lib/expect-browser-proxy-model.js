module.exports = function (outerOptions) {
  var request = outerOptions.request

  return function (options) {
    var reqProp = options.reqProp
    var baseUrl = options.baseUrl || '/' + reqProp

    return function (req, res, next) {
      req[reqProp] = req[reqProp] || {}
      var cachedResponses = req[reqProp].cachedResponses

      var findAll = function (callback) {
        if (req[reqProp].cachedResponses.findAll) {
          callback(cachedResponses.findAll)
        } else {
          request({url: baseUrl + '/all.json', json: true}, function (err, _res, body) {
            var collection = body
            collection.reqProp = reqProp
            cachedResponses.findAll = collection
            callback(collection)
          })
        }
      }

      var find = function (options, callback) {
        if (cachedResponses.find && cachedResponses.find.length) {
          var findCache
          cachedResponses.find.forEach(function (f) {
            if (JSON.stringify(options) === JSON.stringify(f.options)) {
              findCache = f.item
            }
          })
          if (findCache) {
            return callback(findCache)
          }
        }
        request({url: baseUrl + '/' + options.id + '.json', json: true}, function (err, _res, body) {
          cachedResponses.find = cachedResponses.find || []
          var item = body
          item.reqProp = reqProp
          cachedResponses.find.push({options: options, item: item})
          callback(item)
        })
      }

      var update = function (findOptions, options, callback) {
        request({url: baseUrl + '/' + findOptions.id + '.json', json: options, method: 'put', headers: {'x-csrf-token': req.csrf}}, function (err, _res, body) {
          cachedResponses.find = cachedResponses.find || []
          var item = body
          item.reqProp = reqProp
          if (cachedResponses.findAll) {
            cachedResponses.findAll.forEach(function (_item) {
              if (_item.id === item.id) {
                cachedResponses.findAll.splice(cachedResponses.findAll.indexOf(_item), 1)
                cachedResponses.findAll.push(item)
              }
            })
          }
          cachedResponses.find.push({options: findOptions, item: item})
          callback(item)
        })
      }

      var create = function (options, callback) {
        request({url: baseUrl + '/create.json', json: options, method: 'post', headers: {'x-csrf-token': req.csrf}}, function (err, _res, body) {
          cachedResponses.find = cachedResponses.find || []
          var item = body
          item.reqProp = reqProp
          cachedResponses.find.push({options: {id: item.id}, item: item})
          callback(item)
        })
      }

      var template = function (callback) {
        request({url: baseUrl + '/template.json', json: options, method: 'get', headers: {'x-csrf-token': req.csrf}}, function (err, _res, body) {
          var item = body
          item.reqProp = reqProp
          callback(item)
        })
      }

      req[reqProp].findAll = findAll
      req[reqProp].find = find
      req[reqProp].update = update
      req[reqProp].create = create
      req[reqProp].template = template

      next()
    }
  }
}
