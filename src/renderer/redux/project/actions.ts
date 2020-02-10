import { OPEN_PROJECT_FROM_DIALOG, ProjectActionTypes, PROJECT_FETCH_DATA, PROJECT_SET_DATA } from "./types";
import {  Project, ProjectSourceData } from "../../services/Project";
import { User } from "../../services/Auth";
import { ProjectSourceType } from "../../services/Project/Sources";

export function openProjectFromDialog(): ProjectActionTypes{
    return {
        type: OPEN_PROJECT_FROM_DIALOG
    }
}

export function fetchData(project:Project,sourceType:ProjectSourceType,user?:User|null):ProjectActionTypes {
    return {
        type: PROJECT_FETCH_DATA,
        sourceType,
        project,
        user
    }
}

export function setData(sourceType:ProjectSourceType,data:ProjectSourceData):ProjectActionTypes {
    return {
        type: PROJECT_SET_DATA,
        sourceType,
        data
    }
}