import { Project } from "../services/Project";

export const OPEN_PROJECT_FROM_DIALOG = 'OPEN_PROJECT_FROM_DIALOG';
export const PROJECT_OPEN_SUCCEEDED = 'PROJECT_OPEN_SUCCEEDED';
export const PROJECT_OPEN_CANCELLED = 'PROJECT_OPEN_CANCELLED';
export const PROJECT_OPEN_FAILED = 'PROJECT_OPEN_FAILED';
export const SHOW_ERROR_POPUP = 'SHOW_ERROR_POPUP';



interface OpenProjectFromDialogAction {
    type: typeof OPEN_PROJECT_FROM_DIALOG
}

interface ProjectOpenSucceeded {
    type: typeof PROJECT_OPEN_SUCCEEDED,
    project: Project
}

export interface ProjectOpenFailed {
    type: typeof PROJECT_OPEN_FAILED,
    message: any
}

export interface ShowErrorPopup {
    type: typeof SHOW_ERROR_POPUP,
    title:string,
    message: any
}

export type ProjectActionTypes = OpenProjectFromDialogAction | ProjectOpenSucceeded | ProjectOpenFailed;
export type GlobalActionTypes = ShowErrorPopup;