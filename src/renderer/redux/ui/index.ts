import { createAction, createReducer, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { ProjectTemplate, ProjectLayout, ProjectDataItem } from '../../services/Project';
import { PDFSource } from '../../components/PreviewPanel/PDFViewer/PDFDocument';
import { AppUI, AppUIEditor, AppUIPreview } from '../../components/App/App';
import { ProjectSourceType } from '../../services/Project/Sources';

export const uiEditorSelectedTemplateChanged = createAction<{ template: ProjectTemplate }>("uiEditor/selectedTemplateChanged");
export const uiEditorSelectedLayoutChanged = createAction<{ layout: ProjectLayout }>("uiEditor/selectedLayoutChanged");
export const uiEditorSelectedSourceTypeChanged = createAction<{ sourceType: ProjectSourceType }>("uiEditor/selectedSourceTypeChanged");
export const uiEditorSelectedDataChanged = createAction<{ data: ProjectDataItem|undefined|null }>("uiEditor/selectedDataChanged");
export const uiPreviewPdfChanged = createAction<{ pdf: PDFSource }>("uiPreview/pdfChanged");
export const uiPreviewHtmlUrlChanged = createAction<{ htmlUrl: string | null }>("uiPreview/htmlUrlChanged");

export const uiEditorReducer = createReducer<AppUIEditor>({
    selectedSourceType: ProjectSourceType.NONE,
    selection:null
}, {
    [uiEditorSelectedTemplateChanged.type]: (state, action: PayloadAction<{ template: ProjectTemplate }>) => {
        return {
            ...state,
            selection:{
                layout:state.selection?.layout,
                data:state.selection?.data,
                template: action.payload.template
            }
            
        }
    },
    [uiEditorSelectedLayoutChanged.type]: (state, action: PayloadAction<{ layout: ProjectLayout }>) => {

        return {
            ...state,
            selection:{
                layout:action.payload.layout,
                data:state.selection?.data,
                template: state.selection?.template
            }
            
        }
    },
    [uiEditorSelectedDataChanged.type]: (state, action: PayloadAction<{ data: ProjectDataItem }>) => {
        return {
            ...state,
            selection:{
                layout:state.selection?.layout,
                data: action.payload.data,
                template: state.selection?.template
            }
            
        }
    },
    [uiEditorSelectedSourceTypeChanged.type]: (state, action: PayloadAction<{ sourceType: ProjectSourceType }>) => {
        return {
            ...state,
            selectedSourceType: action.payload.sourceType
        }
    }
})

export const uiPreviewReducer = createReducer<AppUIPreview>({
    pdf: null,
    htmlUrl: null
}, {
    [uiPreviewPdfChanged.type]: (state, action: PayloadAction<{ pdf: PDFSource }>) => {
        return {
            ...state,
            pdf:action.payload.pdf
        }
    },
    // TS crash à la gueule pour je ne sais quelle raison encore : le fait que pdf soit un binary?
    //J'ai un state:any en attendant
    [uiPreviewHtmlUrlChanged.type]: (state:any, action: PayloadAction<{ htmlUrl: string }>) => {
        return {
            ...state,
            htmlUrl:action.payload.htmlUrl
        }
    }
})

export const uiReducer = combineReducers<AppUI>({
    editor: uiEditorReducer,
    preview: uiPreviewReducer
}) 