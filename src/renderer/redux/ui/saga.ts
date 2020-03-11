import { all, takeEvery,select, put } from "redux-saga/effects";
import {  uiEditorSelectionChanged } from ".";
import { ApplicationState } from "../..";


import _ from "lodash";
import {  projectOpenSucceeded, projectReloadSucceeded, projectReady } from "../project";
import { firstKeyOfObject } from "../../utils";
import { ProjectSourceType } from "../../services/Project/Sources";


const selectApp = (state: ApplicationState) => state;



function* saga_initSelectionFromPreference(action:any){
    const app:ApplicationState = yield select(selectApp);
    const preferences = app.preferences;
    const project = app.project;
    if(project){
        const projectPreference = preferences.projects[project?.path];
        const previousSelection = projectPreference?.selection;

        let cardType = previousSelection?_.find(project.cardTypes, o => o.id ==  previousSelection.cardTypeId):null;
        if(!cardType){
            cardType = project?.cardTypes[firstKeyOfObject(project?.cardTypes)]
        }
        let layout =  previousSelection?_.find(project.layouts, o => o.id ==  previousSelection.layoutId):null
        if(!layout){
            layout = project?.layouts[firstKeyOfObject(project?.layouts)]
        }
        let sourceType = previousSelection?.sourceType;
        if(!sourceType){
            sourceType = project?.availablesSources[1] || ProjectSourceType.NONE;
        }

      
        let pages = previousSelection?.pages || []

        yield put(uiEditorSelectionChanged({
            selection:{
                cardTypeId:cardType.id,
                layoutId:layout.id,
                sourceType,
                pages
            }
        }))
        yield put(projectReady({project}))
        
    }
}

export default function* uiSaga() {
    yield all([
        yield takeEvery([
            projectOpenSucceeded.type,
            projectReloadSucceeded.type
        ],saga_initSelectionFromPreference)
    ])
}