const Key = (props) => (
	<button 
	  class='key'
	  id={props.id}
	  value={props.text}
	>
		{props.text}
	</button>
);

export default Key