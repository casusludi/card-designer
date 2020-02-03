'use strict'
import React from 'react';
import { Document, Page,pdfjs } from 'react-pdf/dist/entry.webpack';
//pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import 'react-pdf/dist/Page/AnnotationLayer.css';
import './PDFViewer.scss'

import chokidar, { FSWatcher } from 'chokidar';
import PDFDocument from './PDFDocument';


export type PDFViewerProps = {
    filePath: string
};

export type PDFViewerState = {
    numPages: Number | null,
    doc: any,
    zoom: number,
    filePath: string,
}

const zooms = [
    { label: '50%', value: 0.50 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2 }
];

export default class PDFViewer extends React.Component<PDFViewerProps, PDFViewerState> {

    state = {
        numPages: null,
        zoom: 1,
        doc: null,
        filePath: this.props.filePath,
    }

    private fileWatcher: FSWatcher | null = null;

    private doc: any | null = null;

    onDocumentLoadSuccess = (pdf: any) => {
        console.log(pdf);
        this.setState({ numPages: pdf.numPages });
    }

    componentDidMount() {
        const latency = 100;
        let timerId: any;
        this.fileWatcher = chokidar.watch(this.state.filePath).on('change', (event, path) => {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
                if (this.doc) this.doc.fetch();
            }, latency)

        });
    }

    componentWillUnmount() {
        if (this.fileWatcher) {
            this.fileWatcher.close();
        }
    }

    componentDidUpdate(prevProps: PDFViewerProps, prevState: PDFViewerState) {
        if (this.fileWatcher && prevState.filePath != this.state.filePath) {
            if (prevState.filePath) {
                this.fileWatcher.unwatch(prevState.filePath);
            }
            this.fileWatcher.add(this.state.filePath)
        }
    }

    render() {
        return (
            <div className="PDFViewer">
                <div className="PDFViewer__header">
                    <div>page count : {this.state.numPages}  </div>
                    <div>
                        <label htmlFor="zoom"> Zoom : </label>
                        <select id="zoom" value={this.state.zoom} onChange={e => this.setState({ zoom: parseFloat(e.target.value) })} >
                            {zooms.map((o, k) => <option key={k} value={o.value}>{o.label}</option>)}
                        </select></div>
                </div>
                <div className="PDFViewer__viewport">
                    <PDFDocument src={this.state.filePath} ref={(ref) => { this.doc = ref; }} />
                    {/*<Document
                        className="PDFViewer__scrollcontent"
                        file={this.state.filePath}
                        onLoadSuccess={this.onDocumentLoadSuccess}
                        ref={(ref) => { this.doc = ref; }}
                    >
                        {Array.from(Array(this.state.numPages), (e, i) =>
                            <Page pageNumber={i + 1} key={i} scale={this.state.zoom} renderTextLayer={false} renderAnnotationLayer={false} />
                        )}
                        </Document>*/}
                </div>

            </div>
        );
    }

}