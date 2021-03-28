const Display = (props) => (
	<div class='display'>
	    <p>
	      {props.formula}
	    </p>
	    <p id='display'>
	      {props.output}
	    </p>
	</div>
)

export default Display