import { all, takeLatest, takeEvery } from 'redux-saga/effects';
import projectSaga from './project/saga';
import authSaga from './auth/saga';
import { remote } from 'electron';
import { globalShowErrorPopup } from '.';

function* saga_showErrorPopup(action:any){
    //console.log("saga_showErrorPopup",action)
    remote.dialog.showErrorBox(action.payload.title, action.payload.message)
}


function* watchShowErrorPopup(){
   // yield takeLatest(globalShowErrorPopup.type,saga_showErrorPopup)
}

function* watchErrors(){
    yield takeEvery((action:any) => {
        console.log("watchErrors",action)
        return action.error
    },(action:any) => {
        remote.dialog.showErrorBox('An error occured', action.payload.message)
    })
}

export default function* rootSaga() {
    yield all([
        projectSaga(),
        authSaga(),
        watchShowErrorPopup(),
        watchErrors()
    ])
}