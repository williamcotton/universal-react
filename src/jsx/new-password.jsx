var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput

var NewPassword = React.createClass({
  propTypes: {
    uuid: React.PropTypes.string,
    password: React.PropTypes.string,
    errors: React.PropTypes.array,
    formAction: React.PropTypes.string
  },
  render: function () {
    var passwordMismatch = this.props.errors ? this.props.errors.indexOf('PASSWORD_MISMATCH') > -1 : false
    var passwordTooShort = this.props.errors ? this.props.errors.indexOf('PASSWORD_TOOSHORT') > -1 : false
    var formAction = this.props.formAction
    return <div className='new-password-container'>
      <h1>New Password</h1>
      <form action={formAction} method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <input type='hidden' name='token' value={this.props.token} />
        <Input bsStyle={ passwordTooShort ? 'error' : ''} name='password' type='password' label='Password' defaultValue={ passwordTooShort ? '' : this.props.password} autoFocus />
        <Input bsStyle={ passwordMismatch ? 'error' : ''} name='repeat_password' type='password' label='Repeat Password' />
        <ButtonInput type='submit' value='Update Password' />
      </form>
    </div>
  }
})

module.exports = NewPassword
