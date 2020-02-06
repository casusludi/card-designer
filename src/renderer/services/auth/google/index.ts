import { parse } from 'url'
import { remote } from 'electron'
import axios from 'axios'
import qs from 'qs';

import { User, UserStatus, UNKNOW_USER } from '../index';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
//const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'

const USER_STORAGE_KEY:string = `google:user`;


async function signIn(clientId:string,redirectUri:string,scope:string):Promise<User> {

    const userRaw:string|null = localStorage.getItem(USER_STORAGE_KEY);
    if(!userRaw){
        const code:any = await signInWithPopup(clientId,redirectUri,scope)
        const tokens = await fetchAccessTokens(code,clientId,redirectUri)
        const { id, name } = await fetchGoogleProfile(tokens.access_token);
        
        const providerUser:User = {
            uid: id,
            name,
            tokens,
            status: UserStatus.CONNECTED
        }
        localStorage.setItem(USER_STORAGE_KEY,JSON.stringify(providerUser));
        return providerUser
    }else{
        return JSON.parse(userRaw);
    }
    //getSpreadSheets(tokens);
}

async function signOut():Promise<boolean>{

    if(!localStorage.getItem(USER_STORAGE_KEY)) return false;
    localStorage.removeItem(USER_STORAGE_KEY);
    return true;
}

function getUser():User{
    const userRaw:string|null = localStorage.getItem(USER_STORAGE_KEY);
    if(userRaw){
        return JSON.parse(userRaw);
    }
    return UNKNOW_USER
}


function signInWithPopup(clientId:string,redirectUri:string,scope:string) {
    return new Promise((resolve, reject) => {

        const authWindow = new remote.BrowserWindow({
            width: 500,
            height: 600,
            show: true,
        })

        // TODO: Generate and validate PKCE code_challenge value
        const urlParams = {
            response_type: 'code',
            redirect_uri: redirectUri,
            client_id: clientId,
            scope,
        }

        const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`

        function handleNavigation(url:string) {
            const query = parse(url, true).query
            if (query) {
                if (query.error) {
                    reject(new Error(`There was an error: ${query.error}`))
                } else if (query.code) {
                    // Login is complete
                    authWindow.removeAllListeners('closed')
                    setImmediate(() => authWindow.close())
        
                    // This is the authorization code we need to request tokens
                    resolve(query.code)
                }
            }
        }

        authWindow.webContents.on('will-navigate', (event, url) => {
            handleNavigation(url)
        })

        authWindow.loadURL(authUrl)
    })
}

async function fetchAccessTokens(code:string,clientId:string,redirectUri:string) {
    const response = await axios.post(GOOGLE_TOKEN_URL, qs.stringify({
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
    }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
    return response.data
}

async function refreshAccessToken(refreshToken:string,clientId:string) {
    const response = await axios.post(GOOGLE_TOKEN_URL, qs.stringify({
        refresh_token:refreshToken,
        client_id: clientId,
        grant_type: 'refresh_token',
    }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
    return response.data
}

async function refreshAccessTokenWithUser(user:User, clientId:string):Promise<User>{
    const {refresh_token} = user.tokens;
    if(refresh_token){
        const result = await refreshAccessToken(refresh_token,clientId);
        user.tokens.access_token = result.access_token;
        user.tokens.expires_in = result.expires_in;
        localStorage.setItem(USER_STORAGE_KEY,JSON.stringify(user));
     
    }else{
        throw new Error("refreshAccessTokenWithUser: Invalid User")
    }
    return user;
}

async function fetchGoogleProfile(accessToken:string) {
    const response = await axios.get(GOOGLE_PROFILE_URL, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    return response.data
}

import { AuthService } from "..";

export default function makeGoogleAuth(
    clientId:string,
    redirectUrl:string,
    scope:string
    ):AuthService{
        
        return {
            signIn:()=> signIn(clientId,redirectUrl,scope),
            signOut,
            refreshToken: () => refreshAccessTokenWithUser(getUser(),clientId),
            getUser
        }
}