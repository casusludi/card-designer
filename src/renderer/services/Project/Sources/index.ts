import { Project, ProjectSourceData, PROJECT_CACHE_FOLDER, ProjectFile, ProjectConfig, ProjectDataItem } from "..";
import { fetchFromGSheet } from "./GSheets";
import { User, AuthType } from "../../Auth";
import fse from 'fs-extra';
import path from 'path';
import { v4 as uuidv4} from "uuid";
import _ from "lodash";


export enum ProjectSourceType {
    NONE = 'none',
    GSHEETS = 'gsheets',
    JSON = 'json',
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
    [ProjectSourceType.JSON]: null,
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
        case ProjectSourceType.JSON:
            if (!project.config.sources.json) throw new Error(`Fetching Data from '${sourceType}' : no config found in cardmaker.json.`)
            if (!project.config.sources.json.path) throw new Error(`Fetching Data from '${sourceType}' : no path found in cardmaker.json.`)
            const filePath = path.join(project.path,project.config.sources.json.path);
            return {
                data: JSON.parse((await fse.readFile(filePath)).toString()),
                cacheFilePath: filePath,
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

export function createDataFile(project: Project, sourceType: ProjectSourceType | string): ProjectFile | null {
    switch (sourceType) {
        case ProjectSourceType.GSHEETS:
            if (!project.config.sources.gsheets) return null;
            if (!project.data.gsheets) return null;
            if (!project.data.gsheets.cacheFilePath) return null;
            return {
                instanceId: uuidv4(),
                path: project.data.gsheets.cacheFilePath,
                content: JSON.stringify(project.data.gsheets.data, null, 4)
            }
    }
    return null;
}

export function getAvailableSources(config: ProjectConfig): Array<ProjectSourceType> {
    const sourceConfigs = config.sources;
    const ret: Array<ProjectSourceType> = [ProjectSourceType.NONE];
    for (let key in sourceConfigs) {
        const type = key as ProjectSourceType;
        if (type) {
            switch (type) {
                case ProjectSourceType.GSHEETS:
                    if (sourceConfigs.gsheets && sourceConfigs.gsheets.sheetId != null) {
                        ret.push(type);
                    }
                    break;
                case ProjectSourceType.JSON:
                    if (sourceConfigs.json && sourceConfigs.json.path) {
                        ret.push(type);
                    }
                    break;
                case ProjectSourceType.MOCKUP:
                    if (sourceConfigs.mockup && sourceConfigs.mockup.length > 0) {
                        ret.push(type);
                    }
                    break;
            }
        }
    }

    return ret;
}

export async function getCachedData(project: Project, sourceType: ProjectSourceType | string) {
    switch (sourceType) {
        case ProjectSourceType.GSHEETS:
            if (!project.config.sources.gsheets) throw new Error(`Fetching Data from '${sourceType}' : no sheet id found in cardmaker.json.`)
            const cacheFile = `${project.path}/${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`;
            try {
                const data = await fse.readFile(cacheFile);
                return {
                    data: JSON.parse(data.toString()),
                    cacheFilePath: `${project.path}/${PROJECT_CACHE_FOLDER}/gsheets/${project.config.sources.gsheets.sheetId}.json`,
                    type: sourceType
                }
            } catch (e) {
                return null;
            }
        case ProjectSourceType.JSON:
            if (!project.config.sources.json) throw new Error(`Fetching Data from '${sourceType}' : no config found in cardmaker.json.`)
            if (!project.config.sources.json.path) throw new Error(`Fetching Data from '${sourceType}' : no path found in cardmaker.json.`)
            const filePath = path.join(project.path,project.config.sources.json.path);
            return {
                data: JSON.parse((await fse.readFile(filePath)).toString()),
                cacheFilePath: filePath,
                type: sourceType
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


export function countCards(data:ProjectDataItem):number{

    return _.reduce(data.cards,(sum,o) => {
        if(o["_COUNT"]){
            sum += parseInt(o["_COUNT"]);
        }else{
            sum ++;
        }
        return sum;
    },0)
}