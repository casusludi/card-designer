import { ApplicationState } from "../..";
import { select, put, takeLatest, all, takeEvery } from "redux-saga/effects";
import { prefLoaded, prefLoadFromLocalStorage, prefAutoRenderFilterChanged, prefEditorWidthChanged, prefProjectExportChanged, prefProjectSelectionChanged } from ".";
import { savePrefInLocalStorage, loadPrefFromLocalStorage } from "../../services/Preferences";
import { uiEditorSelectedCardTypeChanged, uiEditorSelectedSourceTypeChanged, uiEditorSelectedPagesChanged, uiEditorSelectedLayoutChanged } from "../ui";

const selectApp = (state: ApplicationState) => state;
const preferenceSelect = (state: ApplicationState) => state.preferences

function* saga_savePrefInLocalStorage() {
    const preferences = yield select(preferenceSelect);
    savePrefInLocalStorage(preferences)
}

function* saga_loadPrefFromLocalStorage() {
    const preferences = loadPrefFromLocalStorage();
    if (preferences) {
        yield put(prefLoaded({ preferences }));
    }
}

function* saga_projectSelectionChanged(){
    const app:ApplicationState = yield select(selectApp);
    const projectPath = app.project?.path;
    const selection = app.ui.editor.selection
    if(projectPath){
        yield put(prefProjectSelectionChanged({
            projectPath,
            selection:{
                cardType: selection?.cardType?.id,
                layout: selection?.layout?.id,
                source: app.ui.editor.selectedSourceType,
                pages: selection?.pages || []
            }
        }))
    }
}

export default function* prefSaga() {
    yield all([
        yield takeLatest(prefLoadFromLocalStorage.type, saga_loadPrefFromLocalStorage),
        yield takeEvery([
            prefAutoRenderFilterChanged.type, 
            prefEditorWidthChanged.type,
            prefProjectExportChanged.type,
            prefProjectSelectionChanged.type
        ],saga_savePrefInLocalStorage),
        yield takeEvery([
            uiEditorSelectedLayoutChanged.type, 
            uiEditorSelectedPagesChanged.type,
            uiEditorSelectedSourceTypeChanged.type,
            uiEditorSelectedCardTypeChanged.type
        ],saga_projectSelectionChanged)
    ])
}


