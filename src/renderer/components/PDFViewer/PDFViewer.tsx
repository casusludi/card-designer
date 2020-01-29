'use strict'
import React from 'react';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import './PDFViewer.scss'

import chokidar, { FSWatcher } from 'chokidar';


export type PDFViewerProps = {
    filePath: string
};

export type PDFViewerState = {
    numPages: Number | null,
    doc: any,
    pageNumber: Number,
    filePath: string,
}

export default class PDFViewer extends React.Component<PDFViewerProps, PDFViewerState> {

    state = {
        numPages: null,
        doc: null,
        pageNumber: 1,
        filePath: this.props.filePath,
    }

    private fileWatcher: FSWatcher | null = null;

    private doc: any | null = null;

    onDocumentLoadSuccess = (pdf: any) => {
        this.setState({ numPages: pdf.numPages });
    }

    componentDidMount() {
        const latency = 100;
        let timerId: any;
        this.fileWatcher = chokidar.watch(this.state.filePath).on('change', (event, path) => {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
                if (this.doc) this.doc.loadDocument();
            }, latency)

        });
    }

    componentWillUnmount(){
        if(this.fileWatcher){
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
        const { pageNumber, numPages } = this.state;

        return (
            <div className="PDFViewer">
                <Document
                    file={this.state.filePath}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                    ref={(ref) => { this.doc = ref; }}
                >
                    <Page pageNumber={pageNumber} scale={1} />
                </Document>
                <p>Page {pageNumber} of {numPages}</p>
            </div>
        );
    }

}