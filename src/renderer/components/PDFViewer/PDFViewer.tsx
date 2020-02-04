'use strict'
import React from 'react';
import './PDFViewer.scss'

import chokidar, { FSWatcher } from 'chokidar';
import PDFDocument from './PDFDocument';

export type PDFViewerProps = {
    filePath: string
};

export type PDFViewerState = {
    numPages: Number | null,
    doc: any,
    scale: number,
    filePath: string,
}

const scales = [
    { label: '50%', value: 0.50 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2 }
];

export default class PDFViewer extends React.Component<PDFViewerProps, PDFViewerState> {

    state = {
        numPages: null,
        scale: 1,
        doc: null,
        filePath: this.props.filePath,
    }

    private fileWatcher: FSWatcher | null = null;

    private doc: PDFDocument | null = null;

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

    startGrabbingViewPort(event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        
    }

    render() {
        return (
            <div className="PDFViewer">
                <div className="PDFViewer__header">
                    <div>page count : {this.state.numPages}  </div>
                    <div>
                        <label htmlFor="scale"> Zoom : </label>
                        <select id="scale" value={this.state.scale} onChange={e => this.setState({ scale: parseFloat(e.target.value) })} >
                            {scales.map((o, k) => <option key={k} value={o.value}>{o.label}</option>)}
                        </select></div>
                </div>
                <div className="PDFViewer__viewport" onMouseUp={evt => this.startGrabbingViewPort(evt)}>
                    <PDFDocument src={this.state.filePath} scale={this.state.scale} ref={(ref) => { this.doc = ref; }} />
                </div>

            </div>
        );
    }
   
    

}