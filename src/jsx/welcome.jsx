var React = require('react')

var Welcome = React.createClass({
  render: function () {
    return <div className='welcome-container'>
      <h1 className='welcome-message'>Welcome!</h1>
      <p></p>
    </div>
  }
})

module.exports = Welcome
