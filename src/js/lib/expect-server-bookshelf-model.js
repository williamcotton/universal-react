module.exports = function (outerOptions) {
  var app = outerOptions.app
  var bookshelf = outerOptions.bookshelf

  return function (options) {
    var Model = options.Model
    var tableName = Model.prototype.tableName
    var baseUrl = options.baseUrl || '/' + tableName
    var reqProp = options.reqProp || tableName
    var beforeCreate = options.beforeCreate || function (model, req, res, callback) { callback(model) }
    var beforeUpdate = options.beforeUpdate || function (model, req, res, callback) { callback(model) }
    var beforeFind = options.beforeFind || function (model, req, res, callback) { callback(model) }
    var beforeFindAll = options.beforeFindAll || function (models, req, res, callback) { callback(models) }
    var beforeTemplate = options.beforeTemplate || function (info, req, res, callback) { callback(info) }
    var findOptions = options.findOptions || function (options, req, res, callback) { callback(options, {}) }
    var findUpdateOptions = options.findUpdateOptions || function (findOptions, options, req, res, callback) { callback(findOptions, options, {}) }
    var findCreateOptions = options.findCreateOptions || function (options, req, res, callback) { callback(options) }

    var findAll = options.findAll ? options.findAll(Model) : function (req, res, callback) {
      new Model().fetchAll().then(function (models) {
        beforeFindAll(models, req, res, function (models) {
          var collection = models.toJSON()
          callback(collection)
        })
      })
    }

    var find = options.find ? options.find(Model) : function (req, res, options, callback) {
      findOptions(options, req, res, function (options, fetchOptions) {
        Model.where(options).fetch(fetchOptions).then(function (model) {
          beforeFind(model, req, res, function (model) {
            var item = model.toJSON()
            callback(item)
          })
        })
      })
    }

    var update = options.update ? options.update(Model) : function (req, res, findOptions, options, callback) {
      delete options._csrf
      findUpdateOptions(findOptions, options, req, res, function (findOptions, options, fetchOptions) {
        Model.where(findOptions).fetch(fetchOptions).then(function (model) {
          model.set(options)
          beforeUpdate(model, req, res, function (model) {
            model.save()
            var item = model.toJSON()
            callback(item)
          })
        })
      })
    }

    var create = options.create ? options.create(Model) : function (req, res, options, callback) {
      delete options._csrf
      findCreateOptions(options, req, res, function (options) {
        new Model(options).save().then(function (model) {
          beforeCreate(model, req, res, function (model) {
            var item = model.toJSON()
            callback(item)
          })
        })
      })
    }

    var template = function (req, res, callback) {
      bookshelf.knex(tableName).columnInfo().then(function (info) {
        beforeTemplate(info, req, res, function (info) {
          callback(info)
        })
      })
    }

    var userRequired = function (req, res, next) {
      if (!req.user) {
        return res.send('Login Required')
      }
      next()
    }

    app.get(baseUrl + '/template.json', userRequired, function (req, res) {
      template(req, res, function (item) {
        res.send(item)
      })
    })

    app.post(baseUrl + '/create.json', userRequired, function (req, res) {
      create(req, res, req.body, function (item) {
        res.send(item)
      })
    })

    app.get(baseUrl + '/all.json', function (req, res) {
      findAll(req, res, function (collection) {
        res.send(collection)
      })
    })

    app.get(baseUrl + '/:id.json', function (req, res) {
      find(req, res, {id: req.params.id}, function (item) {
        res.send(item)
      })
    })

    app.put(baseUrl + '/:id.json', userRequired, function (req, res) {
      update(req, res, {id: req.params.id}, req.body, function (item) {
        res.send(item)
      })
    })

    return function expectServerBookshelfModel (req, res, next) {
      res.outgoingMessage[reqProp] = res.outgoingMessage[reqProp] || {}
      res.outgoingMessage[reqProp].cachedResponses = {}
      var cachedResponses = res.outgoingMessage[reqProp].cachedResponses

      req[reqProp] = {
        findAll: function (callback) {
          findAll(req, res, function (collection) {
            collection.reqProp = reqProp
            cachedResponses.findAll = collection
            callback(collection)
          })
        },
        find: function (options, callback) {
          find(req, res, options, function (item) {
            item.reqProp = reqProp
            cachedResponses.find = cachedResponses.find || []
            cachedResponses.find.push({options: options, item: item})
            callback(item)
          })
        },
        update: function (findOptions, options, callback) {
          if (!req.user) {
            return callback(false)
          }
          update(req, res, findOptions, options, function (item) {
            item.reqProp = reqProp
            cachedResponses.find = cachedResponses.find || []
            cachedResponses.find.push({options: options, item: item})
            callback(item)
          })
        },
        create: function (options, callback) {
          if (!req.user) {
            return callback(false)
          }
          create(req, res, options, function (item) {
            item.reqProp = reqProp
            cachedResponses.find = cachedResponses.find || []
            cachedResponses.find.push({options: options, item: item})
            callback(item)
          })
        },
        template: function (callback) {
          if (!req.user) {
            return callback(false)
          }
          template(req, res, callback)
        }
      }
      next()
    }
  }
}
