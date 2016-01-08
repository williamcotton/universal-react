var React = require('react')
var ReactBootstrap = require('react-bootstrap')
var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput

var Calculator = React.createClass({
  propTypes: {
    result: React.PropTypes.number,
    firstNumber: React.PropTypes.number,
    secondNumber: React.PropTypes.number,
    operation: React.PropTypes.string
  },
  render: function () {
    var stringCalculationWithResult = this.props.result ? this.props.firstNumber + ' ' + this.props.operation + ' ' + this.props.secondNumber + ' = ' + this.props.result : false
    return <div className='calculator-container'>
      <h1>Calculator</h1>
      <form action='/calculate' method='post'>
        <Input name='firstNumber' type='number' defaultValue={this.props.firstNumber} />
        <Input name='operation' type='select' defaultValue={this.props.operation} placeholder='+'>
          <option value='+'>+</option>
          <option value='-'>-</option>
        </Input>
        <Input name='secondNumber' type='number' defaultValue={this.props.secondNumber} />
        <ButtonInput type='submit' value='Calculate' />
        { stringCalculationWithResult }
      </form>
    </div>
  }
})

module.exports = Calculator
