import Key from './key.js'

const Keypad = (props) => {
	const keys = props.text.map((text, i) => <Key id={props.ids[i]} key={text} text={text} />)  

	return (
		<div 
		  class='keypad'
		  onClick={props.handleClick}
		>
			{keys}    
		</div>
	)
};

export default Keypad