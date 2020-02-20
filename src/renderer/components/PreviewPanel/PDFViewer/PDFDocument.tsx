import React from 'react';
import pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = './pdf.worker.js';
//@ts-ignore
//import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { approximateFraction, getOutputScale, roundToDivide, CSS_UNITS } from './PDFUtils';
import _ from 'lodash';




export type PDFSource = string | Uint8Array | Buffer | null;

export type PDFDocumentProps = {
    src: PDFSource ,
    selectedPages: Array<number>,
    scale: number,
    onChange?: (doc:PDFDocProxy) => void
}

export type PDFDocProxy = {pageCount:number};

export default class PDFDocument extends React.Component<PDFDocumentProps> {

    public static defaultProps = {
        scale: 1,
        selectedPages: []
    };

    private pages: Array<any> = [];
    private pageRefs: Array<any> = [];

    componentDidMount() {
        this.fetch();
    }

    async fetch() {
        if(!this.props.src) return;
        const loadingTask = pdfjs.getDocument(this.props.src);

        const doc = await loadingTask.promise;
        const pageCount: Array<number> = this.props.selectedPages.length == 0?_.range(doc.numPages):this.props.selectedPages;

        this.pageRefs = pageCount.map(() => React.createRef());
        this.pages = await Promise.all(pageCount.map(async (o, i) => await doc.getPage(o + 1)))
            .then(pages => pages.map((page, i) => <PDFPage key={i} ref={this.pageRefs[i]} page={page} scale={this.props.scale} />))
        if(this.props.onChange){
            this.props.onChange({
                pageCount: this.pages.length
            });
        }
        this.forceUpdate();
    }

    updatePages() {
        this.pages = this.pages.map((p, i) => <PDFPage key={i} ref={this.pageRefs[i]} page={p.props.page} scale={this.props.scale} />)
        this.forceUpdate();
    }

    componentDidUpdate(prevProps: PDFDocumentProps) {
        if (this.props.src != prevProps.src) {
            this.fetch();
        }

        if (this.props.scale != prevProps.scale) {
            this.updatePages();
        }


    }

    render() {

        return (
            <div className="PDFDocument">
                {this.pages}
            </div>
        )
    }

}

type PDFPageProps = {
    scale: number,
    page: pdfjs.PDFPageProxy
}


class PDFPage extends React.Component<PDFPageProps> {

    public static defaultProps = {
        scale: 1
    };

    private canvas: HTMLCanvasElement | null = null;
    private isRendering: Boolean = false;

    public async update() {
        if (this.isRendering) return;
        this.isRendering = true;

        const canvas: any = this.canvas;
        if (canvas) {
            const { page } = this.props;

            const viewport = page.getViewport({ scale: this.props.scale * CSS_UNITS });

            // Prepare canvas using PDF page dimensions
            // Use the viewport calculation from https://github.com/mozilla/pdf.js/blob/d6754d1e22fb7b3eb98ace8ce671eac094a4859d/web/pdf_page_view.js#L589
            // for a better rendering

            const ctx = canvas.getContext("2d", { alpha: false });
            const outputScale = getOutputScale(ctx);

            const sfx = approximateFraction(outputScale.sx);
            const sfy = approximateFraction(outputScale.sy);
            canvas.width = roundToDivide(viewport.width * outputScale.sx, sfx[0]);
            canvas.height = roundToDivide(viewport.height * outputScale.sy, sfy[0]);
            canvas.style.width = roundToDivide(viewport.width, sfx[1]) + "px";
            canvas.style.height = roundToDivide(viewport.height, sfy[1]) + "px";


            // Rendering area
            const transform = !outputScale.scaled
                ? null
                : [outputScale.sx, 0, 0, outputScale.sy, 0, 0];
            const renderContext = {
                canvasContext: ctx,
                transform,
                viewport: viewport,
                enableWebGL: false,
                renderInteractiveForms: false,
            };
            const renderTask = page.render(renderContext);

            await renderTask.promise;

        }
        this.isRendering = false;
    };

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps: PDFPageProps) {
        if (this.props.scale != prevProps.scale) {
            this.update();
        }
    }

    render() {
        return (
            <canvas className="PDFPage" ref={ref => {
                this.canvas = ref;
                this.update()
            }} />
        )
    }
}