import { call, put, takeLatest, all, takeEvery } from 'redux-saga/effects';
import { openProjectFromDialog, ProjectSourceData } from '../../services/Project';
import { PROJECT_OPEN_SUCCEEDED, PROJECT_OPEN_FAILED, OPEN_PROJECT_FROM_DIALOG, PROJECT_OPEN_CANCELLED, ProjectOpenFailed, ProjectActionTypes, ProjectFetchData, PROJECT_FETCH_DATA, PROJECT_FETCH_DATA_SUCCEEDED } from './types';
import { remote } from 'electron';
import { SHOW_ERROR_POPUP, ShowErrorPopup } from '../types';
import { ProjectSourceType, fetchData, getSourceAuthType } from '../../services/Project/Sources';
import { authRefresh, setUser } from '../auth/actions';
import { AuthType } from '../../services/Auth';
import AppGlobal from '../../AppGlobal';
import { setData } from './actions';

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

function* saga_fetchData(action:ProjectFetchData){
    try{
        const authType = getSourceAuthType(action.sourceType);
        const auth = AppGlobal.getAuth(authType)
        let user = action.user;
        if(auth){
            const refreshedUser = yield call(auth.refreshToken);
            user = refreshedUser;
            yield put(setUser(authType,refreshedUser));
        }

        const data:ProjectSourceData = yield call(fetchData,action.project,action.sourceType,user)
        yield put(setData(action.sourceType,data));
        yield put({
            type:PROJECT_FETCH_DATA_SUCCEEDED,
            data
        })
    }catch(e){
        yield put({
            type: PROJECT_FETCH_DATA,
            message: e.message
        })
    }
}

function* watchFetchData(){
    yield takeEvery(PROJECT_FETCH_DATA,saga_fetchData);
}

export default function* projectSaga() {
    yield all([
        watchOpenProjectFromDialog(),
        watchProjectOpenFailed(),
        watchFetchData()
    ])
}