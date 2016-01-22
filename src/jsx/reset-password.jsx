var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var ButtonInput = ReactBootstrap.ButtonInput
var Input = ReactBootstrap.Input
var Alert = ReactBootstrap.Alert

var ResetPassword = React.createClass({
  propTypes: {
    errors: React.PropTypes.array,
    formAction: React.PropTypes.string
  },
  render: function () {
    var formAction = this.props.formAction
    return <div className='reset-password-container'>
      <h1>Reset Password</h1>
      { this.props.expired ? <Alert bsStyle='warning'>Your password reset token has expired. Please start over.</Alert> : false }
      <form action={formAction} method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <p>Forgot your password?</p>
        <input type='hidden' name='type' value='email' />
        <Input name='uuid' type='text' label='Email Address' />
        <ButtonInput type='submit' value='Send Reset Password Email' />
      </form>
    </div>
  }
})

module.exports = ResetPassword
