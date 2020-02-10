import { all, takeLatest } from 'redux-saga/effects';
import projectSaga from './project/saga';
import authSaga from './auth/saga';
import { SHOW_ERROR_POPUP, ShowErrorPopup } from './types';
import { remote } from 'electron';

function* saga_showErrorPopup(action:ShowErrorPopup){
    //console.log("saga_showErrorPopup",action)
    remote.dialog.showErrorBox(action.title, action.message)
}


function* watchShowErrorPopup(){
    yield takeLatest(SHOW_ERROR_POPUP,saga_showErrorPopup)
}


export default function* rootSaga() {
    yield all([
        projectSaga(),
        authSaga(),
        watchShowErrorPopup()
    ])
}