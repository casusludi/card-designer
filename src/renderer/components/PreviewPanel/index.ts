import { PDFSource } from './PDFViewer/PDFDocument';

export {default} from './PreviewPanel';

export type AppUIPreview = {
    pdf:PDFSource
    pdfLastRenderTime: number | null
    htmlUrl:string|null
}
