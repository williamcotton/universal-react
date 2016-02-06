var React = require('react')
module.exports = function (req, res, rootProps, contentProps) {
  var Form = React.createClass({
    propTypes: {
      action: React.PropTypes.string,
      method: React.PropTypes.string,
      encType: React.PropTypes.string,
      children: React.PropTypes.array,
      onUploadProgress: React.PropTypes.func,
      onUploadLoad: React.PropTypes.func,
      onUploadError: React.PropTypes.func,
      onUploadAbort: React.PropTypes.func,
      onProgress: React.PropTypes.func,
      onLoad: React.PropTypes.func,
      onError: React.PropTypes.func,
      onAbort: React.PropTypes.func
    },
    render: function () {
      var encType = this.props.encType || ''
      var action = encType === 'multipart/form-data' && req.csrf ? this.props.action + '?_csrf=' + req.csrf : this.props.action
      var method = this.props.method
      res.onUploadProgress = this.props.onUploadProgress
      res.onUploadLoad = this.props.onUploadLoad
      res.onUploadError = this.props.onUploadError
      res.onUploadAbort = this.props.onUploadAbort
      res.onProgress = this.props.onProgress
      res.onLoad = this.props.onLoad
      res.onError = this.props.onError
      res.onAbort = this.props.onAbort
      return <form action={action} method={method} encType={encType}>
        { req.csrf ? <input type='hidden' name='_csrf' value={req.csrf} /> : false }
        { this.props.children }
      </form>
    }
  })
  return Form
}
