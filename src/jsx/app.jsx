var React = require('react');

var ReactBootstrap = require('react-bootstrap');

var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;

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
  logout: function() {
    this.setState({
      username: false,
    });
    this.props.session.removeAll();
  },
  render: function() {
    var content = React.cloneElement(this.props.content, {
      navigate: this.props.navigate,
      login: this.login, 
      username: this.state.username
    });
    var sessionItem;
    var dropdownMenu = (
      <DropdownButton title='Menu'>
        <MenuItem href="/">Front Page</MenuItem>
        <MenuItem href="/images">Images</MenuItem>
        <MenuItem divider />
        <MenuItem onSelect={this.logout}>Logout</MenuItem>
      </DropdownButton>
    );
    return (
      <div className="app-container">
        <Navbar brand={<a href="/">Universal React</a>} inverse>
          <Nav right>
            { this.state.username ? <NavItem className="session-container">{this.state.username}</NavItem> : false }
            { this.state.username ? dropdownMenu : <NavItem href="/login">Login</NavItem> }
          </Nav>
        </Navbar>
        <div className="content">
          { content }
        </div>
      </div>
    );
  }
});

module.exports = App;