import { createAction, createReducer, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { ProjectTemplate, ProjectLayout } from '../../services/Project';
import { PDFSource } from '../../components/PDFViewer/PDFDocument';
import { AppUI, AppUIEditor, AppUIPreview } from '../../components/App/App';
import { ProjectSourceType } from '../../services/Project/Sources';

export const uiEditorSelectedTemplateChanged = createAction<{ template: ProjectTemplate }>("uiEditor/selectedTemplateChanged");
export const uiEditorSelectedLayoutChanged = createAction<{ layout: ProjectLayout }>("uiEditor/selectedLayoutChanged");
export const uiEditorSelectedSourceTypeChanged = createAction<{ sourceType: ProjectSourceType }>("uiEditor/selectedSourceTypeChanged");
export const uiPreviewPdfChanged = createAction<{ pdf: PDFSource }>("uiPreview/pdfChanged");
export const uiPreviewHtmlChanged = createAction<{ html: string }>("uiPreview/htmlChanged");

export const uiEditorReducer = createReducer<AppUIEditor>({
    selectedTemplate: null,
    selectedLayout: null,
    selectedSourceType: ProjectSourceType.NONE
}, {
    [uiEditorSelectedTemplateChanged.type]: (state, action: PayloadAction<{ template: ProjectTemplate }>) => {
        return {
            ...state,
            selectedTemplate: action.payload.template
        }
    },
    [uiEditorSelectedLayoutChanged.type]: (state, action: PayloadAction<{ layout: ProjectLayout }>) => {
        return {
            ...state,
            selectedLayout: action.payload.layout
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
    html: null
}, {
    [uiPreviewPdfChanged.type]: (state, action: PayloadAction<{ pdf: PDFSource }>) => {
        return {
            ...state,
            pdf:action.payload.pdf
        }
    },
    // TS crash à la gueule pour je ne sais quelle raison encore : le fait que pdf soit un binary?
    //J'ai un state:any en attendant
    [uiPreviewHtmlChanged.type]: (state:any, action: PayloadAction<{ html: string }>) => {
        return {
            ...state,
            html:action.payload.html
        }
    }
})

export const uiReducer = combineReducers<AppUI>({
    editor: uiEditorReducer,
    preview: uiPreviewReducer
}) 