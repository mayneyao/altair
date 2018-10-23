import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


const wasm = import("./pkg/wasm_gif.js");

wasm.then(wasm => {
	ReactDOM.render(<App wasm={wasm}/>, document.getElementById('root'));
});
registerServiceWorker();
