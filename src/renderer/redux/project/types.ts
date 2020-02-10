import { Project, ProjectSourceData } from "../../services/Project";
import { User } from "../../services/Auth";
import { ProjectSourceType } from "../../services/Project/Sources";


export const OPEN_PROJECT_FROM_DIALOG = 'OPEN_PROJECT_FROM_DIALOG';
export const PROJECT_OPEN_SUCCEEDED = 'PROJECT_OPEN_SUCCEEDED';
export const PROJECT_OPEN_CANCELLED = 'PROJECT_OPEN_CANCELLED';
export const PROJECT_OPEN_FAILED = 'PROJECT_OPEN_FAILED';
export const PROJECT_FETCH_DATA = 'PROJECT_FETCH_DATA';
export const PROJECT_FETCH_DATA_FAILED = 'PROJECT_FETCH_DATA_FAILED';
export const PROJECT_FETCH_DATA_SUCCEEDED = 'PROJECT_FETCH_DATA_SUCCEEDED';
export const PROJECT_SET_DATA = 'PROJECT_SET_DATA';


interface OpenProjectFromDialogAction {
    type: typeof OPEN_PROJECT_FROM_DIALOG
}

interface ProjectOpenSucceeded {
    type: typeof PROJECT_OPEN_SUCCEEDED
    project: Project
}

export interface ProjectOpenFailed {
    type: typeof PROJECT_OPEN_FAILED
    message: any
}
 
export interface ProjectFetchData {
    type: typeof PROJECT_FETCH_DATA
    sourceType:ProjectSourceType
    project:Project
    user?:User|null
}

export interface ProjectSetData {
    type: typeof PROJECT_SET_DATA
    sourceType:ProjectSourceType
    data: ProjectSourceData
}

export type ProjectActionTypes = OpenProjectFromDialogAction | ProjectOpenSucceeded | ProjectOpenFailed | ProjectFetchData | ProjectSetData;
