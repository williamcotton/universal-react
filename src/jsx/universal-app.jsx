var React = require('react')

var FrontPage = require('./front-page.jsx')
var About = require('./about.jsx')
var Calculator = require('./calculator.jsx')
var Signup = require('./signup.jsx')
var Welcome = require('./welcome.jsx')
var Login = require('./login.jsx')
var ResetPassword = require('./reset-password.jsx')
var NewPassword = require('./new-password.jsx')
var ResetPasswordEmailSent = require('./reset-password-email-sent.jsx')
var ShowCollection = require('./lib/show-collection.jsx')
var ShowItem = require('./lib/show-item.jsx')
var EditItem = require('./lib/edit-item.jsx')
var NewItem = require('./lib/new-item.jsx')

var universalApp = ({app}) => {
  app.get('/', (req, {renderApp}) => {
    renderApp(<FrontPage />)
  })

  /*
    Footer
    ------
  */

  app.get('/about', (req, {renderApp}) => {
    renderApp(<About />, {title: 'About'})
  })

  /*
    User Authentication
    -------------------
  */

  require('../js/lib/expect-universal-user-authentication')({
    app: app,
    login: { component: Login, successRedirect: '/welcome' },
    signup: { component: Signup, successRedirect: '/welcome' },
    logout: { successRedirect: '/' },
    resetPassword: { component: ResetPassword, successComponent: ResetPasswordEmailSent },
    newPassword: { component: NewPassword }
  })

  var userRequired = ({user}, {renderApp}, next) => {
    if (!user) {
      return renderApp(<h2>Login Required!</h2>, {title: 'Login Required'})
    }
    next()
  }

  app.get('/welcome', userRequired, (req, {renderApp}) => {
    renderApp(<Welcome />, {title: 'Welcome'})
  })

  /*
    Calculator
    ----------
  */

  app.get('/calculator', (req, {renderApp}) => {
    renderApp(<Calculator />, {title: 'Calculator'})
  })

  app.post('/calculator', ({body: {firstNumber, secondNumber, operation}}, {renderApp}) => {
    var result
    switch (operation) {
      case '+':
        result = firstNumber + secondNumber
        break
      case '-':
        result = firstNumber - secondNumber
        break
    }
    var content = <Calculator result={result} firstNumber={firstNumber} secondNumber={secondNumber} operation={operation} />
    renderApp(content, {title: 'Calculator'})
  })

  /*
    Canvas Demo
    -----------
  */

  app.get('/canvas', ({query}, {renderApp}) => {
    var width = query.width || 150
    var height = query.height || 150
    renderApp(<canvas style={{
      borderStyle: 'solid',
      borderColor: 'black',
      borderWidth: 1,
      margin: 30,
      width: width,
      height: height
    }} ref={canvas => {
      if (!canvas) return
      canvas.width = width * 2 // @2x
      canvas.height = height * 2 // @2x
      var ctx = canvas.getContext('2d')
      ctx.scale(2, 2) // @2x
      ctx.fillStyle = 'rgb(200,0,0)'
      ctx.fillRect(10, 10, 55, 50)
      ctx.fillStyle = 'rgba(0, 0, 200, 0.5)'
      ctx.fillRect(30, 30, 55, 50)
    }} />)
  })

  /*
    d3 demo
    -------
  */

  app.get('/d3', (req, {renderApp}) => {
    var data = [{color: 'red', value: 20}, {color: 'blue', value: 12}, {color: 'green', value: 18}]
    var d3 = require('d3')
    var ReactFauxDOM = require('react-faux-dom')
    var list = ReactFauxDOM.createElement('ul')
    d3.select(list)
      .selectAll('li')
      .data(data)
      .enter()
      .append('li')
      .style('color', 'white')
      .style('padding', '5px')
      .style('width', d => d.value * 10 + 'px')
      .style('background-color', d => d.color)
      .text(d => d.color)
      .on('mouseover', function (d) {
        // see this for interactions:
        // https://github.com/Olical/react-faux-dom/issues/29#issuecomment-155710453
        d3.select(this)
          .style('background-color', 'orange')
        // ReactFauxDOM is designed to use React components and setState(), but as a hack we can do this...
        renderApp(list.toReact())
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style('background-color', d.color)
        renderApp(list.toReact())
      })
    renderApp(list.toReact())
  })

  /*
    Songs
    -----
    ORM Model
  */

  var songCreateCells = {
    stars: (item, col) => {
      var getStarsGlyph = numberOfStars => {
        numberOfStars = parseInt(numberOfStars, 10)
        var x = function (c, t) { return Array(t + 1).join(c) }
        return x('★', numberOfStars) + x('☆', 5 - numberOfStars)
      }
      var numberOfStars = item[col]
      return getStarsGlyph(numberOfStars)
    }
  }

  app.get('/songs', ({songs}, {renderApp}) => {
    songs.findAll(songs => {
      var title = 'All Songs'
      var content = <ShowCollection collection={songs} title={title} createCells={songCreateCells} baseUrl='/songs' />
      renderApp(content, {title: title})
    })
  })

  app.get('/songs/new', userRequired, (req, {renderApp}) => {
    req.songs.template(songTemplate => {
      var title = 'New Song'
      var content = <NewItem itemTemplate={songTemplate} title={title} createCells={songCreateCells} baseUrl='/songs'/>
      renderApp(content, {title: title})
    })
  })

  app.post('/songs/create', userRequired, (req, {renderApp}) => {
    req.songs.create(req.body, song => {
      var title = 'Created ' + song.name
      var content = <ShowItem item={song} title={title} createCells={songCreateCells} />
      renderApp(content, {title: title})
    })
  })

  app.get('/songs/:id', ({songs, params: {id}}, {renderApp}) => {
    songs.find({id: id}, song => {
      var title = song.name
      var content = <ShowItem item={song} title={title} createCells={songCreateCells} baseUrl='/songs' />
      renderApp(content, {title: title})
    })
  })

  app.get('/songs/:id/edit', userRequired, ({songs, params: {id}}, {renderApp}) => {
    songs.find({id: id}, song => {
      var title = 'Editing ' + song.name
      var content = <EditItem item={song} title={title} createCells={songCreateCells} baseUrl='/songs'/>
      renderApp(content, {title: title})
    })
  })

  app.post('/songs/:id', userRequired, ({songs, body, params: {id}}, {renderApp}) => {
    songs.update({id: id}, body, song => {
      var title = 'Updated ' + song.name
      var content = <ShowItem item={song} title={title} createCells={songCreateCells} />
      renderApp(content, {title: title})
    })
  })

  app.post('/songs/:id/delete', userRequired, ({songs, body, params: {id}}, {renderApp}) => {
    songs.delete({id: id}, body, song => {
      // var title = 'Removed ' + song.name
      // var content = <RemovedItem item={song} title={title} createCells={songCreateCells} />
      // res.renderApp(content, {title: title})
    })
  })

  /*
    Certificate
    -----------
  */

  app.get('/certificate', (req, {renderApp}) => {
    renderApp(<canvas style={{
      border: '0px solid black',
      margin: '30px auto',
      width: '600px',
      height: '300px'
    }} ref={canvas => {
      if (!canvas) return
      canvas.width = 600 * 2
      canvas.height = 300 * 2
      var ctx = canvas.getContext('2d')
      ctx.lineWidth = 0.1
      var maxRadians = Math.PI
      var async = require('async')
      var drawRadialLines = (options) => {
        return new Promise(function (resolve, reject) {
          var r = options.r
          var rotate = options.rotate || 0
          var maxRadians = options.maxRadians || 2 * Math.PI
          var wiggle = options.wiggle - 1 || 1
          var wiggleDepth = options.wiggleDepth ? (100 / options.wiggleDepth) : 20
          var lineCount = options.lineCount || 360
          var scaleX = options.scaleX || 1
          var scaleY = options.scaleY || 1
          var ctx = options.ctx
          ctx.save()
          ctx.beginPath()
          ctx.translate(options.x, options.y)
          ctx.strokeStyle = options.strokeStyle || 'rgba(255, 0, 0, 0.1)'
          ctx.scale(scaleX, scaleY)
          if (rotate) {
            ctx.rotate(rotate)
          }
          var drawStep = (radians) => {
            setTimeout(() => {
              if (radians > maxRadians) {
                ctx.restore()
                return resolve()
              }
              ctx.moveTo(0, 0)
              var x = 0 + (r * Math.sin(radians)) + (r / wiggleDepth * Math.sin(radians * wiggle))
              var y = 0 + (r * Math.cos(radians)) + (r / wiggleDepth * Math.cos(radians * wiggle))
              ctx.lineTo(x, y)
              ctx.stroke()
              drawStep(radians + (maxRadians / lineCount))
            }, 1)
          }
          drawStep(0)
        })
      }
      var build4Corners = (options) => {
        return [
          {ctx, x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, r: options.r, lineCount: options.lineCount, wiggle: options.wiggle, wiggleDepth: options.wiggleDepth, strokeStyle: options.strokeStyle, maxRadians},
          {ctx, x: 1200, y: 0, rotate: (Math.PI / 2) * 4, scaleX: -1, scaleY: 1, r: options.r, lineCount: options.lineCount, wiggle: options.wiggle, wiggleDepth: options.wiggleDepth, strokeStyle: options.strokeStyle, maxRadians},
          {ctx, x: 1200, y: 600, rotate: (Math.PI / 2) * 2, scaleX: 1, scaleY: 1, r: options.r, lineCount: options.lineCount, wiggle: options.wiggle, wiggleDepth: options.wiggleDepth, strokeStyle: options.strokeStyle, maxRadians},
          {ctx, x: 0, y: 600, rotate: (Math.PI / 2) * 2, scaleX: -1, scaleY: 1, r: options.r, lineCount: options.lineCount, wiggle: options.wiggle, wiggleDepth: options.wiggleDepth, strokeStyle: options.strokeStyle, maxRadians}
        ]
      }
      var radialLinesCommands = build4Corners({
        r: 180,
        strokeStyle: 'rgba(10, 30, 200, 0.1)',
        lineCount: 160,
        wiggle: 19,
        wiggleDepth: 2
      }).concat(build4Corners({
        r: 200,
        strokeStyle: 'rgba(190, 90, 190, 0.1)',
        lineCount: 160,
        wiggle: 11,
        wiggleDepth: 5
      })).concat(build4Corners({
        r: 240,
        strokeStyle: 'rgba(100, 10, 160, 0.1)',
        lineCount: 180,
        wiggle: 21,
        wiggleDepth: 7
      }))
      async.eachSeries(radialLinesCommands, (rlc, next) => {
        drawRadialLines(rlc).then(next)
      })
    }} />)
  })

  app.get('/record_audio', (req, {renderApp}) => {
    renderApp(<div ref={div => {
      require('webrtc-adapter')
      console.log('loaded')
      var recordedData = []
      let config = {
        video: false,
        audio: true
      }
      let audioContext = new AudioContext()
      let deletePendingRecording = false
      let reject = err => {
        console.log('reject', err)
      }
      let resolve = audioData => {
        console.log('resolve', audioData)
      }
      let onStreamSuccess = stream => {
        console.log('onStreamSuccess', stream)
        // let sourceNode = this.audioContext.createMediaStreamSource(stream)
        let recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        })
        recorder.addEventListener('error', evt => {
          reject(evt)
        })
        recorder.addEventListener('dataavailable', evt => {
          if (typeof evt.data === 'undefined') return
          if (evt.data.size === 0) return
          recordedData.push(evt.data)
        })
        recorder.addEventListener('stop', evt => {
          console.log('stop!')
          let tracks = stream.getTracks()
          tracks.forEach(track => track.stop())
          let audioData = new Blob(recordedData, {
            type: 'audio/webm'
          })
          if (deletePendingRecording) {
            deletePendingRecording = false
            audioData = null
          }
          resolve(audioData)
        })
        let stop = () => {
          console.log('stop', recorder)
          recorder.stop()
        }
        setTimeout(stop, 2000)
        console.log('start')
        recorder.start(10)
      }
      navigator.getUserMedia(config, onStreamSuccess, err => reject(err))
    }} ></div>)
  })

  return app
}

module.exports = universalApp
