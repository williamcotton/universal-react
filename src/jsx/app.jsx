var React = require('react')

var ReactBootstrap = require('react-bootstrap')

var Navbar = ReactBootstrap.Navbar
var Nav = ReactBootstrap.Nav
var NavDropdown = ReactBootstrap.NavDropdown
var MenuItem = ReactBootstrap.MenuItem

var App = React.createClass({
  render: function () {
    var content = this.props.content
    var dropdownMenu = (
    <NavDropdown title='Menu' id='main'>
        <MenuItem href='/'>Front Page</MenuItem>
        <MenuItem href='/about'>About</MenuItem>
      </NavDropdown>
    )
    return (
    <div className='app-container'>
        <Navbar inverse className='navbar-container'>
          <Navbar.Header>
            <Navbar.Brand>
              <a href='/'>Universal App</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Nav pullRight>
            { dropdownMenu }
          </Nav>
        </Navbar>
        <div className='content'>
          { content }
        </div>
      </div>
    )
  }
})

module.exports = App
