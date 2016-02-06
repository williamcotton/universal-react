var React = require('react')
var ReactBootstrap = require('react-bootstrap')

var Input = ReactBootstrap.Input
var ButtonInput = ReactBootstrap.ButtonInput

var Calculator = React.createClass({
  render: function () {
    var Form = this.props.Form
    return <div className='calculator-container'>
      <h1>Calculator</h1>
      <Form action='/calculator' method='post'>
        <input type='hidden' name='_push' value='true' />
        <input type='hidden' name='_replay' value='true' />
        <Input name='firstNumber' type='number' defaultValue={this.props.firstNumber} />
        <Input name='operation' type='select' defaultValue={this.props.operation} placeholder='+'>
          <option value='+'>+</option>
          <option value='-'>-</option>
        </Input>
        <Input name='secondNumber' type='number' defaultValue={this.props.secondNumber} />
        <ButtonInput type='submit' value='Calculate' />
        <div className='result'>
          { this.props.result ? this.props.firstNumber + ' ' + this.props.operation + ' ' + this.props.secondNumber + ' = ' + this.props.result : false }
        </div>
      </Form>
    </div>
  },
  propTypes: {
    result: React.PropTypes.number,
    firstNumber: React.PropTypes.number,
    secondNumber: React.PropTypes.number,
    operation: React.PropTypes.string,
    Form: React.PropTypes.func
  }
})

module.exports = Calculator
