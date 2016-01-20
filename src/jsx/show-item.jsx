var React = require('react')

var Bootstrap = require('react-bootstrap')

var Panel = Bootstrap.Panel

var ShowItem = React.createClass({
  render: function () {
    var item = this.props.item
    var name = this.props.name
    var createCells = this.props.createCells
    var baseUrl = this.props.baseUrl
    var modelProperties = []
    for (var prop in item) {
      modelProperties.push(prop)
    }
    var createCell = function (modelProp) {
      var content = item[modelProp]
      if (createCells[modelProp]) {
        content = createCells[modelProp](item, modelProp)
      }
      return <Panel header={<h3>{modelProp}</h3>} key={modelProp}>
        {content}
      </Panel>
    }
    return (
    <div className='show-item-container'>
        <h1>{name}</h1>
        {modelProperties.map(createCell)}
      </div>
    )
  }
})

module.exports = ShowItem
