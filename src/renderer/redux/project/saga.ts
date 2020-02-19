import { call, put, takeLatest, all, takeEvery, select } from 'redux-saga/effects';
import { openProjectFromDialog, ProjectSourceData, saveProject, Project, renderSelectionAsHtml, ProjectSelection, RenderFilter, loadProjectFromConfig, ProjectExportStatus, exportProjectStrip } from '../../services/Project';

import { fetchData, getSourceAuthType, ProjectSourceType } from '../../services/Project/Sources';
import AppGlobal from '../../AppGlobal';
import { authUserChanged } from '../auth';
import { projectOpenSucceeded, projectOpenCancelled, projectOpenFailed, projectOpenFromDialog, projectDataChanged, projectFetchDataFailed, projectFetchData, projectSavingFailed, projectSaving, projectSaved, projectRender, projectFileChanged, projectConfigChanged, projectReloadSucceeded, projectReloadFailed, projectExport, projectExportStateChanged, projectExportFailed } from '.';
import { uiPreviewHtmlUrlChanged, uiPreviewPdfChanged, uiEditorSelectedLayoutChanged, uiEditorSelectedDataChanged } from '../ui';
import { convertHtmlToPdf, serveHtml } from '../../utils';
import { ApplicationState } from '../..';
import { ServeOverrides } from '../../../main/serve';
import { AnyAction } from 'redux';
import { EditorPreferences } from '../preferences';
import { PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

const selectProject = (state: ApplicationState) => state.project;
const selectEditorPreferences = (state: ApplicationState) => state.preferences.editor

function* saga_openProjectFromDialog(action: any) {
    try {
        const project = yield call(openProjectFromDialog);
        if (project) {
            yield put(projectOpenSucceeded({ project: project }))
        } else {
            yield put(projectOpenCancelled())
        }
    } catch (e) {
        yield put(projectOpenFailed(e))
    }
}

function* saga_reloadProjectWhenConfigChanged(action:any){
    try {
        const oldProject: Project = yield select(selectProject);

        const newProject = yield call(loadProjectFromConfig, oldProject.config,oldProject.path);
        if (newProject) {
            newProject.modified = true;
            yield put(projectReloadSucceeded({ project: newProject }))
        } else {
            yield put(projectReloadFailed(new Error('Project not found')))
        }
        
    } catch (e) {
        yield projectReloadFailed(e);
    }
}

function* saga_fetchData(action: any) {
    try {
        let user = action.payload.user;
        const authType = getSourceAuthType(action.payload.sourceType);
        if (authType) {
            const auth = AppGlobal.getAuth(authType)
            if (auth) {
                const refreshedUser = yield call(auth.refreshToken);
                user = refreshedUser;
                yield put(authUserChanged({ authType, user: refreshedUser }));
            }
        }

        const data: ProjectSourceData = yield call(fetchData, action.payload.project, action.payload.sourceType, user)
        yield put(projectDataChanged({ sourceType: action.payload.sourceType, data }));

    } catch (e) {
        yield put(projectFetchDataFailed(e))
    }
}

function* saga_saveProject(action: any) {
    try {
        const project: Project = yield select(selectProject);
        if (project.modified) {
            yield call(saveProject, project);
            yield put(projectSaved());
        }
    } catch (e) {
        yield projectSavingFailed(e);
    }
}


function* saga_renderProjectSelection(action: any) {
    try {
        const selection: ProjectSelection = action.payload.selection;
        const project: Project = yield select(selectProject);
        const filter:RenderFilter = action.payload.filter;
        const html = renderSelectionAsHtml(project, action.payload.selection, {})

        if (html && project && selection.template && selection.layout) {
            if (filter != RenderFilter.NONE) {
                console.log("selected layout",selection.layout);
                let templateStylesPath = selection.template.styles;
                let layoutStylesPath = selection.layout.styles;
                if (templateStylesPath[0] != '/') templateStylesPath = '/' + templateStylesPath;
                if (layoutStylesPath[0] != '/') layoutStylesPath = '/' + layoutStylesPath;
                const overrides: ServeOverrides = {
                    [templateStylesPath]: project.files[selection.template.styles].content,
                    [layoutStylesPath]: project.files[selection.layout.styles].content
                }
                const htmlUrl = yield call(serveHtml, "html-preview", html, project.path, overrides)
                if(filter == RenderFilter.ALL || filter == RenderFilter.HTML){
                    yield put(uiPreviewHtmlUrlChanged({ htmlUrl }));
                }
                if(filter == RenderFilter.ALL || filter == RenderFilter.PDF){
                    console.time("pdf rendering")
                    const pdf = yield call(convertHtmlToPdf, html, project.path, overrides)
                    console.timeEnd("pdf rendering")
                    yield put(uiPreviewPdfChanged({ pdf }))
                }
            }
        }
    } catch (e) {

    }
}
const editorSelectionSelect = (state: ApplicationState) => state.ui.editor.selection;

function* saga_renderProjectSelectionFromEditor(filter:RenderFilter=RenderFilter.ALL) {
    const selection = yield select(editorSelectionSelect);
    yield put(projectRender({ selection, filter }));
}

function* saga_autoRenderProjectSelectionFromEditor(action: AnyAction) {
    const preferences: EditorPreferences = yield select(selectEditorPreferences);
    yield saga_renderProjectSelectionFromEditor(preferences.autoRenderFilter);
}

function* saga_renderProjectAtOpening() {
    const selection = yield select(editorSelectionSelect);
    yield put(projectRender({ selection, filter:RenderFilter.ALL }));
}

function* saga_exportProject(action:PayloadAction<{layoutId:string, sourceType:ProjectSourceType, exportFolderPath:string}>){
    try{
        const project: Project = yield select(selectProject);
        
        yield put(projectExportStateChanged({
            state: {
                status: ProjectExportStatus.INIT,
                rate:0
            }
        }))

        const templateNames = _.keys(project.templates);
        for(let i = 0,c = templateNames.length;i<c;i++){
            yield call(exportProjectStrip,project,templateNames[i], action.payload.layoutId, action.payload.sourceType, action.payload.exportFolderPath)
            yield put(projectExportStateChanged({
                state: {
                    status: ProjectExportStatus.PROGRESS,
                    rate:i/c
                }
            }))
        }

        yield put(projectExportStateChanged({
            state: {
                status: ProjectExportStatus.COMPLETE,
                rate:1
            }
        }))

        yield put(projectExportStateChanged({
            state: {
                status: ProjectExportStatus.NONE,
                rate:0
            }
        }))

   
    }catch(e){
        yield put(projectExportFailed(e));
        yield put(projectExportStateChanged({
            state: {
                status: ProjectExportStatus.NONE,
                rate:0
            }
        }))
    }
}

export default function* projectSaga() {
    yield all([
        yield takeLatest(projectOpenFromDialog.type, saga_openProjectFromDialog),
        yield takeEvery(projectFetchData.type, saga_fetchData),
        yield takeLatest(projectSaving.type, saga_saveProject),
        yield takeLatest(projectRender.type, saga_renderProjectSelection),
        yield takeLatest(projectOpenSucceeded.type, saga_renderProjectAtOpening),
        yield takeLatest([
            projectFileChanged.type,
            projectDataChanged.type,
            uiEditorSelectedLayoutChanged.type,
            uiEditorSelectedDataChanged.type,
        ], saga_autoRenderProjectSelectionFromEditor),
        yield takeLatest(projectConfigChanged.type, saga_reloadProjectWhenConfigChanged),
        yield takeLatest(projectExport.type, saga_exportProject)
    ])
}