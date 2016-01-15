var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput

var Login = React.createClass({
  propTypes: {
    loggedIn: React.PropTypes.object,
    uuid: React.PropTypes.number,
    formAction: React.PropTypes.string
  },
  render: function () {
    var loggedIn = this.props.loggedIn
    var email = this.props.uuid
    var formAction = this.props.formAction
    return <div className='login-container'>
      <h1>Login</h1>
      <form action={formAction} method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <input type='hidden' name='type' value='email' />
        <Input name='uuid' type='text' label='Email Address' />
        <Input name='password' type='password' label='Password' />
        <ButtonInput type='submit' value='Login' />
        <div className='result'>
          { !loggedIn && email ? 'We are sorry ' + email + ', but there was an error logging in!' : false }
        </div>
      </form>
    </div>
  }
})

module.exports = Login
