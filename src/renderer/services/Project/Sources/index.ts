import { Project, ProjectSourceData, PROJECT_CACHE_FOLDER } from "..";
import { fetchFromGSheet } from "./GSheets";
import { User, AuthType } from "../../Auth";

export enum ProjectSourceType {
    GSHEETS = 'GSHEETS'
};

const sourceAuthTypes = {
    [ProjectSourceType.GSHEETS]: AuthType.GOOGLE
}

export async function fetchData(project:Project,sourceType:ProjectSourceType,user:User|null|undefined):Promise<ProjectSourceData>{
    switch(sourceType){
        case ProjectSourceType.GSHEETS: 
            if(!project.config.sources.gsheets) throw new Error(`Fetching Data from '${sourceType}' : no sheet id found in cardmaker.json.`) 
            if(!user) throw new Error(`Fetching Data from '${sourceType}' : not user found.`)             
            const data =  await fetchFromGSheet(project.config.sources.gsheets.sheetId,user.tokens);
            return {
                data,
                cacheFilePath:`${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`,
                type:sourceType
            }
        default : throw new Error(`Source type '${sourceType}' not found.`)
    }
}

export function getSourceAuthType(sourceType:ProjectSourceType):AuthType{
    return sourceAuthTypes[sourceType];
}
