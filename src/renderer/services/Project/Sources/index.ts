import { Project, ProjectSourceData, PROJECT_CACHE_FOLDER, ProjectFile, ProjectConfig } from "..";
import { fetchFromGSheet } from "./GSheets";
import { User, AuthType } from "../../Auth";
import { fsreadFile } from "../../../utils";


export enum ProjectSourceType {
    NONE = 'none',
    GSHEETS = 'gsheets',
    MOCKUP = 'mockup'
};

export enum FetchDataStatus {
    NONE,
    LOADING,
    COMPLETE
}

const sourceAuthTypes = {
    [ProjectSourceType.GSHEETS]: AuthType.GOOGLE,
    [ProjectSourceType.MOCKUP]: null,
    [ProjectSourceType.NONE]: null
}

export async function fetchData(project: Project, sourceType: ProjectSourceType, user: User | null | undefined): Promise<ProjectSourceData> {
    switch (sourceType) {
        case ProjectSourceType.GSHEETS:
            if (!project.config.sources.gsheets) throw new Error(`Fetching Data from '${sourceType}' : no sheet id found in cardmaker.json.`)
            if (!user) throw new Error(`Fetching Data from '${sourceType}' : not user found.`)
            const data = await fetchFromGSheet(project.config.sources.gsheets.sheetId, user.tokens);
            return {
                data,
                cacheFilePath: `${project.path}/${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`,
                type: sourceType
            }
        case ProjectSourceType.MOCKUP:
            if (!project.config.sources.mockup) throw new Error(`Source type '${sourceType}' not found.`)
            return {
                data: project.config.sources.mockup,
                cacheFilePath: null,
                type: sourceType
            }

        default: throw new Error(`Source type '${sourceType}' not found.`)
    }
}

export function getSourceAuthType(sourceType: ProjectSourceType): AuthType | null {
    return sourceAuthTypes[sourceType];
}

export function createDataFile(project:Project, sourceType: ProjectSourceType|string):ProjectFile|null{
    switch (sourceType) {
        case ProjectSourceType.GSHEETS:
            if(!project.config.sources.gsheets) return null;
            if(!project.data.gsheets) return null;
            if(!project.data.gsheets.cacheFilePath) return null;
            return {
                path:project.data.gsheets.cacheFilePath,
                content: JSON.stringify(project.data.gsheets.data,null,4)
            }
    }
    return null;
}

export function getAvailableSources(config: ProjectConfig):Array<ProjectSourceType>{
    const sourceConfigs = config.sources;
    const ret:Array<ProjectSourceType> = [ProjectSourceType.NONE];
    for(let key in sourceConfigs){
        const type = key as ProjectSourceType;
        if(type){
            switch(type){
                case ProjectSourceType.GSHEETS:
                    if(sourceConfigs.gsheets && sourceConfigs.gsheets.sheetId != null){
                        ret.push(type);
                    }
                break;
                case ProjectSourceType.MOCKUP:
                    if(sourceConfigs.mockup && sourceConfigs.mockup.length > 0){
                        ret.push(type);
                    }
                break;
            }
        }
    }

    return ret;
}

export async function getCachedData(project: Project, sourceType: ProjectSourceType|string) {
    switch (sourceType) {
        case ProjectSourceType.GSHEETS:
            if (!project.config.sources.gsheets) throw new Error(`Fetching Data from '${sourceType}' : no sheet id found in cardmaker.json.`)
            const cacheFile = `${project.path}/${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`;
            try{
                const data = await fsreadFile(cacheFile);
                return {
                    data: JSON.parse(data.toString()),
                    cacheFilePath: `${project.path}/${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`,
                    type: sourceType
                }
            }catch(e){
                return null;
            }
            
        case ProjectSourceType.MOCKUP:
            if (project.config.sources.mockup) {
                return {
                    data: project.config.sources.mockup,
                    cacheFilePath: null,
                    type: sourceType
                }
            } else {
                throw new Error(`Source type '${sourceType}' not found.`)
            }
        default: throw new Error(`Source type '${sourceType}' not found.`)
    }
}
