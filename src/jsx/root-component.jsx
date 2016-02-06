var React = require('react')
var Bootstrap = require('react-bootstrap')

var Navbar = Bootstrap.Navbar

var RootComponent = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    content: React.PropTypes.element
  },
  render: function () {
    var content = this.props.content

    return <div className='root-component-container'>
      <Navbar className='navbar-container navbar-default hidden-xs'>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='/'>Expect</a>
          </Navbar.Brand>
        </Navbar.Header>
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
            </ul>
          </div>
        </div>
      </footer>
    </div>
  }
})

module.exports = RootComponent
