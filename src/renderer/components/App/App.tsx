'use strict'
import React, { Component } from 'react';
import PDFViewer from '../PDFViewer/PDFViewer';
import './App.scss';

const FILE_TEST: string = `C:\\Users\\Pierre\\projets\\casusludi\\orangeda\\export\\basic\\clients.pdf`;

type AppState = {
	editorWidth:number
}

enum PositionType {
	Vertical,
	Horizontal
}

function makePositionAdjuster(type:PositionType,initialValue:number,initialMousePos:number,callback: (val:number,diff:number) => void){

			let currentMousePos = initialMousePos;
			document.body.style.cursor = "ew-resize";
			document.addEventListener('mousemove', adjustEditorWidthMouseMove);
			document.addEventListener('mouseup', adjustEditorWidthMouseUp);
			const _enterFrameId = window.setInterval(adjustEditorWidthEnterFrame,100);


			function adjustEditorWidthMouseMove(evt:MouseEvent){
				currentMousePos = type == PositionType.Vertical?evt.clientX:evt.clientY;
			
			}
		
			function adjustEditorWidthMouseUp(evt:MouseEvent){
				document.body.style.cursor = "";
				currentMousePos = type == PositionType.Vertical?evt.clientX:evt.clientY;
				window.clearInterval(_enterFrameId);
				document.removeEventListener('mousemove', adjustEditorWidthMouseMove);
				document.removeEventListener('mouseup', adjustEditorWidthMouseUp);
				callback(initialValue,(currentMousePos-initialMousePos));
		
			}
		
			function adjustEditorWidthEnterFrame(){
				callback(initialValue,(currentMousePos-initialMousePos));
			}
}

export default class App extends Component<void,AppState> {

	state = {
		editorWidth: parseInt(window.localStorage.getItem("editorWidth") || "500")
	}


	startAdjustEditorWidth(evt:React.MouseEvent){
		makePositionAdjuster(
			PositionType.Vertical,
			this.state.editorWidth,
			evt.clientX, 
			(val,diff) => this.setState({
				editorWidth:val-diff
			},() => window.localStorage.setItem("editorWidth",this.state.editorWidth.toString())))
	}

	render() {
		return (

			<div className="layout">
				<header className="layout__header">
					{/*<div className="project-name">{state.project && state.project.name} {state.projectModified && <span className="project-modified-status"> &#9679;</span>}</div>*/}
					<div className="button-bar right-align">
						<button className="button" ><i className="icon far fa-file"></i></button>
						<button className="button" ><i className="icon far fa-folder-open"></i></button>
						<button className="button" ><i className="icon far fa-save"></i></button>
					</div>
					<div className="button-bar right-align">
						<button className="button"><i className="icon fas fa-download"></i><span>Google Sheets</span></button>
						{/*googleAuth*/}
					</div>
				</header>
				<div className="layout__body">
					<main className="viewer">
						<div className="viewer-tabset">
							<div className="viewer-tabitem"> <PDFViewer filePath={FILE_TEST} /></div>
						</div>
					</main>
					<aside className="editor" style={{width:`${this.state.editorWidth}px`}} >
						<div className="editor__width-adjuster" onMouseDown={evt => this.startAdjustEditorWidth(evt)} ></div>
						{/*editorTabsVdom*/}
					</aside>
				</div>
				<footer className="layout__footer"></footer>
			</div>
		);
	}
}

