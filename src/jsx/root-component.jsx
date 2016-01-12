var React = require('react')

var ReactBootstrap = require('react-bootstrap')

var Navbar = ReactBootstrap.Navbar
var Nav = ReactBootstrap.Nav
var NavDropdown = ReactBootstrap.NavDropdown
var NavItem = ReactBootstrap.NavItem
var MenuItem = ReactBootstrap.MenuItem

var RootComponent = React.createClass({
  propTypes: {
    content: React.PropTypes.element
  },
  render: function () {
    var content = this.props.content
    return <div className='root-component-container'>
      <Navbar inverse className='navbar-container'>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='/'>Universal App</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Nav pullLeft>
          <NavItem href='/about'>About</NavItem>
          <NavItem href='/calculator'>Calculator</NavItem>
        </Nav>
        <Nav pullRight>
          { this.props.user ? <Navbar.Text>{this.props.user.uuid}</Navbar.Text> : false }
          { this.props.user ? <NavItem href='/logout'>Logout</NavItem> : <NavItem href='/login'>Login</NavItem> }
        </Nav>
      </Navbar>
      <div className='content'>
        { content }
      </div>
    </div>
  }
})

module.exports = RootComponent
