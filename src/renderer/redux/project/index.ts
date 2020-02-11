import { createAction, createReducer, PayloadAction } from '@reduxjs/toolkit'
import { Project, ProjectSourceData } from '../../services/Project'
import { ProjectSourceType } from '../../services/Project/Sources';
import { User } from '../../services/Auth';
import { withError } from '../../utils/redux';


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
export const projectOpenFailed = createAction('project/openFailed',withError());
export const projectOpenCancelled = createAction('project/openCancelled');
export const projectDataChanged = createAction<ProjectDataChangedPayload>('projectData/changed');
export const projectFetchData = createAction<ProjectFetchDataPayload>('projectData/fetch');
export const projectFetchDataFailed = createAction('projectData/fetchFailed',withError());
export const projectConfigChanged = createAction<ProjectFetchDataPayload>('projectConfig/changed');

export const projectReducer = createReducer<Project | null>(null, {
    [projectOpenSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => action.payload.project,
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
    }
})

