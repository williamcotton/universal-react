/*!
 * localstorage-session based on cookie-session
 * Copyright(c) 2013 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

var onHeaders = require('on-headers')

/**
 * Module exports.
 * @public
 */

module.exports = localStorageSession

/**
 * Create a new cookie session middleware.
 *
 * @param {object} [options]
 * @param {boolean} [options.httpOnly=true]
 * @param {array} [options.keys]
 * @param {string} [options.name=session] Name of the cookie to use
 * @param {boolean} [options.overwrite=true]
 * @param {string} [options.secret]
 * @param {boolean} [options.signed=true]
 * @return {function} middleware
 * @public
 */

function localStorageSession (options) {
  var localStorage = options.localStorage
  var opts = options || {}

  var name = opts.name || 'session'

  // defaults
  if (opts.overwrite === null) opts.overwrite = true
  if (opts.httpOnly === null) opts.httpOnly = true
  if (opts.signed === null) opts.signed = true

  /**
 * Session model.
 *
 * @param {Context} ctx
 * @param {Object} obj
 * @private
 */

  function Session (ctx, obj) {
    Object.defineProperty(this, '_ctx', {
      value: ctx
    })

    if (obj) {
      for (var key in obj) {
        this[key] = obj[key]
      }
    }
  }

  /**
   * Create new session.
   * @private
   */

  Session.create = function create (req, obj) {
    var ctx = new SessionContext(req)
    return new Session(ctx, obj)
  }

  /**
   * Create session from serialized form.
   * @private
   */

  Session.deserialize = function deserialize (req, str) {
    var ctx = new SessionContext(req)
    var obj = decode(str)

    ctx._new = false
    ctx._val = str

    return new Session(ctx, obj)
  }

  /**
   * Serialize a session to a string.
   * @private
   */

  Session.serialize = function serialize (sess) {
    return encode(sess)
  }

  /**
   * Return if the session is changed for this request.
   *
   * @return {Boolean}
   * @public
   */

  Object.defineProperty(Session.prototype, 'isChanged', {
    get: function getIsChanged () {
      return this._ctx._new || this._ctx._val !== Session.serialize(this)
    }
  })

  /**
   * Return if the session is new for this request.
   *
   * @return {Boolean}
   * @public
   */

  Object.defineProperty(Session.prototype, 'isNew', {
    get: function getIsNew () {
      return this._ctx._new
    }
  })

  /**
   * Return how many values there are in the session object.
   * Used to see if it's "populated".
   *
   * @return {Number}
   * @public
   */

  Object.defineProperty(Session.prototype, 'length', {
    get: function getLength () {
      return Object.keys(this).length
    }
  })

  /**
   * populated flag, which is just a boolean alias of .length.
   *
   * @return {Boolean}
   * @public
   */

  Object.defineProperty(Session.prototype, 'isPopulated', {
    get: function getIsPopulated () {
      return Boolean(this.length)
    }
  })

  /**
   * Save session changes by performing a Set-Cookie.
   * @private
   */

  Session.prototype.save = function save () {
    var ctx = this._ctx
    var val = Session.serialize(this)

    var name = ctx.req.sessionKey
    // var opts = ctx.req.sessionOptions

    localStorage.setItem(name, val)
  }

  /**
   * Session context to tie session to req.
   *
   * @param {Request} req
   * @private
   */

  function SessionContext (req) {
    this.req = req

    this._new = true
    this._val = undefined
  }

  /**
   * Create a new session.
   * @private
   */

  function createSession (req) {
    return Session.create(req)
  }

  /**
   * Decode the base64 cookie value to an object.
   *
   * @param {String} string
   * @return {Object}
   * @private
   */

  function decode (string) {
    var body = new Buffer(string, 'base64').toString('utf8')
    return JSON.parse(body)
  }

  /**
   * Encode an object into a base64-encoded JSON string.
   *
   * @param {Object} body
   * @return {String}
   * @private
   */

  function encode (body) {
    var str = JSON.stringify(body)
    return new Buffer(str).toString('base64')
  }

  /**
   * Try getting a session from a request.
   * @private
   */

  function tryGetSession (req) {
    // var cookies = req.sessionCookies
    var name = req.sessionKey
    // var opts = req.sessionOptions

    var str = localStorage.getItem(name)
    // var str = cookies.get(name, opts)

    if (!str) {
      return undefined
    }

    try {
      return Session.deserialize(req, str)
    } catch (err) {
      if (!(err instanceof SyntaxError)) throw err
      return undefined
    }
  }

  // ** middleware

  return function _localStorageSession (req, res, next) {
    // var cookies = req.sessionCookies = new Cookies(req, res, keys)
    var sess

    // to pass to Session()
    req.sessionOptions = Object.create(opts)
    req.sessionKey = name

    req.__defineGetter__('session', function getSession () {
      // already retrieved
      if (sess) {
        return sess
      }

      // unset
      if (sess === false) {
        return null
      }

      // get or create session
      sess = tryGetSession(req) || createSession(req)
      return sess
    })

    req.__defineSetter__('session', function setSession (val) {
      if (val == null) {
        // unset session
        sess = false
        return val
      }

      if (typeof val === 'object') {
        // create a new session
        sess = Session.create(this, val)
        return sess
      }

      throw new Error('req.session can only be set as null or an object.')
    })

    onHeaders(res, function setHeaders () {
      if (sess === undefined) {
        // not accessed
        return
      }

      try {
        if (sess === false) {
          // remove
          localStorage.setItem(name, '')
        } else if ((!sess.isNew || sess.isPopulated) && sess.isChanged) {
          // save populated or non-new changed session
          // sess.save()
        }
      } catch (e) {}
    })

    next()
  }
}
