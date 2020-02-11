
import { combineReducers } from 'redux';
import { createAction } from '@reduxjs/toolkit';
import { ApplicationState } from "..";
import { projectReducer } from "./project";
import { authReducer } from './auth';

export const globalShowErrorPopup = createAction<{title:string,message:string}>('global/showErrorPopup');

export const appReducer =  combineReducers<ApplicationState>({
    project:projectReducer,
    users:authReducer
}) 


