function ParameterContainer(props){
    return (
        <div id={props.name} className="parameter">{props.name}: {props.value}</div>
    );
}

export default ParameterContainer