var React = require('react');

var ReactBootstrap = require('react-bootstrap');

var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;

var Images = React.createClass({
  imageSearch: function(event) {
    event.preventDefault();
    var searchTerm = this.refs.searchTerm.getValue();
    this.props.navigate("/images/" + searchTerm);
  },
  render: function() {
    var searchTerm = this.props.searchTerm;
    var images = this.props.images || [];
    var createImageItem = function(image) {
      return <li><img src={image.url} /></li>
    }
    var header = "Images";
    if (searchTerm) {
      header += " - " + searchTerm
    }
    return (
      <div className="images-container">
        <h3>{header}</h3>
        <form className="panel panel-default" onSubmit={this.imageSearch} >
          <Input type='text' label='Search Term' ref='searchTerm' placeholder='Enter Search Term' />
          <Button bsStyle="primary" onClick={this.imageSearch}>Search</Button>
        </form>
        <ol>
          { images.map(createImageItem) }
        </ol>
      </div>
    );
  }
});

module.exports = Images;