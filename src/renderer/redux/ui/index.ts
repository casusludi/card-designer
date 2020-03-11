import { createAction, createReducer, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import {  Project, ProjectExportStatus, ProjectExportState, ProjectPageSelection,  ProjectSelection } from '../../services/Project';
import { PDFSource } from '../../components/PreviewPanel/PDFViewer/PDFDocument';
import { AppUI, AppUIOthers } from '../../components/App/App';
import { ProjectSourceType, FetchDataStatus } from '../../services/Project/Sources';
import { projectOpenSucceeded, projectExportStateChanged, projectFetchData, projectFetchDataFailed, ProjectFetchDataPayload, projectFetchDataSucceeded, ProjectDataChangedPayload, projectRenderFailed, projectRendered, projectClosing} from '../project';

import _ from 'lodash';
import { AppUIEditor } from '../../components/EditorPanel/EditorPanel';
import { AppUIPreview } from '../../components/PreviewPanel/PreviewPanel';
import { AppUIExport } from '../../components/EditorPanel/ExportEditor/ExportEditor';

export const uiEditorSelectedCardTypeChanged = createAction<{ cardTypeId: string }>("uiEditor/selectedTemplateChanged");
export const uiEditorSelectedLayoutChanged = createAction<{ layoutId: string }>("uiEditor/selectedLayoutChanged");
export const uiEditorSelectedSourceTypeChanged = createAction<{ sourceType: ProjectSourceType }>("uiEditor/selectedSourceTypeChanged");
export const uiEditorSelectedPagesChanged = createAction<{ pages:ProjectPageSelection }>("uiEditor/selectedPagesChanged");
export const uiEditorSelectionChanged = createAction<{ selection:ProjectSelection }>("uiEditor/selectionChanged");
export const uiPreviewPdfChanged = createAction<{ pdf: PDFSource, renderTime?: number }>("uiPreview/pdfChanged");
export const uiPreviewHtmlUrlChanged = createAction<{ htmlUrl: string | null }>("uiPreview/htmlUrlChanged");

export const uiEditorReducer = createReducer<AppUIEditor>({
    selection: null,
    lastError: null,
}, {
    [projectClosing.type]: (state, action: PayloadAction<{ project: Project }>) => {
        return {
            ...state,
            selection: {
                cardTypeId: null,
                layoutId: null,
                sourceType: ProjectSourceType.NONE,
                pages:[]
            }
        }
    },
    [uiEditorSelectedCardTypeChanged.type]: (state, action: PayloadAction<{ cardTypeId: string }>) => {
        return {
            ...state,
            selection: {
                layoutId: state.selection?.layoutId,
                sourceType: state.selection?.sourceType,
                cardTypeId: action.payload.cardTypeId,
                pages:state.selection?.pages || []
            }

        }
    },
    [uiEditorSelectedLayoutChanged.type]: (state, action: PayloadAction<{ layoutId: string }>) => {

        return {
            ...state,
            selection: {
                layoutId: action.payload.layoutId,
                sourceType: state.selection?.sourceType,
                cardTypeId: state.selection?.cardTypeId,
                pages:state.selection?.pages || []
            }

        }
    },
    [uiEditorSelectedPagesChanged.type]: (state, action: PayloadAction<{ pages: ProjectPageSelection }>) => {
        return {
            ...state,
            selection: {
                layoutId: state.selection?.layoutId,
                sourceType: state.selection?.sourceType,
                cardTypeId: state.selection?.cardTypeId,
                pages:action.payload.pages
            }

        }
    },
    [uiEditorSelectionChanged.type]: (state, action: PayloadAction<{ selection:ProjectSelection }>) => {
        return {
            ...state,
            selection: action.payload.selection
        }
    },
    [uiEditorSelectedSourceTypeChanged.type]: (state, action: PayloadAction<{ sourceType: ProjectSourceType }>) => {
        return {
            ...state,
            selection: {
                layoutId: state.selection?.layoutId,
                sourceType: action.payload.sourceType,
                cardTypeId: state.selection?.cardTypeId,
                pages:state.selection?.pages || []
            }
        }
    },
    [projectRenderFailed.type]: (state, action: PayloadAction<Error>) => {
        return {
            ...state,
            lastError: action.payload
        }
    },
    [projectRendered.type]: (state, action: any) => {
        return {
            ...state,
            lastError: null
        }
    }
})



export const uiPreviewReducer = createReducer<AppUIPreview>({
    pdf: null,
    pdfLastRenderTime: 0,
    htmlUrl: null
}, {
    [projectOpenSucceeded.type]: (state, action: PayloadAction<{ project: Project }>): any => {
        return {
            pdf: null,
            htmlUrl: null,
            pdfLastRenderTime: null
        }
    },
    [uiPreviewPdfChanged.type]: (state, action: PayloadAction<{ pdf: PDFSource, renderTime?: number }>) => {
        return {
            ...state,
            pdf: action.payload.pdf,
            pdfLastRenderTime: action.payload.renderTime || null
        }
    },
    // TS crash à la gueule pour je ne sais quelle raison encore
    // J'ai un state:any en attendant
    [uiPreviewHtmlUrlChanged.type]: (state: any, action: PayloadAction<{ htmlUrl: string }>) => {
        return {
            ...state,
            htmlUrl: action.payload.htmlUrl
        }
    }
})


export const uiExportReducer = createReducer<AppUIExport>({
    exportProgress: {
        status: ProjectExportStatus.NONE,
        rate: 0
    }
}, {
    [projectExportStateChanged.type]: (state, action: PayloadAction<{ state: ProjectExportState }>): any => {
        return {
            ...state,
            exportProgress: {
                ...state.exportProgress,
                status: action.payload.state.status,
                rate: action.payload.state.rate
            }
        }
    }
})

export const uiOthersReducer = createReducer<AppUIOthers>({
    fetchDataStatus: {}
}, {
    [projectFetchData.type]: (state, action: PayloadAction<ProjectFetchDataPayload>): any => {
        return {
            ...state,
            fetchDataStatus: {
                ...state.fetchDataStatus,
                [action.payload.sourceType]: FetchDataStatus.LOADING
            }
        }
    },
    [projectFetchDataSucceeded.type]: (state, action: PayloadAction<ProjectDataChangedPayload>): any => {
        return {
            ...state,
            fetchDataStatus: {
                ...state.fetchDataStatus,
                [action.payload.sourceType]: FetchDataStatus.COMPLETE
            }
        }
    },
    [projectFetchDataFailed.type]: (state, action: any): any => {
        return {
            ...state,
            fetchDataStatus: {
                ...state.fetchDataStatus,
                [action.meta.payload.sourceType]: FetchDataStatus.NONE
            }
        }
    }
})


export const uiReducer = combineReducers<AppUI>({
    editor: uiEditorReducer,
    preview: uiPreviewReducer,
    export: uiExportReducer,
    others: uiOthersReducer
})
