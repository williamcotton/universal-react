var React = require('react');

var App = React.createClass({
  getInitialState: function() {
    return {
      username: this.props.session.get("username")
    };
  },
  login: function(options, callback) {
    var username = options.username;
    this.props.session.set("username", username);
    this.setState({username: username});
    var loginReceipt = {
      success: true,
      username: username
    }
    if (callback) {
      callback(false, loginReceipt);
    }
  },
  render: function() {
    var content = React.cloneElement(this.props.content, { login: this.login, username: this.state.username });
    var sessionContainer;
    if (this.state.username) {
      sessionContainer = <div className="session-container">{this.state.username}</div>;
    }
    return (
      <div className="app-container">
        { sessionContainer }
        <div className="content">
          { content }
        </div>
      </div>
    );
  }
});

module.exports = App;