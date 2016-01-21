var React = require('react')

module.exports = function (options) {
  var app = options.app
  var bookshelf = options.bookshelf
  var Model = options.Model
  var tableName = Model.prototype.tableName
  var baseUrl = options.baseUrl || '/' + tableName
  var reqProp = options.reqProp || tableName
  var beforeUpdate = options.beforeUpdate || function (model, callback) { callback(model) }
  var beforeFind = options.beforeFind || function (model, callback) { callback(model) }

  var findAll = function (callback) {
    Model.fetchAll().then(function (models) {
      var collection = models.toJSON()
      callback(collection)
    }).catch(function (err) {
      console.error(err)
    })
  }
  var find = function (options, callback) {
    Model.where(options).fetch().then(function (model) {
      beforeFind(model, function (model) {
        var item = model.toJSON()
        callback(item)
      })
    })
  }
  var update = function (findOptions, options, callback) {
    delete options._csrf
    Model.where(findOptions).fetch().then(function (model) {
      model.set(options)
      beforeUpdate(model, function (model) {
        model.save()
        var item = model.toJSON()
        callback(item)
      })
    })
  }
  var create = function (options, callback) {
    delete options._csrf
    new Model(options).save().then(function (model) {
      var item = model.toJSON()
      callback(item)
    })
  }
  var template = function (callback) {
    bookshelf.knex(tableName).columnInfo().then(function (info) {
      callback(info)
    })
  }

  var userRequired = function (req, res, next) {
    if (!req.user) {
      var content = React.createElement('h2', null, 'Login Require')
      return res.renderApp(content, {title: 'Login Required'})
    }
    next()
  }
  app.get(baseUrl + '/template.json', userRequired, function (req, res) {
    template(function (item) {
      res.send(item)
    })
  })
  app.post(baseUrl + '/create.json', userRequired, function (req, res) {
    create(req.body, function (item) {
      res.send(item)
    })
  })
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
  app.put(baseUrl + '/:id.json', userRequired, function (req, res) {
    update({id: req.params.id}, req.body, function (item) {
      res.send(item)
    })
  })

  return function expectServerBookshelfModel (req, res, next) {
    res.outgoingMessage[reqProp] = res.outgoingMessage[reqProp] || {}
    res.outgoingMessage[reqProp].cachedResponses = {}
    var cachedResponses = res.outgoingMessage[reqProp].cachedResponses
    req[reqProp] = {
      findAll: function (callback) {
        findAll(function (collection) {
          cachedResponses.findAll = collection
          callback(collection)
        })
      },
      find: function (options, callback) {
        find(options, function (item) {
          cachedResponses.find = cachedResponses.find || []
          cachedResponses.find.push({options: options, item: item})
          callback(item)
        })
      },
      update: function (findOptions, options, callback) {
        if (!req.user) {
          return callback(false)
        }
        update(findOptions, options, function (item) {
          cachedResponses.find = cachedResponses.find || []
          cachedResponses.find.push({options: options, item: item})
          callback(item)
        })
      },
      create: function (options, callback) {
        if (!req.user) {
          return callback(false)
        }
        create(options, function (item) {
          cachedResponses.find = cachedResponses.find || []
          cachedResponses.find.push({options: options, item: item})
          callback(item)
        })
      },
      template: function (callback) {
        if (!req.user) {
          return callback(false)
        }
        template(callback)
      }
    }
    next()
  }
}
