import { all, takeEvery,select, put } from "redux-saga/effects";
import { uiEditorSelectedSourceTypeChanged, uiEditorSelectedDataChanged, uiEditorSelectedTemplateChanged, uiEditorSelectionChanged } from ".";
import { ApplicationState } from "../..";
import { Project } from "../../services/Project";

import _ from "lodash";
import { projectDataChanged, projectOpenSucceeded, projectReloadSucceeded, projectReady } from "../project";
import { AppUIEditor } from "../../components/EditorPanel/EditorPanel";
import { firstKeyOfObject } from "../../utils";
import { ProjectSourceType } from "../../services/Project/Sources";

const selectApp = (state: ApplicationState) => state;
const projectSelect = (state:ApplicationState) => state.project;
const uiEditorSelect = (state:ApplicationState) => state.ui.editor;

function* saga_updateProjectSelectedData(action:any){
    const project:Project = yield select(projectSelect);
    const editor:AppUIEditor = yield select(uiEditorSelect);
    const templateId = editor.selection?.cardType?.id;
    const dataSet = project.data[editor.selectedSourceType]?.data;
    const data = templateId?_.find(dataSet, o => o.id == editor.selection?.cardType?.id):null;
    yield put(uiEditorSelectedDataChanged({
        data
    }))
}

function* saga_initSelectionFromPreference(action:any){
    const app:ApplicationState = yield select(selectApp);
    const preferences = app.preferences;
    const project = app.project;
    if(project){
        const projectPreference = preferences.projects[project?.path];
        if(projectPreference){

            let cardType = _.find(project.cardTypes, o => o.id ==  projectPreference.selection.cardType);
            if(!cardType){
                cardType = project?.cardTypes[firstKeyOfObject(project?.cardTypes)]
            }
            let layout =  _.find(project.layouts, o => o.id ==  projectPreference.selection.layout)
            if(!layout){
                layout = project?.layouts[firstKeyOfObject(project?.layouts)]
            }
            let selectedSourceType = projectPreference.selection.source;
            if(!selectedSourceType){
                selectedSourceType = project?.availablesSources[1] || ProjectSourceType.NONE;
            }

            const data = (cardType && cardType.id) ? _.find(project?.data[selectedSourceType]?.data, o => o.id == cardType?.id) : null

            let pages = projectPreference.selection.pages || []

            yield put(uiEditorSelectionChanged({
                selectedSourceType,
                selection:{
                    cardType,
                    layout,
                    data,
                    pages
                }
            }))
            yield put(projectReady({project}))
        }
    }
}


export default function* uiSaga() {
    yield all([
        yield takeEvery([
            uiEditorSelectedSourceTypeChanged.type,
            uiEditorSelectedTemplateChanged.type,
            projectDataChanged.type
        ],saga_updateProjectSelectedData),
        yield takeEvery([
            projectOpenSucceeded.type,
            projectReloadSucceeded.type
        ],saga_initSelectionFromPreference)
    ])
}