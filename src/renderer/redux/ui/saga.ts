import { all, takeEvery,select, put } from "redux-saga/effects";
import { uiEditorSelectedSourceTypeChanged, uiEditorSelectedDataChanged, uiEditorSelectedTemplateChanged } from ".";
import { ApplicationState } from "../..";
import { Project } from "../../services/Project";
import { AppUIEditor } from "../../components/App/App";
import _ from "lodash";

const projectSelect = (state:ApplicationState) => state.project;
const uiEditorSelect = (state:ApplicationState) => state.ui.editor;

function* saga_updateProjectSelectedData(action:any){
    const project:Project = yield select(projectSelect);
    const editor:AppUIEditor = yield select(uiEditorSelect);
    const templateId = editor.selection?.template?.id;
    const dataSet = project.data[editor.selectedSourceType]?.data;
    const data = templateId?_.find(dataSet, o => o.id == editor.selection?.template?.id):null;
    yield put(uiEditorSelectedDataChanged({
        data
    }))
}



export default function* uiSaga() {
    yield all([
        yield takeEvery(uiEditorSelectedSourceTypeChanged.type,saga_updateProjectSelectedData),
        yield takeEvery(uiEditorSelectedTemplateChanged.type,saga_updateProjectSelectedData)
    ])
}