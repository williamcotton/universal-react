var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput
var Alert = ReactBootstrap.Alert

var Login = React.createClass({
  propTypes: {
    error: React.PropTypes.object,
    uuid: React.PropTypes.string,
    formAction: React.PropTypes.string,
    updatePasswordSuccess: React.PropTypes.bool
  },
  render: function () {
    var error = this.props.error
    var updatePasswordSuccess = this.props.updatePasswordSuccess
    var formAction = this.props.formAction
    return <div className='login-container'>
      <h1>Login</h1>
      { updatePasswordSuccess ? <Alert bsStyle='success'>You have successfully reset your password.</Alert> : false }
      <form action={formAction} method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <input type='hidden' name='type' value='email' />
        <Input name='uuid' type='text' label='Email Address' defaultValue={this.props.uuid} />
        <Input bsStyle={ error ? 'error' : ''} name='password' type='password' label='Password' />
        <ButtonInput type='submit' value='Login' />
        <a href='/reset-password'>Forgot Password?</a>
      </form>
    </div>
  }
})

module.exports = Login
