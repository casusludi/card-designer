import { call, put, takeLatest, all } from 'redux-saga/effects';
import { openProjectFromDialog } from '../services/Project';
import { PROJECT_OPEN_SUCCEEDED, PROJECT_OPEN_FAILED, OPEN_PROJECT_FROM_DIALOG } from './types';


function* saga_openProjectFromDialog(action:any){
    try{
        const project = yield call(openProjectFromDialog);
        yield put({
            type: PROJECT_OPEN_SUCCEEDED,
            project
        })
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

export default function* rootSaga() {
    yield all([
        watchOpenProjectFromDialog()
    ])
}