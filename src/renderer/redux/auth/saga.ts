import { call, put, all, takeEvery } from 'redux-saga/effects';
import { AuthSignIn, AUTH_SIGN_IN, AUTH_SIGN_OUT_SUCCEEDED, AUTH_SIGN_OUT_FAILED, AUTH_SIGN_IN_FAILED, AUTH_SIGN_IN_SUCCEEDED, AuthSignOut, AUTH_SIGN_OUT, AuthActionTypes, AUTH_REFRESH_FAILED, AUTH_REFRESH, AUTH_REFRESH_SUCCEEDED } from './types';
import { makeAuthManager, UNKNOW_USER } from '../../services/Auth';
import settings from '../../../../settings/globals.json';
import { setUser } from './actions';
import AppGlobal from '../../AppGlobal';

const getAuth = makeAuthManager(settings)

function* saga_signIn(action:AuthSignIn){
    try{
        const auth = getAuth(action.authType);
        if(auth){
            const user = yield call(auth.signIn);
            yield put(setUser(action.authType,user))
            yield put({
                type: AUTH_SIGN_IN_SUCCEEDED,
                user
            })
        }else{
            throw new Error(`${action.authType} is not a valid auth service`);
        }

    }catch(e){
        yield put({
            type: AUTH_SIGN_IN_FAILED,
            message:e.message
        })
    }
}


function* watchSignIn(){    
    yield takeEvery(AUTH_SIGN_IN,saga_signIn);
}


function* saga_signOut(action:AuthSignOut){
    try{
        const auth = getAuth(action.authType);
        if(auth){
            yield call(auth.signOut);
            yield put(setUser(action.authType,UNKNOW_USER))
            yield put({
                type:AUTH_SIGN_OUT_SUCCEEDED
            })
            
        }
    }catch(e){
        yield put({
            type: AUTH_SIGN_OUT_FAILED,
            message:e.message
        })
    }
}

function* watchSignOut(){    
    yield takeEvery(AUTH_SIGN_OUT,saga_signOut);
}

function* saga_authRefresh(action:AuthActionTypes){
    try{
        const auth = AppGlobal.getAuth(action.authType);
        if(auth){
            const user = yield call(auth.refreshToken);
            yield put(setUser(action.authType,user))
            yield put({
                type: AUTH_REFRESH_SUCCEEDED,
                user
            })
        }
    }catch(e){
        yield put({
           type:AUTH_REFRESH_FAILED,
           message:e.message 
        })
    }
}

function* watchAuthRefresh(){
    yield takeEvery(AUTH_REFRESH,saga_authRefresh)
}

export default function* authSaga(){
    yield all([
        watchSignIn(),
        watchSignOut(),
        watchAuthRefresh()
    ])
}