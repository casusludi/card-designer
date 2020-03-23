import { FetchDataStatus } from '../../services/Project/Sources';
import { AppUIEditor } from '../EditorPanel';
import { AppUIPreview } from '../PreviewPanel';
import { AppUIExport } from '../EditorPanel/ExportEditor';

export {default} from './App';

export type AppUIOthers = {
	fetchDataStatus:{
		[type:string]:FetchDataStatus
	}
}

export type AppUI = {
	editor: AppUIEditor
	preview: AppUIPreview
	export: AppUIExport
	others: AppUIOthers
}
