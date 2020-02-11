import { createAction, createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Users } from '../..';
import { User, AuthType } from '../../services/Auth';
import { withError } from '../../utils/redux';

export const authSignIn = createAction<{authType:AuthType}>('auth/signIn');
export const authSignInFailed = createAction('auth/signInFailed',withError());
export const authSignOut = createAction<{authType:AuthType}>('auth/signOut');
export const authSignOutFailed = createAction('auth/signOutFailed',withError());
export const authUserChanged = createAction<{user:User, authType:AuthType}>('auth/userChanged');
export const authTokenRefresh = createAction<{authType:AuthType}>('auth/tokenRefresh');
export const authTokenRefreshFailed = createAction('auth/tokenRefreshFailed',withError());

export const authReducer = createReducer<Users>({}, {
    [authUserChanged.type] : (state, action:PayloadAction<{user:User, authType:AuthType}>) => {
        return {
            ...state,
            [action.payload.authType]:action.payload.user
        };
    }
})