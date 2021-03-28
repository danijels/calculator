const Key = (props) => (
	<button 
	  className='key'
	  id={props.id}
	  value={props.text}
	>
		{props.text}
	</button>
);

export default Key