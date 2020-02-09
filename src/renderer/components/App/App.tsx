'use strict'
import React, { Component } from 'react';
import { connect } from "react-redux";
import './App.scss';
import fs from 'fs';
import { PDFSource } from '../PDFViewer/PDFDocument';
import {convertHtmlToPdf} from '../../utils';
import { AuthService, makeAuth, AuthType, User, UNKNOW_USER } from '../../services/Auth';
import { GlobalSettings } from '../../../types';
import { GoogleBar } from '../Google/GoogleBar';
import {fetchFromGSheet} from '../../services/DataFetch/GSheet/GSheet';
import EditorPanel from '../EditorPanel/EditorPanel';
import PreviewPanel from '../PreviewPanel/PreviewPanel';
import {Project} from '../../services/Project';
import { ApplicationState } from '../..';
import { openProjectFromDialog } from '../../redux/actions';

//const FILE_TEST: string = `C:\\Users\\Pierre\\projets\\casusludi\\orangeda\\export\\basic\\clients.pdf`;
const PDF_FILE_TEST: string = `./tmp/events.pdf`;
const HTML_FILE_TEST: string = `./tmp/clients.html`;



type AppState = {
	editorWidth:number
	pdfToView:PDFSource
	user:User | null
}

export type AppProps = {
	settings: GlobalSettings,
	project:Project | null,
	openProjectFromDialog: () => void
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
			const _enterFrameId = window.setInterval(adjustEditorWidthEnterFrame,33);


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

class App extends Component<AppProps,AppState> {

	state = {
		editorWidth: parseInt(window.localStorage.getItem("editorWidth") || "500"),
		pdfToView: PDF_FILE_TEST,
		user:UNKNOW_USER
	}

	private auth:AuthService|null = null;

	async componentDidMount(){
		this.auth = makeAuth(AuthType.GOOGLE,this.props.settings);
		if(this.auth){
			this.setState({
				user: this.auth.getUser()
			})
		}
	
	}

	async authSignIn() {
		if(this.auth){
			const user = await this.auth.signIn();
			this.setState({user});
		}
	}

	async authSignOut() {
		if(this.auth){
			await this.auth.signOut();
			this.setState({user:UNKNOW_USER});
		}
	}

	async fetchFromGSheet(){
		if(this.auth){
			const user = await this.auth.refreshToken();
			this.setState({user});
		}
		const data = await fetchFromGSheet('1ERJe7kgsTBq5v886cZ-TdF9CmsoYgDS8n3aniv0p_cA',this.state.user.tokens);
		console.log(data);
	}

	openProjectFromDialog(){
		//const project = await openProjectFromDialog();
		//console.log(project);
		//if(project)this.setState({project});
		this.props.openProjectFromDialog();

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
						<button className="button" onClick={() => this.openProjectFromDialog()} ><i className="icon far fa-folder-open"></i></button>
						<button className="button" ><i className="icon far fa-save"></i></button>
					</div>
					<button className="button" onClick={() => this.testPDFConverter()} >Test pdf converter</button> 
					<GoogleBar className="right-align"  
						user={this.state.user}
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
									finalPreview={this.state.pdfToView}
								/>
							</div>
						</div>
					</main>
					<aside className="editor" style={{width:`${this.state.editorWidth}px`}} >
						<div className="editor__width-adjuster" onMouseDown={evt => this.startAdjustEditorWidth(evt)} ></div>
						<EditorPanel project={this.props.project} width={this.state.editorWidth} />
					</aside>
				</div>
				<footer className="layout__footer"></footer>
			</div>
		);
	}

	async testPDFConverter() {
	
		//@ts-ignore
		const filePath = __static+'/'+HTML_FILE_TEST;
		//@ts-ignore
		const data = await convertHtmlToPdf(fs.readFileSync(filePath).toString(),__static);
		this.setState({
			pdfToView: data
		})
	}
}

function mapStateToProps(state:ApplicationState){
	console.log("mapStateToProps",state)
	return {
		project: state.project
	}

}


export default connect(
	mapStateToProps,
	{
		openProjectFromDialog:() => openProjectFromDialog()
	}
)(App)
