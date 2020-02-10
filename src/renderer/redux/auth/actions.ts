import { AuthActionTypes, AUTH_SIGN_IN, AUTH_SIGN_OUT, AUTH_SET_USER, AUTH_REFRESH } from "./types";
import { AuthType, User } from "../../services/Auth";

export function signIn(authType:AuthType): AuthActionTypes{
    return {
        type: AUTH_SIGN_IN,
        authType
    }
}

export function signOut(authType:AuthType): AuthActionTypes{
    return {
        type: AUTH_SIGN_OUT,
        authType
    }
}

export function setUser(authType:AuthType,user:User): AuthActionTypes{
    return {
        type: AUTH_SET_USER,
        authType,
        user
    }
}

export function authRefresh(authType:AuthType): AuthActionTypes{
    return {
        type: AUTH_REFRESH,
        authType
    }
}



