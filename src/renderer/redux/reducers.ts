import { Project } from "../services/Project";
import { combineReducers } from 'redux'
import { ApplicationState } from "..";
import { ProjectActionTypes, PROJECT_OPEN_SUCCEEDED } from "./types";

function projectReducer(state:Project|null = null,action:ProjectActionTypes):Project|null{
    switch(action.type){
        case PROJECT_OPEN_SUCCEEDED:
            return action.project;
    }
    return state;
}

export default combineReducers<ApplicationState>({
    project:projectReducer
}) 
