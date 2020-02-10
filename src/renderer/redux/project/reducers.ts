import { Project } from "../../services/Project";
import { ProjectActionTypes, PROJECT_OPEN_SUCCEEDED, PROJECT_SET_DATA } from "./types";

export function projectReducer(state:Project|null = null,action:ProjectActionTypes):Project|null{
    switch(action.type){
        case PROJECT_OPEN_SUCCEEDED:
            return action.project;
        case PROJECT_SET_DATA : 
            if(!state) return null;
            return {
                ...state,
                modified: true,
                data : {
                    ...state.data,
                    [action.sourceType]: action.data
                }
            } 
    }
    return state;
}
