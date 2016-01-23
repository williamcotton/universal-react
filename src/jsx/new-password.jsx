var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput
var Alert = ReactBootstrap.Alert

var NewPassword = React.createClass({
  propTypes: {
    credentials: React.PropTypes.object,
    errors: React.PropTypes.array,
    formAction: React.PropTypes.string
  },
  render: function () {
    var passwordMismatch = this.props.errors ? this.props.errors.indexOf('PASSWORD_MISMATCH') > -1 : false
    var passwordTooShort = this.props.errors ? this.props.errors.indexOf('PASSWORD_TOOSHORT') > -1 : false
    var formAction = this.props.formAction
    var credentials = this.props.credentials
    return <div className='new-password-container'>
      <h1>New Password</h1>
      { credentials.uuid ? <Alert bsStyle='warning'>Please choose a new password for <strong>{credentials.uuid}</strong>.</Alert> : false }
      <form action={formAction} method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <input type='hidden' name='token' value={credentials.token} />
        <input type='hidden' name='uuid' value={credentials.uuid} />
        <Input bsStyle={ passwordTooShort ? 'error' : null} name='password' type='password' label='Password' defaultValue={ passwordTooShort ? '' : credentials.password} autoFocus />
        <Input bsStyle={ passwordMismatch ? 'error' : null} name='repeatPassword' type='password' label='Repeat Password' />
        <ButtonInput type='submit' value='Update Password' />
      </form>
    </div>
  }
})

module.exports = NewPassword
