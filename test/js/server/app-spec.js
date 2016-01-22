var test = require('tapes')

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
  var testServerApp = require('./test-server-app')({
    serverApp: serverApp,
    defaultTitle: defaultTitle
  })

  require('./abstract-expect-server-app')({
    testServerApp: testServerApp,
    universalAppSpec: universalAppSpec,
    defaultTitle: defaultTitle,
    t: t
  }, function (expect, t, rq, baseRequest) {
    t.test('should /signup (redirect disabled)', function (t) {
      baseRequest({url: '/signup'}, function () {
        rq({followRedirect: false, method: 'post', url: '/signup', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234', repeatPassword: 'test1234'}}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirects to /welcome')
          t.end()
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

    t.test('should /login (redirect disabled)', function (t) {
      baseRequest({url: '/login'}, function () {
        rq({followRedirect: false, method: 'post', url: '/login', form: {type: 'email', uuid: 'steve@test.com', password: 'test1234'}}, function ($, res) {
          t.equal(res.headers.location, '/welcome', 'redirects to /welcome')
          t.end()
        })
      })
    })

    t.test('should NOT /login with bad credentials (redirect disabled)', function (t) {
      baseRequest({url: '/login'}, function () {
        rq({followRedirect: false, method: 'post', url: '/login', form: {type: 'email', uuid: 'steve@test.com', password: 'bad'}}, function ($, res) {
          t.ok($('.login-container'), 'still on login page')
          t.end()
        })
      })
    })

    t.test('should /signup.json', function (t) {
      baseRequest({url: '/signup'}, function () {
        rq({method: 'post', url: '/signup.json', form: {type: 'email', uuid: 'steve1@test.com', password: 'test1234', repeatPassword: 'test1234'}}, function ($, res) {
          var user = JSON.parse(res.body)
          // t.equal(user.uuid, 'steve1@test.com')
          t.equal(user.type, 'email')
          t.end()
        })
      })
    })

    t.test('should /login.json', function (t) {
      baseRequest({url: '/login'}, function () {
        rq({method: 'post', url: '/login.json', form: {type: 'email', uuid: 'steve1@test.com', password: 'test1234'}}, function ($, res) {
          var user = JSON.parse(res.body)
          // t.equal(user.uuid, 'steve1@test.com')
          t.equal(user.type, 'email')
          t.end()
        })
      })
    })

    t.test('should NOT /signup.json again with existing uuid', function (t) {
      baseRequest({url: '/signup'}, function () {
        rq({method: 'post', url: '/signup.json', form: {type: 'email', uuid: 'steve1@test.com', password: 'test1234', repeatPassword: 'test1234'}}, function ($, res) {
          var user = JSON.parse(res.body)
          t.equal(user.uuid, undefined)
          t.equal(user.type, undefined)
          t.end()
        })
      })
    })

    expect.universalAppSpecsToPass(t)

    t.end()
  })
})
