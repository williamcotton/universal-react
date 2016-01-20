var React = require('react')

var Bootstrap = require('react-bootstrap')

var Panel = Bootstrap.Panel
var Input = Bootstrap.Input
var ButtonInput = Bootstrap.ButtonInput

var EditItem = React.createClass({
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
      if (modelProp === 'id') {
        return
      }
      var content = item[modelProp]
      var propType = typeof content
      var inputType
      switch (propType) {
        case 'string':
          inputType = 'text'
          break
        case 'number':
          inputType = 'number'
          break
      }
      return <Panel header={<h3>{modelProp}</h3>} key={modelProp}>
        <Input type={inputType} defaultValue={content} name={modelProp} />
      </Panel>
    }
    return <div className='edit-item-container'>
      <h1>Edit {name}</h1>
      <form action={baseUrl + '/' + item.id} method='post'>
        <input type='hidden' name='_csrf' value={this.props.csrf} />
        {modelProperties.map(createCell)}
        <ButtonInput type='submit' value='Update' />
      </form>
    </div>
  }
})

module.exports = EditItem
