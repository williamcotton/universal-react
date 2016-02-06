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
    var Form = this.props.Form
    return <div className='new-password-container'>
      <h1>New Password</h1>
      { credentials.uuid ? <Alert bsStyle='warning'>Please choose a new password for <strong>{credentials.uuid}</strong>.</Alert> : false }
      <Form action={formAction} method='post'>
        <input type='hidden' name='token' value={credentials.token} />
        <input type='hidden' name='uuid' value={credentials.uuid} />
        <Input bsStyle={ passwordTooShort ? 'error' : null} name='password' type='password' label='Password' defaultValue={ passwordTooShort ? '' : credentials.password} autoFocus />
        <Input bsStyle={ passwordMismatch ? 'error' : null} name='repeatPassword' type='password' label='Repeat Password' />
        <ButtonInput type='submit' value='Update Password' />
      </Form>
    </div>
  }
})

module.exports = NewPassword
