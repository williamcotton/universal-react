module.exports = function (options, callback) {
  var async = require('async')

  var limits = options.limits

  var processFile = function (file, element, callback) {
    var multerFile = {
      fieldname: element.name,
      originalname: file.name,
      encoding: '',
      mimetype: file.type,
      filename: file.name,
      destination: '',
      path: '',
      formFile: file
    }
    var bufferReader = new window.FileReader()
    bufferReader.addEventListener('load', function (e) {
      var arr = new Uint8Array(e.target.result)
      var buffer = new Buffer(arr)
      multerFile.buffer = buffer
      callback(false, multerFile)
    })
    bufferReader.readAsArrayBuffer(file)
  }

  var findFileElement = function (form) {
    for (var i = 0; i < form.elements.length; i++) {
      if (form.elements[i].nodeName.toUpperCase() === 'INPUT' && form.elements[i].type.toUpperCase() === 'FILE') {
        return form.elements[i]
      }
    }
  }

  var singleMiddleware = function (fieldname) {
    return function (req, res, next) {
      var files = []
      if (req.event && req.event.target && req.event.target.encoding === 'multipart/form-data') {
        var form = req.event.target
        var element = findFileElement(form)
        if (element.name !== fieldname) {
          return next()
        }
        async.each(element.files, function (file, cb) {
          if (limits && limits.fileSize && file.size > limits.fileSize) {
            cb()
          }
          processFile(file, element, function (err, multerFile) {
            files.push(multerFile)
            cb()
          })
        }, function (err) {
          req.file = files[0]
          next()
        })
      } else {
        next()
      }
    }
  }

  return {
    single: singleMiddleware
  }
}
