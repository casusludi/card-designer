import { createAction, createReducer, PayloadAction } from '@reduxjs/toolkit'
import { Project, ProjectSourceData, ProjectConfig, ProjectSelection, RenderFilter, ProjectExportState, ProjectCardType, ProjectLayout, ProjectFiles, CardTypeCanvas } from '../../services/Project'
import { ProjectSourceType } from '../../services/Project/Sources';
import { User } from '../../services/Auth';
import { asError } from '../../utils/redux';
import _ from 'lodash';

export type ProjectDataChangedPayload = {
    data: ProjectSourceData,
    sourceType: ProjectSourceType
}

export type ProjectFetchDataPayload = {
    sourceType: ProjectSourceType,
    project: Project,
    user: User|null|undefined
}

export const projectCreateFromTemplate = createAction<{templatePath:string}>('project/createFromTemplate');
export const projectCreateFromTemplateFailed = createAction('project/createFromTemplateFailed',asError());
export const projectOpenFromDialog = createAction('project/openFromDialog');
export const projectOpenFromPath = createAction<{path:string}>('project/openFromPath');
export const projectOpenSucceeded = createAction<{ project: Project }>('project/openSucceeded');
export const projectReloadSucceeded = createAction<{ project: Project }>('project/reloadSucceeded');
export const projectReloadFailed = createAction('project/reloadFailed',asError());
export const projectOpenFailed = createAction('project/openFailed',asError());
export const projectOpenCancelled = createAction('project/openCancelled');
export const projectDataChanged = createAction<ProjectDataChangedPayload>('projectData/changed');
export const projectFetchData = createAction<ProjectFetchDataPayload>('projectData/fetch');
export const projectFetchDataSucceeded = createAction<ProjectDataChangedPayload>('projectData/fetchSucceded');
export const projectFetchDataFailed = createAction('projectData/fetchFailed',asError());
export const projectConfigChanged = createAction<{config:ProjectConfig}>('projectConfig/changed');
export const projectRawConfigChanged = createAction<{rawConfig:string}>('projectRawConfig/changed');

export const projectSaving = createAction('project/saving');
export const projectSavingAs = createAction('project/savingAs');
export const projectSavingFailed = createAction('project/savingFailed',asError());
export const projectSaved = createAction<{project:Project}>('project/saved');
export const projectClosing = createAction<{project:Project}>('project/closing');
export const projectClosed = createAction<{project:Project}>('project/closed');
export const projectReady = createAction<{project:Project}>('project/ready');
export const projectRender = createAction<{selection:ProjectSelection, filter:RenderFilter}>('project/render');
export const projectRenderFailed = createAction<Error>('project/renderFailed'); // Not considered here as a App error
export const projectRendered = createAction('project/rendered');
export const projectExport = createAction<{layoutId:string, sourceType:ProjectSourceType, exportFolderPath:string, cardTypes:Array<string>}>('project/export');
export const projectExportFailed = createAction('project/exportFailed',asError());
export const projectExportStateChanged = createAction<{ state:ProjectExportState }>("project/exportStateChanged");

export const cardTypeRawConfigChanged = createAction<{id:string,rawConfig:string}>('cardTypeRawConfig/changed');
export const cardTypeChanged = createAction<{cardType:ProjectCardType}>('cardType/changed');
export const cardTypeCanvasChanged = createAction<{id:string,canvas:CardTypeCanvas}>('cardTypeCanvas/changed');
export const cardTypeChangeFailed = createAction('cardType/changeFailed',asError());
export const projectLayoutRawConfigChanged = createAction<{id:string,rawConfig:string}>('projectLayoutRawConfig/changed');
export const projectLayoutChanged = createAction<{layout:ProjectLayout}>('projectLayout/changed');
export const projectLayoutChangeFailed = createAction('projectLayout/changeFailed',asError());
export const projectFileChanged = createAction<{fileId:string,content:string}>('projectFile/changed');
export const projectFilesUpdated = createAction<{files:ProjectFiles}>('projectFiles/updated');

export const projectReducer = createReducer<Project | null>(null, {
    [projectOpenSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => action.payload.project,
    [projectReloadSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => action.payload.project,
    [projectClosing.type]: (state, action: PayloadAction<{ project: Project }>) => null,
    [projectDataChanged.type]: (state, action: PayloadAction<ProjectDataChangedPayload>) => {
        if (!state) return null;
        return {
            ...state,
            modified: true,
            data: {
                ...state.data,
                [action.payload.sourceType]: action.payload.data
            }
        }
    },
    [projectConfigChanged.type]: (state, action:PayloadAction<{config:ProjectConfig}>) => {
        if (!state) return null;
        if(_.isEqual(action.payload.config,state.config)) return state;
        return {
            ...state,
            modified: true,
            config: action.payload.config
        }
    },
    [projectRawConfigChanged.type]: (state, action:PayloadAction<{rawConfig:string}>) => {
        if (!state) return null;
        if(_.isEqual(action.payload.rawConfig,state.rawConfig)) return state;
        return {
            ...state,
            modified: true,
            rawConfig: action.payload.rawConfig
        }
    },
    [cardTypeRawConfigChanged.type]: (state, action:PayloadAction<{id:string,rawConfig:string}>) => {
        if (!state) return null;
        const cardType = state.cardTypes[action.payload.id];
        if(!cardType) return state;
        if(_.isEqual(action.payload.rawConfig,cardType.rawConfig)) return state;
        return {
            ...state,
            modified: true,
            cardTypes:{
                ...state.cardTypes,
                [action.payload.id]:{
                    ...cardType,
                    rawConfig: action.payload.rawConfig
                }
            }
        }
    },
    [cardTypeCanvasChanged.type]: (state, action:PayloadAction<{id:string,canvas:CardTypeCanvas}>) => {
        if (!state) return null;
        const cardType = state.cardTypes[action.payload.id];
        if(!cardType) return state;
        if(_.isEqual(action.payload.canvas,cardType.canvas)) return state;
        return {
            ...state,
            modified: true,
            cardTypes:{
                ...state.cardTypes,
                [action.payload.id]:{
                    ...cardType,
                    canvas: action.payload.canvas
                }
            }
        }
    },
    [projectLayoutRawConfigChanged.type]: (state, action:PayloadAction<{id:string,rawConfig:string}>) => {
        if (!state) return null;
        const layout = state.layouts[action.payload.id];
        if(!layout) return state;
        if(_.isEqual(action.payload.rawConfig,layout.rawConfig)) return state;
        return {
            ...state,
            modified: true,
            layouts:{
                ...state.layouts,
                [action.payload.id]:{
                    ...layout,
                    rawConfig: action.payload.rawConfig
                }
            }
        }
    },
    [cardTypeChanged.type]: (state, action:PayloadAction<{cardType:ProjectCardType}>) => {
        if (!state) return null;
        return {
            ...state,
            modified: true,
            cardTypes:{
                ...state.cardTypes,
                [action.payload.cardType.id]:action.payload.cardType
            }
        }
    },
    [projectLayoutChanged.type]: (state, action:PayloadAction<{layout:ProjectLayout}>) => {
        if (!state) return null;
        return {
            ...state,
            modified: true,
            layouts:{
                ...state.layouts,
                [action.payload.layout.id]:action.payload.layout
            }
        }
    },
    [projectFilesUpdated.type]: (state, action:PayloadAction<{files:ProjectFiles}>) => {
        if (!state) return null;
        return {
            ...state,
            modified: true,
            files:{
                ...state.files,
                ...action.payload.files
            }
        }
    },
    [projectSaved.type]: (state,action:PayloadAction<{project:Project}>) => action.payload.project,
    [projectFileChanged.type]: (state,action:PayloadAction<{fileId:string,content:string}>) => {
        if (!state) return null;
        return {
            ...state,
            modified: true,
            files: {
                ...state.files,
                [action.payload.fileId]:{
                    ...state.files[action.payload.fileId],
                    content:action.payload.content
                }
            }
        }
    }
})

