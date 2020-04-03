import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';
import {mergeResult} from "../results/ResultValidate.js";

it('merges 2 results', () => {
  const result1 = {
    "valid":true,
    "type":"Result",
    "message":"Validated",
    "shapeMap":
        [{"node":"<http://www.wikidata.org/entity/Q1>",
          "shape":"<internal://base/wikidata-filmfestival>",
          "status":"?",
          "appInfo":"Shaclex",
          "reason":""
        },
          {"node":"<http://www.wikidata.org/entity/Q2>",
            "shape":"<internal://base/wikidata-filmfestival>",
            "status":"conformant",
            "appInfo":"Shaclex",
            "reason":"OK 2"
        }
        ],
    "errors":[],
    "nodesPrefixMap":{},
    "shapesPrefixMap":{"p":"http://www.wikidata.org/prop/" }
  };
  const result2 = {
    "valid":true,
    "type":"Result",
    "message":"Validated",
    "shapeMap":
        [{"node":"<http://www.wikidata.org/entity/Q1>",
          "shape":"<internal://base/wikidata-filmfestival>",
          "status":"conformant",
          "appInfo":"Shaclex",
          "reason":"OK 1"
        },
        {"node":"<http://www.wikidata.org/entity/Q2>",
            "shape":"<internal://base/wikidata-filmfestival>",
            "status":"nonconformant",
            "appInfo":"Shaclex",
            "reason":"Error 2"
        },
        {"node":"<http://www.wikidata.org/entity/Q3>",
            "shape":"<internal://base/wikidata-filmfestival>",
            "status":"nonconformant",
            "appInfo":"Shaclex",
            "reason":"Error 3"
        },
        ],
    "errors":[],
    "nodesPrefixMap":{},
    "shapesPrefixMap":{"p":"http://www.wikidata.org/prop/"}
  };

  const merged = mergeResult(result1,result2);
  expect(merged.shapeMap.length).toEqual(3)
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
