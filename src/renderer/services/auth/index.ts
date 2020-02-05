

export type AuthServiceMap = {
    [name: string]: AuthService
}


export type AuthService = {
    signIn(): Promise<User>
    signOut(): Promise<Boolean>
    getUserIfExist(): User|null
    getUserStatus(): UserStatus
}

export enum AuthActionName {
    SIGN_OUT,
    SIGN_IN
}

export type AuthAction = {
    id: symbol,
    service: string
    name: AuthActionName
}

export enum AuthEvent {
    User,
    UserStatus
}

export enum UserStatus {
    DISCONNECTED,
    CONNECTED,
    UNKNOW
}

export type User = {
    uid: string,
    email: string,
    name: string,
    tokens: any
}


export type Response = {
    id: symbol,
    user: User | null,
    success: boolean
}

export enum AuthType {
    GOOGLE
}

import makeGoogleAuth from './google';
import { GlobalSettings } from '../../../types';

export function makeAuth(type:AuthType,settings:GlobalSettings):AuthService|null{
    switch(type){
        case AuthType.GOOGLE : makeGoogleAuth(
            settings.googleapi.clientId,
            `${settings.customScheme}:redirect`,
            settings.googleapi.scope
        )
    }
    return null;
}