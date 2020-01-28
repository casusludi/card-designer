'use strict'
import React from 'react';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import chokidar from 'chokidar';

const FILE_TEST:string = `C:\\Users\\Pierre\\projets\\casusludi\\orangeda\\export\\basic\\clients.pdf`;

export default class PDFViewer extends React.Component {

    state = {
        numPages: null,
        doc: null,
        pageNumber: 1,
    }

    public doc: any | null = null;

    onDocumentLoadSuccess = (pdf: any) => {
        this.setState({ numPages: pdf.numPages });
    }

    componentDidMount() {

        // One-liner for current directory
        chokidar.watch(FILE_TEST).on('all', (event, path) => {
          console.log(event, path,this.doc); 
          if(this.doc)this.doc.loadDocument();
          //this.state.doc.
        });

        window.addEventListener('error', function (e) {
            var error = e.error;
            console.log(error);
        });
    }

    render() {
        const { pageNumber, numPages } = this.state;

        return (
            <div>
                <Document
                    file={FILE_TEST}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                    ref={(ref) => { this.doc = ref }}
                    onSourceError={()=> console.log('onSourceError')}
                    onLoadError={()=> console.log('onLoadError')}
                >
                    <Page pageNumber={pageNumber} />
                </Document>
                <p>Page {pageNumber} of {numPages}</p>
            </div>
        );
    }

}