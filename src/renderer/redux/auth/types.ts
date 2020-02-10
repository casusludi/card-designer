
import { AuthType, User } from "../../services/Auth";

export const AUTH_GET_STORED_USER = "AUTH_GET_STORED_USER";
export const AUTH_SET_USER = "AUTH_SET_USER";
export const AUTH_SIGN_IN = "AUTH_SIGN_IN";
export const AUTH_SIGN_OUT = "AUTH_SIGN_OUT";
export const AUTH_SIGN_IN_SUCCEEDED = "AUTH_SIGN_IN_SUCCEEDED";
export const AUTH_SIGN_IN_FAILED = "AUTH_SIGN_IN_FAILED";
export const AUTH_SIGN_OUT_SUCCEEDED = "AUTH_SIGN_OUT_SUCCEEDED";
export const AUTH_SIGN_OUT_FAILED = "AUTH_SIGN_OUT_FAILED";
export const AUTH_REFRESH = "AUTH_REFRESH";
export const AUTH_REFRESH_FAILED = "AUTH_REFRESH_FAILED";
export const AUTH_REFRESH_SUCCEEDED = "AUTH_REFRESH_SUCCEEDED";

export interface AuthGetStoredUser {
    type: typeof AUTH_GET_STORED_USER,
    authType:AuthType,
    user:User
}

export interface AuthSetUser {
    type: typeof AUTH_SET_USER,
    authType:AuthType,
    user:User
}

export interface AuthSignIn {
    type: typeof AUTH_SIGN_IN,
    authType:AuthType
}

export interface AuthSignOut {
    type: typeof AUTH_SIGN_OUT,
    authType:AuthType
}

export interface AuthRefresh {
    type: typeof AUTH_REFRESH,
    authType:AuthType
}

export type AuthActionTypes = AuthSetUser | AuthGetStoredUser | AuthSignIn | AuthSignOut | AuthRefresh