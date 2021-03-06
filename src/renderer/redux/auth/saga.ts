import { call, put, all, takeEvery } from 'redux-saga/effects';
import { makeAuthManager, UNKNOW_USER } from '../../services/Auth';
import settings from '../../../../settings/globals.json';

import AppGlobal from '../../AppGlobal';
import { authUserChanged, authSignInFailed, authSignIn, authSignOutFailed, authTokenRefreshFailed, authTokenRefresh, authSignOut } from '.';

const getAuth = makeAuthManager(settings)

function* saga_signIn(action: any) {
    try {
        const auth = getAuth(action.payload.authType);
        if (auth) {
            const user = yield call(auth.signIn);
            yield put(authUserChanged({
                authType:action.payload.authType, 
                user:user
            }))
        } else {
            throw new Error(`${action.payload.authType} is not a valid auth service`);
        }

    } catch (e) {
        yield put(authSignInFailed(e))
    }
}

function* saga_signOut(action: any) {
    try {
        const auth = getAuth(action.payload.authType);
        if (auth) {
            yield call(auth.signOut);
            yield put(authUserChanged({
                authType:action.payload.authType, 
                user:UNKNOW_USER
            }))
        }
    } catch (e) {
        yield put(authSignOutFailed(e))
    }
}


function* saga_authRefresh(action: any) {
    try {
        const auth = AppGlobal.getAuth(action.payload.authType);
        if (auth) {
            const user = yield call(auth.refreshToken);
            yield put(authUserChanged({
                authType:action.payload.authType, 
                user:user
            }))
        }
    } catch (e) {
        yield put(authTokenRefreshFailed(e))
    }
}


export default function* authSaga() {
    yield all([
        yield takeEvery(authSignIn.type, saga_signIn),
        yield takeEvery(authSignOut.type, saga_signOut),
        yield takeEvery(authTokenRefresh.type, saga_authRefresh)
    ])
}