import { Users } from "../..";
import { AuthActionTypes, AUTH_SET_USER } from "./types";


export function authReducer(state:Users={},action:AuthActionTypes):Users{
    switch(action.type){
        case AUTH_SET_USER:
            return {
                ...state,
                [action.authType]:action.user
            };
    }
    return state;
}
