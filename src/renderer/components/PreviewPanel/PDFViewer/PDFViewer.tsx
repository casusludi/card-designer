'use strict'
import React from 'react';
import './PDFViewer.scss'

import PDFDocument, { PDFSource, PDFDocProxy } from './PDFDocument';
import Select from '../../Misc/Select/Select';

export type PDFViewerProps = {
    src: PDFSource,
    lastRenderTime?: number | null
};

export type PDFViewerState = {
    pageCount: number
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
        pageCount: 0,
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

    onDocChange(doc:PDFDocProxy){
        this.setState({
            pageCount: doc.pageCount
        })
    }

    render() {
        return (
            <div className="PDFViewer">
                <div className="PDFViewer__header">
                    <div className="PDFViewer__header-renderTime">{ !!this.props.lastRenderTime && `Render Time : ${this.props.lastRenderTime}ms`  }</div>
                    <div>{ this.state.pageCount ? `${this.state.pageCount} page${this.state.pageCount > 1?"s":""}`:'' }</div>
                    
                    <Select id="zoom" label="Zoom" disabled={!this.state.src} value={this.state.scale}  onChange={value => this.setState({ scale: parseFloat(value) })} options={scales} />

                </div>
                {
                    this.state.src?
                    <div className="PDFViewer__viewport" onMouseUp={evt => this.startGrabbingViewPort(evt)}>
                    <PDFDocument onChange={this.onDocChange.bind(this)}  src={this.state.src} scale={this.state.scale} />
                </div>
                :
                    <div className="PDFViewer__no">
                        No PDF to preview
                    </div>
                }
                

            </div>
        );
    }
   
    

}