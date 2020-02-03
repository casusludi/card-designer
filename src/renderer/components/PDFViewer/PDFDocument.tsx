import React, { RefObject } from 'react';
import pdfjs from 'pdfjs-dist';
//@ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { approximateFraction, getOutputScale, roundToDivide, CSS_UNITS } from './PDFUtils';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export type PDFDocumentProps = {
    src:string,
    selectedPages:Array<number>,
    scale:number
}

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

    async fetch(){
        const loadingTask = pdfjs.getDocument(this.props.src);

        const doc = await loadingTask.promise;
        const pageCount:Array<number> = Array(doc.numPages);
        
        this.pageRefs = Array.from(pageCount, () => React.createRef());
        this.pages = await Promise.all(Array.from(pageCount, async (e, i) => await doc.getPage(i+1)))
        .then(pages => pages.map( (page,i) => <PDFPage key={i} ref={ this.pageRefs[i]} page={page} scale={this.props.scale} />))

       // await this.updatePages();
        this.forceUpdate();
    }

    async updatePages(){
     
    }

    componentDidUpdate(prevProps: PDFDocumentProps) {
        if (this.props.scale != prevProps.scale) {
            this.updatePages();
        }
    }

    render(){
        
        return (
            <div>
                {this.pages}
            </div>
        )
    }

}

type PDFPageProps = {
    scale: number,
    page:pdfjs.PDFPageProxy
}


class PDFPage extends React.Component<PDFPageProps> {

    public static defaultProps = {
        scale: 1
    };
    
    private canvas: HTMLCanvasElement | null = null;
    private isRendering:Boolean = false;
    
    public async update(){
        if(this.isRendering)return;
        this.isRendering = true;
        //if(!this.canvasRef) return;
        const canvas: any = this.canvas;//this.canvasRef.current;
        if (canvas) {
     
        const {page} = this.props;

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
            this.isRendering = false;
        }
    };

    componentDidMount(){

        this.update();
    }

    componentDidUpdate(prevProps: PDFPageProps) {
        if (this.props.scale != prevProps.scale) {
            this.update();
        }
    }
    
    render(){
        return (
            <canvas ref={ref => {
                this.canvas = ref;
                this.update()
            }} />
        )
    }
}