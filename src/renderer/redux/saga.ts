import { call, put, takeLatest, all } from 'redux-saga/effects';
import { openProjectFromDialog } from '../services/Project';
import { PROJECT_OPEN_SUCCEEDED, PROJECT_OPEN_FAILED, OPEN_PROJECT_FROM_DIALOG, PROJECT_OPEN_CANCELLED, SHOW_ERROR_POPUP, ProjectOpenFailed, ShowErrorPopup } from './types';
import { remote } from 'electron';

function* saga_openProjectFromDialog(action:any){
    try{
        const project = yield call(openProjectFromDialog);
        if(project){
            yield put({
                type: PROJECT_OPEN_SUCCEEDED,
                project
            })
        }else{
            yield put({
                type: PROJECT_OPEN_CANCELLED
            })
        }
    }catch(e){
        yield put({
            type: PROJECT_OPEN_FAILED,
            message: e.message
        })
    }
}

function* watchOpenProjectFromDialog(){
    yield takeLatest(OPEN_PROJECT_FROM_DIALOG,saga_openProjectFromDialog)
}

function* saga_projectOpenFailed(action:ProjectOpenFailed){
    yield put({
        type:SHOW_ERROR_POPUP,
        title:'Invalid Carmaker Project',
        message: action.message
    })
}

function* watchProjectOpenFailed(){
    yield takeLatest(PROJECT_OPEN_FAILED,saga_projectOpenFailed)
}

function* saga_showErrorPopup(action:ShowErrorPopup){
    //console.log("saga_showErrorPopup",action)
    remote.dialog.showErrorBox(action.title, action.message)
}

function* watchShowErrorPopup(){
    yield takeLatest(SHOW_ERROR_POPUP,saga_showErrorPopup)
}

export default function* rootSaga() {
    yield all([
        watchOpenProjectFromDialog(),
        watchProjectOpenFailed(),
        watchShowErrorPopup()
    ])
}