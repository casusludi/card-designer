import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware} from 'redux'
import createSagaMiddleware from 'redux-saga';

import reducers from './redux/reducers';
import rootSaga from './redux/saga';

import '../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import './styles/index.scss';

import settings from '../../settings/globals.json';

import App from './components/App/App';
import { openLastProject, Project } from './services/Project';

export interface ApplicationState{
    project:Project |null
}

async function main() {
    const project = await openLastProject();
    

    const initialState:ApplicationState = {
        project
    }

    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(reducers,initialState,applyMiddleware(sagaMiddleware));
    sagaMiddleware.run(rootSaga);

    ReactDOM.render(
        <Provider store={store}>
            <App settings={settings} />
        </Provider>,
        document.getElementById('app')
    );

}

main();



