var React = require('react')

var Bootstrap = require('react-bootstrap')

var Panel = Bootstrap.Panel
var Input = Bootstrap.Input
var ButtonInput = Bootstrap.ButtonInput

var NewItem = React.createClass({
  render: function () {
    var itemTemplate = this.props.itemTemplate
    var title = this.props.title
    var baseUrl = this.props.baseUrl
    var modelProperties = []
    for (var prop in itemTemplate) {
      modelProperties.push(prop)
    }
    var createCell = function (modelProp) {
      if (modelProp === 'id') {
        return
      }
      var colInfo = itemTemplate[modelProp]
      if (colInfo.defaultValue || colInfo.defaultValue === 0) {
        return
      }
      var propType = colInfo.type
      var inputType
      switch (propType) {
        case 'text':
          inputType = 'text'
          break
        case 'integer':
          inputType = 'number'
          break
      }
      return <Panel header={<h3>{modelProp}</h3>} key={modelProp}>
        <Input type={inputType} name={modelProp} />
      </Panel>
    }
    var Form = this.props.Form
    return <div className='new-item-container'>
      <h1>{title}</h1>
      <Form action={baseUrl + '/create'} method='post'>
        {modelProperties.map(createCell)}
        <ButtonInput type='submit' value='Create' />
      </Form>
    </div>
  },
  propTypes: {
    itemTemplate: React.PropTypes.object,
    title: React.PropTypes.string,
    baseUrl: React.PropTypes.string,
    Form: React.PropTypes.func
  }
})

module.exports = NewItem
