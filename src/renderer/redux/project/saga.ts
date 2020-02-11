import { call, put, takeLatest, all, takeEvery } from 'redux-saga/effects';
import { openProjectFromDialog, ProjectSourceData } from '../../services/Project';

import { fetchData, getSourceAuthType } from '../../services/Project/Sources';
import AppGlobal from '../../AppGlobal';
import { authUserChanged } from '../auth';
import { projectOpenSucceeded, projectOpenCancelled, projectOpenFailed, projectOpenFromDialog, projectDataChanged, projectFetchDataFailed, projectFetchData } from '.';

function* saga_openProjectFromDialog(action: any) {
    try {
        const project = yield call(openProjectFromDialog);
        if (project) {
            yield put(projectOpenSucceeded({project:project}))
        } else {
            yield put(projectOpenCancelled())
        }
    } catch (e) {
        yield put(projectOpenFailed(e))
    }
}

function* watchOpenProjectFromDialog() {
    yield takeLatest(projectOpenFromDialog.type, saga_openProjectFromDialog)
}

function* saga_fetchData(action: any) {
    try {
        let user = action.payload.user;
        const authType = getSourceAuthType(action.payload.sourceType);
        if (authType) {
            const auth = AppGlobal.getAuth(authType)
            if (auth) {
                const refreshedUser = yield call(auth.refreshToken);
                user = refreshedUser;
                yield put(authUserChanged({authType, user:refreshedUser}));
            }
        }

        const data: ProjectSourceData = yield call(fetchData, action.payload.project, action.payload.sourceType, user)
        yield put(projectDataChanged({sourceType:action.payload.sourceType, data}));
      
    } catch (e) {
        yield put(projectFetchDataFailed(e))
    }
}

function* watchFetchData() {
    yield takeEvery(projectFetchData.type, saga_fetchData);
}

export default function* projectSaga() {
    yield all([
        watchOpenProjectFromDialog(),
        watchFetchData()
    ])
}