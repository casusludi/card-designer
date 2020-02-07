import { Project } from "../services/Project";

export const OPEN_PROJECT_FROM_DIALOG = 'OPEN_PROJECT_FROM_DIALOG';
export const PROJECT_OPEN_SUCCEEDED = 'PROJECT_OPEN_SUCCEEDED';
export const PROJECT_OPEN_FAILED = 'PROJECT_OPEN_FAILED';


interface OpenProjectFromDialogAction {
    type: typeof OPEN_PROJECT_FROM_DIALOG
}

interface ProjectOpenSucceeded {
    type: typeof PROJECT_OPEN_SUCCEEDED,
    project: Project
}

interface ProjectOpenFailed {
    type: typeof PROJECT_OPEN_FAILED,
    message: any
}

export type ProjectActionTypes = OpenProjectFromDialogAction | ProjectOpenSucceeded | ProjectOpenFailed;