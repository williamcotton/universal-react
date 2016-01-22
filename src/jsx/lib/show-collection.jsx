var React = require('react')
var Bootstrap = require('react-bootstrap')
var Table = Bootstrap.Table
var Glyphicon = Bootstrap.Glyphicon

var ShowAll = React.createClass({
  propTypes: {
    collection: React.PropTypes.array,
    name: React.PropTypes.string
  },
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
      <h1>{title}</h1>
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
  }
})

module.exports = ShowAll
