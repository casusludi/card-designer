import { createAction, createReducer, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { ProjectTemplate, ProjectLayout, ProjectDataItem, Project } from '../../services/Project';
import { PDFSource } from '../../components/PreviewPanel/PDFViewer/PDFDocument';
import { AppUI, AppUIEditor, AppUIPreview } from '../../components/App/App';
import { ProjectSourceType } from '../../services/Project/Sources';
import { projectOpenSucceeded, projectReloadSucceeded } from '../project';
import { firstKeyOfObject } from '../../utils';
import _ from 'lodash';

export const uiEditorSelectedTemplateChanged = createAction<{ template: ProjectTemplate }>("uiEditor/selectedTemplateChanged");
export const uiEditorSelectedLayoutChanged = createAction<{ layout: ProjectLayout }>("uiEditor/selectedLayoutChanged");
export const uiEditorSelectedSourceTypeChanged = createAction<{ sourceType: ProjectSourceType }>("uiEditor/selectedSourceTypeChanged");
export const uiEditorSelectedDataChanged = createAction<{ data: ProjectDataItem | undefined | null }>("uiEditor/selectedDataChanged");
export const uiPreviewPdfChanged = createAction<{ pdf: PDFSource }>("uiPreview/pdfChanged");
export const uiPreviewHtmlUrlChanged = createAction<{ htmlUrl: string | null }>("uiPreview/htmlUrlChanged");

export const uiEditorReducer = createReducer<AppUIEditor>({
    selectedSourceType: ProjectSourceType.NONE,
    selection: null
}, {
    [projectOpenSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => {
        const { project } = action.payload;
        const selectedTemplate = project?.templates[firstKeyOfObject(project?.templates)];
        const selectedSourceType = ProjectSourceType.GSHEETS;
        return {
            selectedSourceType,
            selection: {
                template: selectedTemplate,
                layout: project?.layouts[firstKeyOfObject(project?.layouts)],
                data: (selectedTemplate && selectedTemplate.id) ? _.find(project?.data[selectedSourceType]?.data, o => o.id == selectedTemplate.id) : null
            }

        }
    },
    [projectReloadSucceeded.type]: (state, action: PayloadAction<{ project: Project }>) => {
        const { project } = action.payload;
  

        const lastSelection = state.selection;
        console.log(_.map(project.layouts,o => console.log(o)));
        let selectedTemplate = _.find(project.templates, o => o.id == lastSelection?.template?.id)
        if(!selectedTemplate) selectedTemplate = project?.templates[firstKeyOfObject(project?.templates)];
        let selectedLayout = _.find(project.layouts, o => o.id == lastSelection?.layout?.id)
        if(!selectedLayout) selectedLayout = project?.layouts[firstKeyOfObject(project?.layouts)];

        const selectedSourceType = state.selectedSourceType;
        return {
            selectedSourceType,
            selection: {
                template: selectedTemplate,
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
                template: action.payload.template
            }

        }
    },
    [uiEditorSelectedLayoutChanged.type]: (state, action: PayloadAction<{ layout: ProjectLayout }>) => {

        return {
            ...state,
            selection: {
                layout: action.payload.layout,
                data: state.selection?.data,
                template: state.selection?.template
            }

        }
    },
    [uiEditorSelectedDataChanged.type]: (state, action: PayloadAction<{ data: ProjectDataItem }>) => {
        return {
            ...state,
            selection: {
                layout: state.selection?.layout,
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
    [projectOpenSucceeded.type]: (state,action:PayloadAction<{project:Project}>):any => {
        return {
            pdf:null,
            htmlUrl:null
        }
    },
    [uiPreviewPdfChanged.type]: (state, action: PayloadAction<{ pdf: PDFSource }>) => {
        return {
            ...state,
            pdf: action.payload.pdf
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

export const uiReducer = combineReducers<AppUI>({
    editor: uiEditorReducer,
    preview: uiPreviewReducer
})
