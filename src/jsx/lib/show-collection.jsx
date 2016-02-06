var React = require('react')
var Bootstrap = require('react-bootstrap')
var Table = Bootstrap.Table
var Glyphicon = Bootstrap.Glyphicon

var ShowAll = React.createClass({
  render: function () {
    var title = this.props.title
    var user = this.props.user
    var collection = this.props.collection
    var baseUrl = this.props.baseUrl
    var createCells = this.props.createCells
    if (collection.length === 0) {
      return <h1>There are no items.</h1>
    }
    var modelProperties = []
    for (var prop in collection[0]) {
      modelProperties.push(prop)
    }
    var createItem = function (item) {
      var createCell = function (modelProp) {
        var content = item[modelProp]
        if (createCells[modelProp]) {
          content = createCells[modelProp](item, modelProp)
        }
        if (modelProp === 'id') {
          content = <a href={baseUrl + '/' + content}>{content}</a>
        }
        return <td key={modelProp}>{content}</td>
      }
      return <tr key={item.id}>
        {user ? <td><a href={baseUrl + '/' + item.id + '/edit'}><Glyphicon glyph='edit' /></a></td> : false}
        {modelProperties.map(createCell)}
      </tr>
    }
    var createHead = function (modelProp) {
      return <th key={modelProp}>{modelProp}</th>
    }
    return <div className={'show-all-container'}>
      <div className='title-bar'>
        <h1>{title}</h1>
        <a href={baseUrl + '/new'}>Create New</a>
      </div>
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            {user ? <td></td> : false}
            {modelProperties.map(createHead)}
          </tr>
        </thead>
        <tbody>
          {collection.map(createItem)}
        </tbody>
      </Table>
    </div>
  },
  propTypes: {
    collection: React.PropTypes.array,
    user: React.PropTypes.object,
    title: React.PropTypes.string,
    baseUrl: React.PropTypes.string,
    createCells: React.PropTypes.object
  }
})

module.exports = ShowAll
