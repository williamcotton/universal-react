module.exports = function (options) {
  var app = options.app
  var model = options.model
  var tableName = model.prototype.tableName
  var baseUrl = options.baseUrl || '/' + tableName
  var reqProp = options.reqProp || tableName
  var beforeUpdate = options.beforeUpdate || function (model, callback) { callback(model) }
  var beforeFind = options.beforeFind || function (model, callback) { callback(model) }
  var findAll = function (callback) {
    model.fetchAll().then(function (models) {
      var collection = models.toJSON()
      callback(collection)
    }).catch(function (err) {
      console.error(err)
    })
  }
  var find = function (options, callback) {
    model.where(options).fetch().then(function (model) {
      beforeFind(model, function (model) {
        var item = model.toJSON()
        callback(item)
      })
    })
  }
  var update = function (findOptions, options, callback) {
    delete options._csrf
    model.where(findOptions).fetch().then(function (model) {
      model.set(options)
      beforeUpdate(model, function (model) {
        model.save()
        var item = model.toJSON()
        callback(item)
      })
    })
  }
  app.get(baseUrl + '/all.json', function (req, res) {
    findAll(function (collection) {
      res.send(collection)
    })
  })
  app.get(baseUrl + '/:id.json', function (req, res) {
    find({id: req.params.id}, function (item) {
      res.send(item)
    })
  })
  app.put(baseUrl + '/:id.json', function (req, res) {
    update({id: req.params.id}, req.body, function (item) {
      res.send(item)
    })
  })
  return function (req, res, next) {
    res.outgoingMessage[reqProp] = res.outgoingMessage[reqProp] || {}
    res.outgoingMessage[reqProp].cachedResponses = {}
    req[reqProp] = {
      findAll: function (callback) {
        findAll(function (collection) {
          res.outgoingMessage[reqProp].cachedResponses.findAll = collection
          callback(collection)
        })
      },
      find: function (options, callback) {
        find(options, function (item) {
          res.outgoingMessage[reqProp].cachedResponses.find = res.outgoingMessage[reqProp].cachedResponses.find || []
          res.outgoingMessage[reqProp].cachedResponses.find.push({options: options, item: item})
          callback(item)
        })
      },
      update: function (findOptions, options, callback) {
        if (!req.user) {
          return callback(false)
        }
        update(findOptions, options, function (item) {
          res.outgoingMessage[reqProp].cachedResponses.find = res.outgoingMessage[reqProp].cachedResponses.find || []
          res.outgoingMessage[reqProp].cachedResponses.find.push({options: options, item: item})
          callback(item)
        })
      }
    }
    next()
  }
}
