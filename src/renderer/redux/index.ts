
import { combineReducers } from 'redux';
import { createAction } from '@reduxjs/toolkit';
import { ApplicationState } from "..";
import { projectReducer } from "./project";
import { authReducer } from './auth';
import { asError } from '../utils/redux';
import { uiReducer } from './ui';
import { prefReducer } from './preferences';

export const globalShowErrorPopup = createAction<{title:string,message:string}>('global/showErrorPopup');
export const globalAddUncaughtError = createAction('global/addUncaughtError',asError());

export const appReducer =  combineReducers<ApplicationState>({
    project:projectReducer,
    users:authReducer,
    ui:uiReducer,
    preferences: prefReducer
}) 


