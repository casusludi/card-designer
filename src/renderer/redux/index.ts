
import { combineReducers } from 'redux';
import { createAction } from '@reduxjs/toolkit';
import { ApplicationState } from "..";
import { projectReducer } from "./project";
import { authReducer } from './auth';
import { withError } from '../utils/redux';

export const globalShowErrorPopup = createAction<{title:string,message:string}>('global/showErrorPopup');
export const globalAddUncaughtError = createAction('global/addUncaughtError',withError());

export const appReducer =  combineReducers<ApplicationState>({
    project:projectReducer,
    users:authReducer
}) 


