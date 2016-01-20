module.exports = function (options) {
  var request = options.request
  var tableName = options.tableName
  var baseUrl = options.baseUrl || '/' + tableName
  var reqProp = options.reqProp || tableName
  return function (req, res, next) {
    req[reqProp] = req[reqProp] || {}
    var findAll = function (callback) {
      if (req[reqProp].cachedResponses.findAll) {
        callback(req[reqProp].cachedResponses.findAll)
      } else {
        request({url: baseUrl + '/all.json', json: true}, function (err, _res, body) {
          req[reqProp].cachedResponses.findAll = body
          callback(body)
        })
      }
    }
    var find = function (options, callback) {
      if (req[reqProp].cachedResponses.find && req[reqProp].cachedResponses.find.length) {
        var findCache
        req[reqProp].cachedResponses.find.forEach(function (f) {
          if (JSON.stringify(options) === JSON.stringify(f.options)) {
            findCache = f.item
          }
        })
        callback(findCache)
      } else {
        request({url: baseUrl + '/' + options.id + '.json', json: true}, function (err, _res, body) {
          req[reqProp].cachedResponses.find = req[reqProp].cachedResponses.find || []
          var item = body
          req[reqProp].cachedResponses.find.push({options: options, item: item})
          callback(item)
        })
      }
    }
    var update = function (findOptions, options, callback) {
      request({url: baseUrl + '/' + findOptions.id + '.json', json: options, method: 'put', headers: {'x-csrf-token': req.csrf}}, function (err, _res, body) {
        req[reqProp].cachedResponses.find = req[reqProp].cachedResponses.find || []
        var item = body
        console.log('updating cache with item', item)
        req[reqProp].cachedResponses.find.push({options: findOptions, item: item})
        callback(item)
      })
    }
    req[reqProp].findAll = findAll
    req[reqProp].find = find
    req[reqProp].update = update
    next()
  }
}
