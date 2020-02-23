import { all, takeEvery,select, put } from "redux-saga/effects";
import { uiEditorSelectedSourceTypeChanged, uiEditorSelectedDataChanged, uiEditorSelectedTemplateChanged } from ".";
import { ApplicationState } from "../..";
import { Project } from "../../services/Project";

import _ from "lodash";
import { projectDataChanged } from "../project";
import { AppUIEditor } from "../../components/EditorPanel/EditorPanel";

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



export default function* uiSaga() {
    yield all([
        yield takeEvery([
            uiEditorSelectedSourceTypeChanged.type,
            uiEditorSelectedTemplateChanged.type,
            projectDataChanged.type
        ],saga_updateProjectSelectedData)
    ])
}