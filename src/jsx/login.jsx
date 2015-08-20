var React = require('react');

var ReactBootstrap = require('react-bootstrap');

var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;

var Login = React.createClass({
  getInitialState: function() {
    return {
      didLogin: false 
    };
  },
  login: function(event) {
    var component = this;
    event.preventDefault();
    var username = this.refs.username.getValue();
    this.props.login({username: username}, function(err, loginReceipt) {
      component.setState({
        didLogin: loginReceipt.success, 
        username: username
      });
    });
  },
  render: function() {
    var didLoginAlert;
    if (this.state.didLogin) {
      didLoginAlert = <div className="alert alert-success">Login successful.</div>;
    }
    return (
      <div className="login-container">
        {didLoginAlert}
        <form onSubmit={this.login} >
          <Input type='text' label='Username' ref='username' placeholder='Enter Username' />
          <Button bsStyle="primary" onClick={this.login}>Login</Button>
        </form>
      </div>
    );
  }
});

module.exports = Login;