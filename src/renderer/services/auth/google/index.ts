import { parse } from 'url'
import { remote } from 'electron'
import axios from 'axios'
import qs from 'qs';
import {google,sheets_v4} from 'googleapis';
import { User, UserStatus } from '..';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'

const USER_STORAGE_KEY:string = `google:user`;

async function signIn(clientId:string,redirectUri:string,scope:string):Promise<User> {

    const userRaw:string|null = localStorage.getItem(USER_STORAGE_KEY);
    if(!userRaw){
        const code:any = await signInWithPopup(clientId,redirectUri,scope)
        const tokens = await fetchAccessTokens(code,clientId,redirectUri)
        const { id, email, name } = await fetchGoogleProfile(tokens.access_token);
        
        const providerUser:User = {
            uid: id,
            email,
            name,
            tokens
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

function getUserStatus():UserStatus{
    return localStorage.getItem(USER_STORAGE_KEY)?UserStatus.CONNECTED:UserStatus.DISCONNECTED;
}

function getUserIfExist():User|null{
    const userRaw:string|null = localStorage.getItem(USER_STORAGE_KEY);
    if(userRaw){
        return JSON.parse(userRaw);
    }
    return null;
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

async function fetchGoogleProfile(accessToken:string) {
    const response = await axios.get(GOOGLE_PROFILE_URL, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    return response.data
}

export async function getSpreadSheets(tokens:any){
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    const sheets = new sheets_v4.Sheets({auth:oauth2Client});
    sheets.spreadsheets.get({
        spreadsheetId: '1PUqBcaJnlpFxFWzJX6ZxAJX049_1uPjPGp1S5vpX4M0'
    }).then(function(response) {
        console.log(response)
    }, function(response) {
        console.log('Error: ' + response.result.error.message);
    });
    /*sheets.spreadsheets.values.get({
        spreadsheetId: '1PUqBcaJnlpFxFWzJX6ZxAJX049_1uPjPGp1S5vpX4M0',
        range:'talents!A2:E'
      }, (err:any, res:any) => {
        if(err) return console.log(err);
        console.log('sheet results',res);

    });*/
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
            getUserStatus,
            getUserIfExist
        }
}