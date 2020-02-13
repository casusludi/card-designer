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


import App, { AppUI } from './components/App/App';
import { openLastProject, Project } from './services/Project';
import _ from 'lodash';
import { firstKeyOfObject } from './utils';
import { ProjectSourceType } from './services/Project/Sources';
import MouseTrap from 'mousetrap';
import { projectSaving } from './redux/project';


export type Users = EnumDictionary<AuthType,User>;

export interface ApplicationState{
    users:Users
    project:Project | null,
    ui:AppUI
}


async function main() {
    const project = await openLastProject();

    const googleAuth = Global.getAuth(AuthType.GOOGLE);
    const googleUser = googleAuth?.getUser() || UNKNOW_USER;

    const selectedTemplate = project?.templates[firstKeyOfObject(project?.templates)]
    const selectedSourceType = ProjectSourceType.GSHEETS;

    const initialState:ApplicationState = {
        project,
        users:{
            [AuthType.GOOGLE]: googleUser
        },
        ui:{
            editor:{
                selectedSourceType,
                selection:{
                    template:selectedTemplate,
                    layout: project?.layouts[firstKeyOfObject(project?.layouts)],
                    data: (selectedTemplate && selectedTemplate.id)?_.find(project?.data[selectedSourceType]?.data,o => o.id == selectedTemplate.id):null
                }
            },
            preview:{
                pdf:null,
                htmlUrl:null
            }
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

    /**
     * This shortcut is also defined in CodeEditor.tsx (Ace Editor dont propagate the key event)
     * @TODO find a better implementation 
     */
    MouseTrap.bind('mod+s',() => {
        store.dispatch(projectSaving())
    })

}

main();



