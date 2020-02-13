'use strict'
import React, { Component } from 'react';
import { connect } from "react-redux";
import './App.scss';
import fs from 'fs';
import { PDFSource } from '../PDFViewer/PDFDocument';
import { convertHtmlToPdf } from '../../utils';
import { AuthType } from '../../services/Auth';
import { GoogleBar } from '../Google/GoogleBar';
import EditorPanel from '../EditorPanel/EditorPanel';
import PreviewPanel from '../PreviewPanel/PreviewPanel';
import { Project, ProjectSelection } from '../../services/Project';
import { ApplicationState, Users } from '../..';
import { projectOpenFromDialog, projectFetchData, projectSaving } from '../../redux/project';
import { Dispatch } from 'redux';
import { ProjectSourceType } from '../../services/Project/Sources';
import { authSignIn,authSignOut } from '../../redux/auth';

const PDF_FILE_TEST: string = `./tmp/events.pdf`;
const HTML_FILE_TEST: string = `./tmp/clients.html`;

export type AppUIPreview = {
    pdf:PDFSource,
    html:string|null
}

export type AppUI = {
    editor:AppUIEditor,
    preview:AppUIPreview
}

export type AppUIEditor = {
	selectedSourceType:ProjectSourceType,
	selection:ProjectSelection|undefined|null
}

type AppState = {
	editorWidth: number
	pdfToView: PDFSource
}

export type AppProps = {
	project: Project | null
	users: Users
	dispatch: Dispatch
	ui:AppUI
}

enum PositionType {
	Vertical,
	Horizontal
}

function makePositionAdjuster(type: PositionType, initialValue: number, initialMousePos: number, callback: (val: number, diff: number) => void) {

	let currentMousePos = initialMousePos;
	document.body.style.cursor = "ew-resize";
	document.addEventListener('mousemove', adjustEditorWidthMouseMove);
	document.addEventListener('mouseup', adjustEditorWidthMouseUp);
	const _enterFrameId = window.setInterval(adjustEditorWidthEnterFrame, 33);


	function adjustEditorWidthMouseMove(evt: MouseEvent) {
		currentMousePos = type == PositionType.Vertical ? evt.clientX : evt.clientY;

	}

	function adjustEditorWidthMouseUp(evt: MouseEvent) {
		document.body.style.cursor = "";
		currentMousePos = type == PositionType.Vertical ? evt.clientX : evt.clientY;
		window.clearInterval(_enterFrameId);
		document.removeEventListener('mousemove', adjustEditorWidthMouseMove);
		document.removeEventListener('mouseup', adjustEditorWidthMouseUp);
		callback(initialValue, (currentMousePos - initialMousePos));

	}

	function adjustEditorWidthEnterFrame() {
		callback(initialValue, (currentMousePos - initialMousePos));
	}
}

class App extends Component<AppProps, AppState> {

	state = {
		editorWidth: parseInt(window.localStorage.getItem("editorWidth") || "500"),
		pdfToView: PDF_FILE_TEST
	}

	async componentDidMount() {


	}

	async authSignIn() {
		this.props.dispatch(authSignIn({authType:AuthType.GOOGLE}));

	}

	async authSignOut() {
		this.props.dispatch(authSignOut({authType:AuthType.GOOGLE}));
	}

	async fetchFromGSheet() {
		if (this.props.project) {
			this.props.dispatch(projectFetchData({
				project:this.props.project, 
				sourceType:ProjectSourceType.GSHEETS, 
				user:this.props.users[AuthType.GOOGLE]
			}))
		}
	}

	openProjectFromDialog() {
		console.log(projectOpenFromDialog());
		this.props.dispatch(projectOpenFromDialog())
	}

	startAdjustEditorWidth(evt: React.MouseEvent) {
		makePositionAdjuster(
			PositionType.Vertical,
			this.state.editorWidth,
			evt.clientX,
			(val, diff) => this.setState({
				editorWidth: val - diff
			}, () => window.localStorage.setItem("editorWidth", this.state.editorWidth.toString())))
	}

	render() {
		return (

			<div className="layout">
				<header className="layout__header">
					{/*<div className="project-name">{state.project && state.project.name} {state.projectModified && <span className="project-modified-status"> &#9679;</span>}</div>*/}
					<div className="project-bar right-align">
						<div className="button-bar">
							<button className="button" ><i className="icon far fa-file"></i></button>
							<button className="button" onClick={() => this.openProjectFromDialog()} ><i className="icon far fa-folder-open"></i></button>
							<button className="button" disabled={!this.props.project?.modified} onClick={() => this.props.dispatch(projectSaving())}><i className="icon far fa-save"></i></button>
						</div>
						<button className="button" onClick={() => this.testPDFConverter()} >Test pdf converter</button>
						
					</div>
					<div className="layout__header-title">
						Cardmaker Studio
						{this.props.project && <div className="project-bar__name">
							- {this.props.project.name}{this.props.project.modified && <span className="project-bar__modified">(not saved)<i className="icon fas fa-exclamation-triangle"></i></span>}
						</div>}
						
					</div>
					
					<GoogleBar className="right-align"
						user={this.props.users[AuthType.GOOGLE]}
						signInAction={() => this.authSignIn()}
						signOutAction={() => this.authSignOut()}
						fetchAction={() => this.fetchFromGSheet()}
					/>
				</header>
				<div className="layout__body">
					<main className="viewer">
						<div className="viewer-tabset">
							<div className="viewer-tabitem">
								<PreviewPanel
									ui={this.props.ui.preview}
									finalPreview={this.state.pdfToView}
								/>
							</div>
						</div>
					</main>
					<aside className="editor" style={{ width: `${this.state.editorWidth}px` }} >
						<div className="editor__width-adjuster" onMouseDown={evt => this.startAdjustEditorWidth(evt)} ></div>
						<EditorPanel width={this.state.editorWidth} />
					</aside>
				</div>
				<footer className="layout__footer"></footer>
			</div>
		);
	}

	async testPDFConverter() {

		//@ts-ignore
		const filePath = __static + '/' + HTML_FILE_TEST;
		//@ts-ignore
		const data = await convertHtmlToPdf(fs.readFileSync(filePath).toString(), __static);
		this.setState({
			pdfToView: data
		})
	}
}

function mapStateToProps(state: ApplicationState) {
	console.log("mapStateToProps", state);
	return {
		project: state.project,
		users: state.users,
		ui:state.ui
	}

}


export default connect(
	mapStateToProps
)(App)
