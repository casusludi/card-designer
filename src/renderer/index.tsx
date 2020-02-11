import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose} from 'redux'
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import {AuthType, User, UNKNOW_USER} from './services/Auth';
import Global from './AppGlobal';
import {EnumDictionary} from '../types';

import {appReducer, globalAddUncaughtError} from './redux';
import rootSaga from './redux/saga';

import '../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import './styles/index.scss';


import App from './components/App/App';
import { openLastProject, Project } from './services/Project';

export type Users = EnumDictionary<AuthType,User>;

export interface ApplicationState{
    users:Users
    project:Project | null
}


async function main() {
    const project = await openLastProject();

    const googleAuth = Global.getAuth(AuthType.GOOGLE);
    const googleUser = googleAuth?.getUser() || UNKNOW_USER;

    const initialState:ApplicationState = {
        project,
        users:{
            [AuthType.GOOGLE]: googleUser
        }
    }

    const sagaMiddleware = createSagaMiddleware({
        onError(e:Error){
            console.error("Saga error: ")
            console.error(e);  
            store.dispatch(globalAddUncaughtError(e));
        }
    })
    const store = createStore(
        appReducer,
        initialState,
        compose(
            applyMiddleware(sagaMiddleware),
            applyMiddleware(logger)
        ));
    sagaMiddleware.run(rootSaga);

    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('app')
    );

}

main();



