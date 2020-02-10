
import { combineReducers } from 'redux'
import { ApplicationState } from "..";
import { projectReducer } from "./project/reducers";
import { authReducer } from './auth/reducers';

export default combineReducers<ApplicationState>({
    project:projectReducer,
    users:authReducer
}) 
