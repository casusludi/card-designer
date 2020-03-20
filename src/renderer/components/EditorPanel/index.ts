import { ProjectSelection } from '../../services/Project';

export {default} from './EditorPanel';


export type AppUIEditor = {
    selection: ProjectSelection | undefined | null
    lastError: Error | null | undefined
}
