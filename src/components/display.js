const Display = (props) => (
	<div className='display'>
	    <p>
	      {props.formula}
	    </p>
	    <p id='output'>
	      {props.output}
	    </p>
	</div>
)

export default Display