import { Component } from 'react'
import './App.scss';

import Display from './components/display.js'
import Keypad from './components/keypad.js'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
          outputVal: '0',
          prevVal: '0',
          formula: '',
          evaluated: false
        }
        this.handleClick = this.handleClick.bind(this);
        this.clear = this.clear.bind(this);
        this.handleClearEntry = this.handleClearEntry.bind(this);
        this.handleNums = this.handleNums.bind(this);
        this.warn = this.warn.bind(this);
        this.handleDecimal = this.handleDecimal.bind(this);
        this.handleOperators = this.handleOperators.bind(this);
        this.handleEval = this.handleEval.bind(this);
    }
    componentDidMount() {
        document.addEventListener('keydown', this.handleClick);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleClick);
    }
    handleClick(e) {
        const val = e.key || e.target.value;
        const output = this.state.outputVal.toString();
        //User can press an operator or eval if the limit is reached, but it can't be done before the timed 
        //warning goes away or the whole calculation get messed up
        if (!output.includes('LIMIT')) {
            if (val === 'AC') return this.clear();
            if (Number(val) >= 0 && Number(val) <= 9) return this.handleNums(val);
            if (val === '.') return this.handleDecimal();
            if (/[/*\-+]/.test(val)) return this.handleOperators(val);
            if (['=', 'Enter'].includes(val)) return this.handleEval();
            if (val === 'CE') return this.handleClearEntry();
        }
    }
    clear() {
        this.setState({
          outputVal: '0',
          prevVal: '0',
          formula: '',
          evaluated: false
        })
    }
    handleClearEntry() {
      const formula = this.state.formula;
      const lastSign = formula.split('').reverse().join('').match(/--|[+/*-]/);
      const indOfLast = formula.lastIndexOf(lastSign);

      this.setState({
        outputVal: '0',
        formula: formula.slice(0, indOfLast + 1)
      });
    }
    handleNums(val) {
        const { outputVal, formula, evaluated } = this.state;
        //A new number was entered - a new calculation is started
        this.setState({ evaluated: false });
        
        if (outputVal.length > 21) return this.warn();
        //In case there is the result being displayed and a new number is entered
        if (evaluated) return this.setState({
          outputVal: val,
          formula: val !== '0' ? val : ''
        });
        //The limit has not been reached, it's not the start of a new calculation:
        
        //If user tries to enter two zeros in a row at the beginning of a formula, only one is always allowed
        //In case user enters 0 at the beginning of the formula or after an operator and then enters a positive 
        //number, that zero will be overwritten by the new number
        let newFormula = outputVal === '0' && val === '0'
          ? formula === ''
            ? val
            : formula
          : /([^.0-9]0|^0)$/.test(formula)
          ? formula.slice(0, -1).concat(val)
          : formula + val;

        this.setState({
          //This part ensures that numbers such as 099 or 0000etc. are not accepted
          outputVal: /^[0/*\-+]$/.test(outputVal) ? val : outputVal.concat(val),
          formula: newFormula
        });
    }
    warn() {
        this.setState({ 
          outputVal: 'DIGIT LIMIT REACHED',
          prevVal: this.state.outputVal
        });
        setTimeout(() => this.setState({ outputVal: this.state.prevVal }), 1000);
    }
    handleDecimal() {
        const { outputVal, formula, evaluated } = this.state;
        //Handles exceeded digit limit right away
        if (outputVal.length > 21) return this.warn();
        //If the display currently shows the result of a previous finished calculation, 
        //entering 0 starts a new calculation that starts with 0.
        if (evaluated) return this.setState({
          outputVal: '0.',
          formula: '0.',
          evaluated: false
        });
        //In case . is entered right after an operator or if the formula is empty 0 is added before it
        if (/[+\-/*]$/.test(formula) || !formula) return this.setState({
          outputVal: '0.',
          formula: formula.concat('0.')
        });    
        //So the limit is not exceeded, no zeroes need to be added and now we just need to check 
        //if the number is already a decimal in which case no more dots can be added
        if (!outputVal.includes('.')) return this.setState({
          outputVal: outputVal + '.',
          formula: formula + '.'
        });    
    }
    handleOperators(op) {
        const { formula, evaluated, prevVal } = this.state;
        //If we have the result from the last calculation, by clicking an operator we start a new calculation 
        //with the result
        if (evaluated) return this.setState({ 
          outputVal: op,
          formula: prevVal.toString().concat(op),
          prevVal: prevVal.toString(),
          evaluated: false
        });
        
        //In case the formula doesn't end with an operator we save the current formula so we can deal 
        //with user changing mind about operators
        if (!/[/*\-+.]$/.test(formula)) return this.setState({
          outputVal: op,
          prevVal: formula,
          formula: formula.concat(op)
        });
        //In case an operator comes right after the dot, the dot is deleted
        if (/\.$/.test(formula)) return this.setState({
          outputVal: op,
          formula: formula.slice(0, -1).concat(op)
        });
        //In case the formula ends with a single operator, a - gets added to the formula as the negative sign 
        //and all other operators replace the previous one
        if (!/\d[/*\-+]-$/.test(formula)) return this.setState({
          outputVal: op,
          formula: op === '-' ? formula.concat(op) : prevVal.concat(op)
        });    
        //If the formula ends with an operator and a negative sign and the user enters yet another operator, 
        //the last operator and the - are replaced with the new op UNLESS the - was clicked 
        //in which case nothing happens
        if (op !== '-') this.setState({
          outputVal: op,
          formula: prevVal.concat(op)
        });
    }
    handleEval() {
        if (!this.state.evaluated) {
            const formula = this.state.formula;
            let expression = formula;
            //First we have to deal with the cases of the formula ending with an operator or the negative sign 
            //by just deleting them
            while (/[/*\-+.]$/.test(expression)) {
                expression = expression.slice(0, -1);
            }
            //All occurences of -- need to be replaced with + so that an error isn't thrown
            expression = expression.replaceAll('--', '+');
            const answer = eval(expression);
            
            this.setState({
              outputVal: answer,
              formula: formula.concat('=', answer),
              prevVal: answer,
              evaluated: true
            });
        }
    }
    render() {
        const keysText = ['AC', 'CE', '/', '*', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'];
        const keysIds = [
          'clear', 
          'delete',
          'divide', 
          'multiply', 
          'seven', 
          'eight', 
          'nine', 
          'subtract', 
          'four', 
          'five', 
          'six', 
          'add', 
          'one', 
          'two', 
          'three', 
          'equals', 
          'zero', 
          'decimal'];

        return (
          <div id='calculator'>
              <Display
                formula={this.state.formula}
                output={this.state.outputVal}
              />
              <Keypad 
                text={keysText}
                ids={keysIds}
                handleClick={this.handleClick}
              />
          </div>
        )
    }
}

export default App;
