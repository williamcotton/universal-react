var React = require('react')

var ReactBootstrap = require('react-bootstrap')

var Navbar = ReactBootstrap.Navbar
var Nav = ReactBootstrap.Nav
var NavDropdown = ReactBootstrap.NavDropdown
var MenuItem = ReactBootstrap.MenuItem

var App = React.createClass({
  propTypes: {
    content: React.PropTypes.element
  },
  render: function () {
    var content = this.props.content
    return <div className='app-container'>
      <Navbar inverse className='navbar-container'>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='/'>Universal App</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Nav pullRight>
          <NavDropdown title='Menu' id='main'>
            <MenuItem href='/'>Front Page</MenuItem>
            <MenuItem href='/about'>About</MenuItem>
            <MenuItem href='/calculator'>Calculator</MenuItem>
          </NavDropdown>
        </Nav>
      </Navbar>
      <div className='content'>
        { content }
      </div>
    </div>
  }
})

module.exports = App
