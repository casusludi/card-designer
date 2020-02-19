import { createAction, createReducer, PayloadAction } from '@reduxjs/toolkit'
import { Project, ProjectSourceData, ProjectConfig, ProjectSelection, RenderFilter, ProjectExportState } from '../../services/Project'
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

export const projectOpenFromDialog = createAction('project/openFromDialog');
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
export const projectFileChanged = createAction<{fileId:string,content:string}>('projectFile/changed');
export const projectSaving = createAction('project/saving');
export const projectSavingFailed = createAction('project/savingFailed',asError());
export const projectSaved = createAction('project/saved');
export const projectRender = createAction<{selection:ProjectSelection, filter:RenderFilter}>('project/render');
export const projectRenderFailed = createAction('project/renderFailed',asError());
export const projectRendered = createAction('project/rendered');
export const projectExport = createAction<{layoutId:string, sourceType:ProjectSourceType, exportFolderPath:string}>('project/export');
export const projectExportFailed = createAction('project/exportFailed',asError());
export const projectExportStateChanged = createAction<{ state:ProjectExportState }>("project/exportStateChanged");

export const projectReducer = createReducer<Project | null>(null, {
    [projectOpenSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => action.payload.project,
    [projectReloadSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => action.payload.project,
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
    [projectSaved.type]: (state,action) => (state?{...state, modified:false}:null),
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

