'use strict'
import React from 'react';
import './PDFViewer.scss'

import PDFDocument, { PDFSource } from './PDFDocument';
import Select from '../../Misc/Select/Select';

export type PDFViewerProps = {
    src: PDFSource
};

export type PDFViewerState = {
    numPages: Number | null
    doc: any
    scale: number
    src: PDFSource
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
        src: this.props.src,
    }

    componentDidUpdate(prevProps: PDFViewerProps, prevState: PDFViewerState) {
        if (this.props.src != this.state.src) {
            this.setState({src:this.props.src})
        }

    }

    startGrabbingViewPort(event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        
    }

    render() {
        return (
            <div className="PDFViewer">
                <div className="PDFViewer__header">
                    <div>page count : {this.state.numPages}  </div>
                    <Select id="zoom" label="Zoom" defaultValue={this.state.scale}  onChange={value => this.setState({ scale: parseFloat(value) })} options={scales} />

                </div>
                <div className="PDFViewer__viewport" onMouseUp={evt => this.startGrabbingViewPort(evt)}>
                    <PDFDocument src={this.state.src} scale={this.state.scale} />
                </div>

            </div>
        );
    }
   
    

}