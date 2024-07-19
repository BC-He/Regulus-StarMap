import ParameterContainer from './ParameterContainer.jsx'
function ParametersContainer(){
    return (
        <div className="parameters">
            <ParameterContainer name="RA (hour)" value={3.87}/>
            <ParameterContainer name="HA (hour)" value={6.15}/>
            <ParameterContainer name="Dec (deg)" value={0.456}/>
        </div>
    );
}

export default ParametersContainer