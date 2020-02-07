import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducers from './redux/reducers'

import '../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import './styles/index.scss';

import settings from '../../settings/globals.json';

import App from './components/App/App';
import { openLastProject } from './services/Project';

async function main() {
    const project = await openLastProject();

    const store = createStore(reducers);
    ReactDOM.render(
        <Provider store={store}>
            <App settings={settings} project={project} />
        </Provider>,
        document.getElementById('app')
    );

}

main();



