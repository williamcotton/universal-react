var React = require('react')

var About = React.createClass({
  render: function () {
    return <div className='about-container'>
      <h1>About</h1>
      <p>This is a Universal React Express Application.</p>
      <form action='/user.json' method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        <button>Get User</button>
      </form>
    </div>
  }
})

module.exports = About
