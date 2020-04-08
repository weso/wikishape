import React, {useEffect, useRef, useState} from 'react';
import PropTypes from "prop-types";
import Yasqe from 'yasgui-yasqe/dist/yasqe.bundled.min';
import 'yasgui-yasqe/dist/yasqe.min.css';
import 'codemirror/addon/display/placeholder';

function QueryForm(props) {
    const { value, onChange, placeholder, readonly, prefixes } = props;
    const [ yasqe, setYasqe] = useState(null);
    // const textAreaRef = useRef(null)

    useEffect(() => {
        if (!yasqe) {
            const options = {
                sparql: { showQueryButton: false },
                createShareLink: null,
                placeholder: placeholder,
                readonly: readonly
            };
//            const y = Yasqe.fromTextArea(textAreaRef, options);
            const y = Yasqe.fromTextArea(document.getElementById('SPARQL-TextArea'), options);
            y.on('change', (cm,change) => {
                onChange(cm.getValue())
            });

//             y.addPrefixes(prefixes);
            y.setValue(value);
            y.refresh();
            setYasqe(y);
        }
    }, [
        yasqe,
        placeholder,
        value
    ]);

    return (
       <div>
        <textarea id="SPARQL-TextArea"/>
      { /*  For some reason, it doesn't work with references as Yashe  <textarea ref={textAreaRef}/>*/  }
       </div>
    );
}

QueryForm.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    readonly: PropTypes.bool,
    prefixes: PropTypes.object
};

QueryForm.defaultProps = {
    value: ''
};

export default QueryForm;
