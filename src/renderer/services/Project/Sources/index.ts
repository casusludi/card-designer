import { Project, ProjectSourceData, PROJECT_CACHE_FOLDER } from "..";
import { fetchFromGSheet } from "./GSheets";
import { User, AuthType } from "../../Auth";
import { fsreadFile } from "../../../utils";


export enum ProjectSourceType {
    GSHEETS = 'gsheets',
    MOCKUP = 'mockup'
};

const sourceAuthTypes = {
    [ProjectSourceType.GSHEETS]: AuthType.GOOGLE,
    [ProjectSourceType.MOCKUP]: null
}

export async function fetchData(project: Project, sourceType: ProjectSourceType, user: User | null | undefined): Promise<ProjectSourceData> {
    switch (sourceType) {
        case ProjectSourceType.GSHEETS:
            if (!project.config.sources.gsheets) throw new Error(`Fetching Data from '${sourceType}' : no sheet id found in cardmaker.json.`)
            if (!user) throw new Error(`Fetching Data from '${sourceType}' : not user found.`)
            const data = await fetchFromGSheet(project.config.sources.gsheets.sheetId, user.tokens);
            return {
                data,
                cacheFilePath: `${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`,
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

export async function getCachedData(project: Project, sourceType: ProjectSourceType|string) {
    switch (sourceType) {
        case ProjectSourceType.GSHEETS:
            if (!project.config.sources.gsheets) throw new Error(`Fetching Data from '${sourceType}' : no sheet id found in cardmaker.json.`)
            const cacheFile = `${project.path}/${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`;
            try{
                const data = await fsreadFile(cacheFile);
                return {
                    data: JSON.parse(data.toString()),
                    cacheFilePath: `${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`,
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
