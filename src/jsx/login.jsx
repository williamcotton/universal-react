var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput

var Login = React.createClass({
  propTypes: {
    loggedIn: React.PropTypes.object,
    username: React.PropTypes.number
  },
  render: function () {
    var loggedIn = this.props.loggedIn
    var username = this.props.username
    return <div className='login-container'>
      <h1>Login</h1>
      <form action='/login' method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <Input name='username' type='text' />
        <Input name='password' type='password' />
        <ButtonInput type='submit' value='Login' />
        <div className='result'>
          { !loggedIn && username ? 'We are sorry ' + username + ', but there was an error logging in!' : false }
        </div>
      </form>
    </div>
  }
})

module.exports = Login
