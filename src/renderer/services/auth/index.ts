import makeGoogleAuth from './Google';
import { GlobalSettings, EnumDictionary } from '../../../types';

export type AuthServiceMap = {
    [name: string]: AuthService
}


export type AuthService = {
    signIn(): Promise<User>
    signOut(): Promise<Boolean>
    refreshToken(): Promise<User>
    getUser(): User
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
    name: string,
    tokens: any,
    status: UserStatus
}


export type Response = {
    id: symbol,
    user: User | null,
    success: boolean
}

export enum AuthType {
    GOOGLE = "GOOGLE"
}

export const UNKNOW_USER:User = {
    uid:"",
    name:"",
    tokens:{
        
    },
    status: UserStatus.DISCONNECTED
}

export type AuthServices = EnumDictionary<AuthType,AuthService|null>;


export function makeAuth(type:AuthType,settings:GlobalSettings):AuthService|null{
    switch(type){
        case AuthType.GOOGLE : return makeGoogleAuth(
            settings.googleapi.clientId,
            `${settings.customScheme}:redirect`,
            settings.googleapi.scope
        )
    }
    return null;
}

export function makeAuthManager(settings:GlobalSettings): (type:AuthType) => AuthService|null|undefined {
    const services:AuthServices = {}

    return function getAuth(type:AuthType) : AuthService | null | undefined{
        if(!services[type]){
            services[type] = makeAuth(type,settings);
        }
        return services[type];
    }
}