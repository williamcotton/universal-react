var React = require('react');

var Login = React.createClass({
  getInitialState: function() {
    return {
      didLogin: false 
    };
  },
  login: function(event) {
    var component = this;
    event.preventDefault();
    var username = this.refs.username.getDOMNode().value;
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
      didLoginAlert = <p className="alert alert-success">Login successful. Welcome, {this.state.username}.</p>;
    }
    return (
      <div className="login-container">
        {didLoginAlert}
        <form onSubmit={this.login} >
          <input ref="username"/>
          <button onClick={this.login}>Login</button>
        </form>
      </div>
    );
  }
});

module.exports = Login;