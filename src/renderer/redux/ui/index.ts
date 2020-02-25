import { createAction, createReducer, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { ProjectTemplate, ProjectDataItem, Project, ProjectExportStatus, ProjectExportState } from '../../services/Project';
import { PDFSource } from '../../components/PreviewPanel/PDFViewer/PDFDocument';
import { AppUI, AppUIOthers } from '../../components/App/App';
import { ProjectSourceType, FetchDataStatus } from '../../services/Project/Sources';
import { projectOpenSucceeded, projectReloadSucceeded, projectExportStateChanged, projectFetchData, projectFetchDataFailed, ProjectFetchDataPayload, projectFetchDataSucceeded, ProjectDataChangedPayload, projectRenderFailed, projectRendered, projectClosing } from '../project';
import { firstKeyOfObject } from '../../utils';
import _ from 'lodash';
import { AppUIEditor } from '../../components/EditorPanel/EditorPanel';
import { AppUIPreview } from '../../components/PreviewPanel/PreviewPanel';
import { AppUIExport } from '../../components/EditorPanel/ExportEditor/ExportEditor';

export const uiEditorSelectedTemplateChanged = createAction<{ template: ProjectTemplate }>("uiEditor/selectedTemplateChanged");
export const uiEditorSelectedLayoutChanged = createAction<{ layout: ProjectTemplate }>("uiEditor/selectedLayoutChanged");
export const uiEditorSelectedSourceTypeChanged = createAction<{ sourceType: ProjectSourceType }>("uiEditor/selectedSourceTypeChanged");
export const uiEditorSelectedDataChanged = createAction<{ data: ProjectDataItem | undefined | null }>("uiEditor/selectedDataChanged");
export const uiPreviewPdfChanged = createAction<{ pdf: PDFSource, renderTime?: number }>("uiPreview/pdfChanged");
export const uiPreviewHtmlUrlChanged = createAction<{ htmlUrl: string | null }>("uiPreview/htmlUrlChanged");

export const uiEditorReducer = createReducer<AppUIEditor>({
    selectedSourceType: ProjectSourceType.NONE,
    selection: null,
    lastError: null
}, {
    [projectOpenSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => {
        const { project } = action.payload;
        const selectedTemplate = project?.cardTypes[firstKeyOfObject(project?.cardTypes)];
        const selectedSourceType = project?.availablesSources[1] || ProjectSourceType.NONE;
        return {
            ...state,
            selectedSourceType,
            selection: {
                cardType: selectedTemplate,
                layout: project?.layouts[firstKeyOfObject(project?.layouts)],
                data: (selectedTemplate && selectedTemplate.id) ? _.find(project?.data[selectedSourceType]?.data, o => o.id == selectedTemplate.id) : null
            },
            aceUndoManagers: {}
        }
    },
    [projectClosing.type]: (state, action: PayloadAction<{ project: Project }>) => {
        return {
            ...state,
            selectedSourceType: ProjectSourceType.NONE,
            selection: {
                cardType: null,
                layout: null,
                data: null
            }
        }
    },
    [projectReloadSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => {
        const { project } = action.payload;
        const lastSelection = state.selection;
        let selectedTemplate = _.find(project.cardTypes, o => o.id == lastSelection?.cardType?.id)
        if (!selectedTemplate) selectedTemplate = project?.cardTypes[firstKeyOfObject(project?.cardTypes)];
        let selectedLayout = _.find(project.layouts, o => o.id == lastSelection?.layout?.id)
        if (!selectedLayout) selectedLayout = project?.layouts[firstKeyOfObject(project?.layouts)];

        const selectedSourceType = state.selectedSourceType;
        return {
            ...state,
            selectedSourceType,
            selection: {
                cardType: selectedTemplate,
                layout: selectedLayout,
                data: (selectedTemplate && selectedTemplate.id) ? _.find(project?.data[selectedSourceType]?.data, o => o.id == selectedTemplate?.id) : null
            }

        }
    },
    [uiEditorSelectedTemplateChanged.type]: (state, action: PayloadAction<{ template: ProjectTemplate }>) => {
        return {
            ...state,
            selection: {
                layout: state.selection?.layout,
                data: state.selection?.data,
                cardType: action.payload.template
            }

        }
    },
    [uiEditorSelectedLayoutChanged.type]: (state, action: PayloadAction<{ layout: ProjectTemplate }>) => {

        return {
            ...state,
            selection: {
                layout: action.payload.layout,
                data: state.selection?.data,
                cardType: state.selection?.cardType
            }

        }
    },
    [uiEditorSelectedDataChanged.type]: (state, action: PayloadAction<{ data: ProjectDataItem }>) => {
        return {
            ...state,
            selection: {
                layout: state.selection?.layout,
                data: action.payload.data,
                cardType: state.selection?.cardType
            }

        }
    },
    [uiEditorSelectedSourceTypeChanged.type]: (state, action: PayloadAction<{ sourceType: ProjectSourceType }>) => {
        return {
            ...state,
            selectedSourceType: action.payload.sourceType
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
