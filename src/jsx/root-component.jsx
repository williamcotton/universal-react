var React = require('react')

var Bootstrap = require('react-bootstrap')

var Navbar = Bootstrap.Navbar
var Nav = Bootstrap.Nav
var NavItem = Bootstrap.NavItem

var RootComponent = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
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
          <NavItem href='/songs'>Songs</NavItem>
        </Nav>
        <Nav pullRight>
          { this.props.user ? <Navbar.Text>{this.props.user.email}</Navbar.Text> : <NavItem href='/login'>Login</NavItem> }
          { this.props.user ? <NavItem href='/logout'>Logout</NavItem> : <NavItem href='/signup'>Signup</NavItem> }
        </Nav>
      </Navbar>
      <div className='content'>
        { content }
      </div>
    </div>
  }
})

module.exports = RootComponent
