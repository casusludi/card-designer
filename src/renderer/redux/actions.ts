import { OPEN_PROJECT_FROM_DIALOG, ProjectActionTypes } from "./types";

export function openProjectFromDialog(): ProjectActionTypes{
    return {
        type: OPEN_PROJECT_FROM_DIALOG
    }
}