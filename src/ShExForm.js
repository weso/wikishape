import React, {useState, useEffect, useRef} from 'react';
import 'yashe/dist/yashe.min.css'
import Yashe from 'yashe/dist/yashe.bundled.min';
import PropTypes from "prop-types";
import 'codemirror/addon/display/placeholder';

function ShExForm(props) {
    const { value, onChange, placeholder, readonly } = props
    const [yashe,setYashe] = useState(null)
    const textAreaRef = useRef(null)

    useEffect(() => {
        if (!yashe) {
            const options = {
                placeholder: placeholder,
                readonly: readonly
            }
            const y = Yashe.fromTextArea(
                textAreaRef.current, 
                options)
            y.on('change', (cm,change) => {
                onChange(cm.getValue())
            });
            y.setValue(value)
            y.refresh();
            setYashe(y);
        }
    }, [
        yashe,
        placeholder,
        value]
    );

    return (
        <textarea ref={textAreaRef}/>
    );
}

ShExForm.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    readonly: PropTypes.bool,
    setCodeMirror: PropTypes.func
}

ShExForm.defaultProps = {
    value: '',
    readonly: false
}

export default ShExForm;
