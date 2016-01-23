var test = require('tapes')
var urlparse = require('url').parse

// var methods = ['log', 'warn']

// methods.forEach(function (method) {
//   var old = console[method]
//   console[method] = function () {
//     var stack = (new Error()).stack.split(/\n/)
//     // Chrome includes a single "Error" line, FF doesn't.
//     if (stack[0].indexOf('Error') === 0) {
//       stack = stack.slice(1)
//     }
//     var args = [].slice.apply(arguments).concat([stack[1].trim()])
//     return old.apply(console, args)
//   }
// })

var universalAppSpec = require('../universal-app-spec')
var serverApp = require('../../../src/js/server/app.js')
var defaultTitle = 'Test'

// var stackTrace = require('stack-trace')

// serverApp({
//   app: {
//     use: function (middleware) {
//       // let's see what our app middleware is!
//       // console.log(middleware)
//       try {
//         middleware()
//       } catch (err) {
//         var trace = stackTrace.parse(err)
//         var middlewareLayer = trace[0]
//         var fileName = middlewareLayer.fileName
//         var dirRoot = '/Users/williamcotton/Projects/universal-react/'
//         var middlewareFile = fileName.split(dirRoot)[1]
//         console.log(middlewareFile)
//         //console.log(trace)
//         // console.log(err.stack)
//       }
//     },
//     post: function () {},
//     get: function () {}
//   }
// })

test('serverApp', function (t) {
  var nullOp = function (options, callback) {
    callback(false, true)
  }

  var emailService = {
    sendVerificationUrl: nullOp,
    sendResetPasswordUrl: nullOp
  }

  var testServerApp = require('./test-server-app')({
    serverApp: serverApp,
    defaultTitle: defaultTitle,
    emailService: emailService
  })

  require('./abstract-expect-server-app')({
    testServerApp: testServerApp,
    universalAppSpec: universalAppSpec,
    defaultTitle: defaultTitle,
    t: t
  }, function (expect, t, rq, baseRequest) {
    var uuid = 'server-user-0@test.com'
    var anotherUuid = 'server-user-1@test.com'
    var password = 'test1234'
    var newPassword = 'test1111'

    t.beforeEach(function (t) {
      t.end()
    })

    t.afterEach(function (t) {
      emailService.sendVerificationUrl = nullOp
      emailService.sendResetPasswordUrl = nullOp
      t.end()
    })

    t.test('should /signup (redirect disabled)', function (t) {
      t.plan(4)
      emailService.sendVerificationUrl = function (options, callback) {
        t.equal(options.verificationUrl.indexOf('http://localhost:12345/verify/'), 0, 'has base verificationUrl')
        t.equal(options.emailAddress, uuid, 'emailService called with uuid')
        callback(false, true)
        var url = options.verificationUrl.split('http://localhost:12345')[1]
        rq({followRedirect: false, url: url}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirects to /welcome')
        })
      }
      baseRequest({url: '/signup'}, function () {
        rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: uuid, password: password, repeatPassword: password}}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirects to /welcome')
        })
      })
    })

    t.test('should /logout (redirect disabled)', function (t) {
      baseRequest({url: '/login'}, function () {
        rq({followRedirect: false, url: '/logout'}, function ($, res) {
          t.equal(res.headers.location, '/', 'redirects to /')
          t.end()
        })
      })
    })

    t.test('should /reset-password (redirect disabled)', function (t) {
      t.plan(4)
      emailService.sendResetPasswordUrl = function (options, callback) {
        t.equal(options.resetPasswordUrl.indexOf('http://localhost:12345/reset-password/'), 0, 'has base verificationUrl')
        t.equal(options.emailAddress, uuid, 'emailService called with uuid')
        callback(false, true)
        var url = options.resetPasswordUrl.split('http://localhost:12345')[1]
        rq({followRedirect: false, url: url}, function ($, res) {
          t.equal(res.headers.location.split('?token=')[0], '/new-password', 'redirects to /new-password')
        })
      }
      baseRequest({url: '/reset-password'}, function () {
        rq({followRedirect: false, method: 'post', url: '/reset-password', form: {type: 'email', uuid: uuid}}, function ($, res) {
          t.equal(res.headers.location, '/reset-password-email-sent', 'redirects to /reset-password-email-sent')
        })
      })
    })

    t.test('should /login (redirect disabled)', function (t) {
      baseRequest({url: '/login'}, function () {
        rq({followRedirect: false, method: 'post', url: '/login', form: {type: 'email', uuid: uuid, password: 'test1234'}}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirects to /welcome')
          t.end()
        })
      })
    })

    t.test('should NOT /login with bad credentials (redirect disabled)', function (t) {
      baseRequest({url: '/login'}, function () {
        rq({followRedirect: false, method: 'post', url: '/login', form: {type: 'email', uuid: uuid, password: 'bad'}}, function ($, res) {
          t.ok($('.login-container'), 'still on login page')
          t.end()
        })
      })
    })

    t.test('should /signup.json with anotherUuid', function (t) {
      t.plan(6)
      emailService.sendVerificationUrl = function (options, callback) {
        t.equal(options.verificationUrl.indexOf('http://localhost:12345/verify/'), 0, 'has base verificationUrl')
        t.equal(options.emailAddress, anotherUuid, 'emailService called with anotherUuid')
        var url = options.verificationUrl.split('http://localhost:12345')[1]
        rq({followRedirect: false, url: url}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirects to /welcome')
        })
        callback(false, true)
      }
      baseRequest({url: '/signup'}, function () {
        rq({method: 'post', url: '/signup.json', form: {type: 'email', uuid: anotherUuid, password: password, repeatPassword: password}}, function ($, res) {
          var user = JSON.parse(res.body)
          t.ok(user.uuid, 'has uuid')
          t.equal(user.verified, false, 'is not verified')
          t.equal(user.type, 'email')
        })
      })
    })

    t.test('should /login.json with anotherUuid', function (t) {
      baseRequest({url: '/login'}, function () {
        rq({method: 'post', url: '/login.json', form: {type: 'email', uuid: anotherUuid, password: password}}, function ($, res) {
          var user = JSON.parse(res.body)
          // t.equal(user.uuid, 'steve1@test.com')
          t.equal(user.type, 'email', 'type ok')
          t.end()
        })
      })
    })

    t.test('should NOT /signup.json again with existing anotherUuid', function (t) {
      baseRequest({url: '/signup'}, function () {
        rq({method: 'post', url: '/signup.json', form: {type: 'email', uuid: anotherUuid, password: password, repeatPassword: password}}, function ($, res) {
          var user = JSON.parse(res.body)
          t.equal(user.uuid, undefined, 'no uuid')
          t.equal(user.type, undefined, 'no type')
          t.end()
        })
      })
    })

    t.test('should /logout', function (t) {
      rq({followRedirect: false, url: '/logout'}, function ($, res) {
        t.equal(res.headers.location, '/', 'did redirect to root')
        t.end()
      })
    })

    t.test('should /reset-password and get a valid token', function (t) {
      t.plan(5)
      emailService.sendResetPasswordUrl = function (options, callback) {
        t.equal(options.resetPasswordUrl.indexOf('http://localhost:12345/reset-password/'), 0, 'has base verificationUrl')
        t.equal(options.emailAddress, uuid, 'emailService called with uuid')
        callback(false, true)
        var url = options.resetPasswordUrl.split('http://localhost:12345')[1]
        var token = options.resetPasswordUrl.split('http://localhost:12345/reset-password/')[1]
        rq({followRedirect: true, url: url}, function ($, res) {
          t.equal($('input[name="uuid"]').val(), uuid, 'uuid hidden in new-password form')
          t.equal($('input[name="token"]').val(), token, 'token hidden in new-password form')
        })
      }
      baseRequest({url: '/reset-password'}, function () {
        rq({followRedirect: false, method: 'post', url: '/reset-password', form: {type: 'email', uuid: uuid}}, function ($, res) {
          t.equal(res.headers.location, '/reset-password-email-sent', 'redirects to /reset-password-email-sent')
        })
      })
    })

    t.test('should /reset-password and set a new password', function (t) {
      t.plan(2)
      emailService.sendResetPasswordUrl = function (options, callback) {
        callback(false, true)
        var url = options.resetPasswordUrl.split('http://localhost:12345')[1]
        rq({followRedirect: true, url: url}, function ($, res) {
          var action = $('form')[0].attribs.action
          var uuid = $('input[name="uuid"]').val()
          var token = $('input[name="token"]').val()
          rq({followRedirect: false, method: 'post', url: action, form: {token: token, uuid: uuid, password: newPassword, repeatPassword: newPassword}}, function ($, res) {
            var locationUrl = urlparse(res.headers.location, true)
            t.equal(locationUrl.query.uuid, uuid, 'uuid matches')
            t.equal(locationUrl.query['update-password-success'], 'true', 'update-password-success')
          })
        })
      }
      baseRequest({url: '/reset-password'}, function () {
        rq({followRedirect: false, method: 'post', url: '/reset-password', form: {type: 'email', uuid: uuid}}, function ($, res) {})
      })
    })

    expect.universalAppSpecsToPass(t)

    t.end()
  })
})
