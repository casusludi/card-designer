import { ApplicationState } from "../..";
import { select, put, takeLatest, all, takeEvery } from "redux-saga/effects";
import { prefLoaded, prefLoadFromLocalStorage, prefAutoRenderFilterChanged, prefEditorWidthChanged, prefProjectExportChanged } from ".";

const preferenceSelect = (state: ApplicationState) => state.preferences

const PREF_KEY = 'preferences';

function* saga_savePrefInLocalStorage() {
    const preferences = yield select(preferenceSelect);
    window.localStorage.setItem(PREF_KEY, JSON.stringify(preferences));
}

function* saga_loadPrefFromLocalStorage() {
    const prefRaw = window.localStorage.getItem(PREF_KEY);
    if (prefRaw) {
        const preferences = JSON.parse(prefRaw);
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


