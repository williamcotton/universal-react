var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput

var Signup = React.createClass({
  propTypes: {
    email: React.PropTypes.string,
    password: React.PropTypes.string,
    error: React.PropTypes.string
  },
  render: function () {
    var passwordMismatch = this.props.error === 'PASSWORD_MISMATCH'
    var passwordTooShort = this.props.error === 'PASSWORD_TOOSHORT'
    var emailInvalid = this.props.error === 'EMAIL_INVALID'
    var emailAlreadyExists = this.props.error === 'EMAIL_EXISTS'
    return <div className='signup-container'>
      <h1>Signup</h1>
      <form action='/signup' method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <Input bsStyle={ emailInvalid || emailAlreadyExists ? 'error' : 'success'} name='email' type='text' label='Email Address' defaultValue={ emailInvalid || emailAlreadyExists ? '' : this.props.email} />
        <Input bsStyle={ passwordTooShort ? 'error' : 'success'} name='password' type='password' label='Password' defaultValue={ passwordTooShort ? '' : this.props.password} />
        <Input bsStyle={ passwordMismatch ? 'error' : 'success'} name='repeat_password' type='password' label='Repeat Password' autoFocus />
        <ButtonInput type='submit' value='Signup' />
      </form>
    </div>
  }
})

module.exports = Signup
