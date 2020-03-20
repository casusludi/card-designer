import './assets';

import MouseTrap from 'mousetrap';
MouseTrap.bind('mod+shift+i',() => {
    openDevTools()
})

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose} from 'redux'
import {createLogger} from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import {AuthType, User, UNKNOW_USER} from './services/Auth';
import Global from './AppGlobal';
import {EnumDictionary} from '../types';

import {appReducer, globalAddUncaughtError} from './redux';
import rootSaga from './redux/saga';

import '../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import './styles/index.scss';
import { openLastProject, Project } from './services/Project';
import App, { AppUI } from './components/App';

import _ from 'lodash';

import { projectSaving, projectOpenSucceeded } from './redux/project';

import { authUserChanged } from './redux/auth';
import { prefLoadFromLocalStorage } from './redux/preferences';
import { openDevTools } from './utils';
import { Preferences } from './services/Preferences';


export type Users = EnumDictionary<AuthType,User>;

export interface ApplicationState{
    users:Users
    project:Project | null,
    ui:AppUI,
    preferences:Preferences
}

async function main() {

    const sagaMiddleware = createSagaMiddleware({
        onError(e:Error){
            console.error("Saga error: ")
            console.error(e);  
            store.dispatch(globalAddUncaughtError(e));
        }
    })

    const logger = createLogger({
        collapsed: true
    })

    const store = createStore(
        appReducer,
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

    /**
     * This shortcut is also defined in CodeEditor.tsx (Ace Editor dont propagate the key event)
     * @TODO find a better implementation 
     */
    MouseTrap.bind('mod+s',() => {
        store.dispatch(projectSaving())
    })

    store.dispatch(prefLoadFromLocalStorage());
    const project = await openLastProject();
    const googleAuth = Global.getAuth(AuthType.GOOGLE);

    if(project)store.dispatch(projectOpenSucceeded({project}))
    store.dispatch(authUserChanged({authType:AuthType.GOOGLE, user:googleAuth?.getUser() || UNKNOW_USER}));

}

main();



