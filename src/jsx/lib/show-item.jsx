var React = require('react')

var Bootstrap = require('react-bootstrap')
var Breadcrumb = Bootstrap.Breadcrumb
var BreadcrumbItem = Bootstrap.BreadcrumbItem
var Panel = Bootstrap.Panel

var ShowItem = React.createClass({
  render: function () {
    var item = this.props.item
    var title = this.props.title
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
      if (createCells[modelProp]) {
        content = createCells[modelProp](item, modelProp)
      }
      return <Panel header={<h3>{modelProp}</h3>} key={modelProp}>
        {content}
      </Panel>
    }
    return <div className='show-item-container'>
      <Breadcrumb>
        <BreadcrumbItem href={baseUrl}>
          { item.reqProp.charAt(0).toUpperCase() + item.reqProp.slice(1) }
        </BreadcrumbItem>
        <BreadcrumbItem active>
          {title}
        </BreadcrumbItem>
      </Breadcrumb>
      <h1>{title}</h1>
      {modelProperties.map(createCell)}
    </div>
  },
  propTypes: {
    item: React.PropTypes.object,
    title: React.PropTypes.string,
    baseUrl: React.PropTypes.string,
    createCells: React.PropTypes.object,
    Form: React.PropTypes.func
  }
})

module.exports = ShowItem
