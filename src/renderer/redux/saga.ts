import { all,takeEvery } from 'redux-saga/effects';
import projectSaga from './project/saga';
import authSaga from './auth/saga';
import { remote } from 'electron';
import uiSaga from './ui/saga';
import prefSaga from './preferences/saga';



function* watchErrors(){
    yield takeEvery((action:any) => {
        return action.error
    },(action:any) => {
        remote.dialog.showErrorBox('An error occured', action.payload.message)
    })
}

export default function* rootSaga() {
    yield all([
        projectSaga(),
        authSaga(),
        uiSaga(),
        prefSaga(),
        watchErrors()
    ])
}