import { ApplicationState } from "../..";
import { select, put, takeLatest, all, takeEvery } from "redux-saga/effects";
import { prefLoaded, prefLoadFromLocalStorage, prefAutoRenderFilterChanged, prefEditorWidthChanged, prefProjectExportChanged } from ".";
import { savePrefInLocalStorage, loadPrefFromLocalStorage } from "../../services/Preferences";

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

export default function* prefSaga() {
    yield all([
        yield takeLatest(prefLoadFromLocalStorage.type, saga_loadPrefFromLocalStorage),
        yield takeEvery([
            prefAutoRenderFilterChanged.type, 
            prefEditorWidthChanged.type,
            prefProjectExportChanged.type
        ],saga_savePrefInLocalStorage)
    ])
}


