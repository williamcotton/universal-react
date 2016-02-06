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

    const navRight = this.props.user ? [
      <NavItem key='/logout' href='/logout'>Logout</NavItem>
    ] : [
      <NavItem key='/login' href='/login'>Login</NavItem>,
      <NavItem key='/signup' href='/signup'>Signup</NavItem>
    ]

    return <div className='root-component-container'>
      <Navbar className='navbar-container navbar-default hidden-xs'>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='/'>Expect</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullLeft>
          <NavItem href='/calculator'>Calculator</NavItem>
          <NavItem href='/canvas'>Canvas</NavItem>
          <NavItem href='/d3'>d3</NavItem>
          <NavItem href='/songs'>Songs</NavItem>
        </Nav>
        <Nav pullRight>
          {navRight}
        </Nav>
      </Navbar>
      <div className='container main-container'>
        { content }
      </div>
      <footer>
        <div className='container'>
          <div className='footer-copyright'>
            Expect © 2016
          </div>
          <div className='footer-menu'>
            <ul>
              <li>
                <a href='/about'>About</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  }
})

module.exports = RootComponent
