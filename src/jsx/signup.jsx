var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput

var Signup = React.createClass({
  propTypes: {
    uuid: React.PropTypes.string,
    password: React.PropTypes.string,
    errors: React.PropTypes.array,
    formAction: React.PropTypes.string
  },
  render: function () {
    var passwordMismatch = this.props.errors ? this.props.errors.indexOf('PASSWORD_MISMATCH') > -1 : false
    var passwordTooShort = this.props.errors ? this.props.errors.indexOf('PASSWORD_TOOSHORT') > -1 : false
    var emailInvalid = this.props.errors ? this.props.errors.indexOf('EMAIL_INVALID') > -1 : false
    var emailAlreadyExists = this.props.errors ? this.props.errors.indexOf('UUID_FOR_TYPE_EXISTS') > -1 : false
    var formAction = this.props.formAction
    return <div className='signup-container'>
      <h1>Signup</h1>
      <form action={formAction} method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <input type='hidden' name='type' value='email' />
        <Input bsStyle={ emailInvalid || emailAlreadyExists ? 'error' : ''} name='uuid' type='text' label='Email Address' defaultValue={ emailInvalid || emailAlreadyExists ? '' : this.props.uuid} />
        <Input bsStyle={ passwordTooShort ? 'error' : ''} name='password' type='password' label='Password' defaultValue={ passwordTooShort ? '' : this.props.password} />
        <Input bsStyle={ passwordMismatch ? 'error' : ''} name='repeat_password' type='password' label='Repeat Password' autoFocus />
        <ButtonInput type='submit' value='Signup' />
      </form>
    </div>
  }
})

module.exports = Signup
