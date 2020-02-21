'use strict'
import React, { Component } from 'react';
import { connect } from "react-redux";
import './App.scss';

import { AuthType } from '../../services/Auth';
import { GoogleBar } from '../Google/GoogleBar';
import EditorPanel, { AppUIEditor } from '../EditorPanel/EditorPanel';
import PreviewPanel, { AppUIPreview } from '../PreviewPanel/PreviewPanel';
import { Project } from '../../services/Project';
import { ApplicationState, Users } from '../..';
import { projectOpenFromDialog, projectFetchData, projectSaving, projectOpenFromPath } from '../../redux/project';
import { Dispatch } from 'redux';
import { ProjectSourceType, FetchDataStatus } from '../../services/Project/Sources';
import { authSignIn, authSignOut } from '../../redux/auth';
import { prefEditorWidthChanged } from '../../redux/preferences';
import { AppUIExport } from '../EditorPanel/ExportEditor/ExportEditor';
import { remote } from 'electron';
import WindowControls from '../WindowControls/WindowControls';
import { LayoutPreferences } from '../../services/Preferences';

export type AppUIOthers = {
	fetchDataStatus:{
		[type:string]:FetchDataStatus
	}
}

export type AppUI = {
	editor: AppUIEditor
	preview: AppUIPreview
	export: AppUIExport
	others: AppUIOthers
}

export type AppProps = {
	project: Project | null
	users: Users
	dispatch: Dispatch
	ui: AppUI,
	layoutPreferences: LayoutPreferences
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

class App extends Component<AppProps> {

	async authSignIn() {
		this.props.dispatch(authSignIn({ authType: AuthType.GOOGLE }));

	}

	async authSignOut() {
		this.props.dispatch(authSignOut({ authType: AuthType.GOOGLE }));
	}

	async fetchFromGSheet() {
		if (this.props.project) {
			this.props.dispatch(projectFetchData({
				project: this.props.project,
				sourceType: ProjectSourceType.GSHEETS,
				user: this.props.users[AuthType.GOOGLE]
			}))
		}
	}

	openProjectFromDialog() {
		this.props.dispatch(projectOpenFromDialog())
	}

	openProjectFolder() {
		if(this.props.project?.path){
			remote.shell.openItem(this.props.project.path)
		}
	}

	openReloadProject() {
		if(this.props.project){
			this.props.dispatch(projectOpenFromPath({path:this.props.project.path}))
		}
	}

	startAdjustEditorWidth(evt: React.MouseEvent) {
		makePositionAdjuster(
			PositionType.Vertical,
			this.props.layoutPreferences.editorWidth,
			evt.clientX,
			(val, diff) => {
				this.props.dispatch(prefEditorWidthChanged({ editorWidth: Math.max(val - diff, 584) }))
			}
		)
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
							<button className="button" onClick={() => this.openReloadProject()} ><i className="fas fa-sync"></i></button>
						</div>
					</div>
					<div className="layout__header-title">
						<img className="ImageIcon ImageIcon_small Header__AppIcon" src="./icon.png" />
						Cardmaker Studio
						{this.props.project && <div className="project-bar__name">
							- {this.props.project.name}
							<button className="button button-frameless" onClick={() => this.openProjectFolder()} ><i className="icon far fa-folder-open"></i></button>
							{this.props.project.modified && <span className="project-bar__modified">(not saved)<i className="icon fas fa-exclamation-triangle"></i></span>}
							
						</div>}

					</div>
					<div className="layout__header-right">
						<GoogleBar className="right-align"
							fetchDataStatus={this.props.ui.others.fetchDataStatus[ProjectSourceType.GSHEETS]}
							user={this.props.users[AuthType.GOOGLE]}
							signInAction={() => this.authSignIn()}
							signOutAction={() => this.authSignOut()}
							fetchAction={() => this.fetchFromGSheet()}
						/>
						<WindowControls/>
					</div>
				</header>
				<div className="layout__body">
					<main className="viewer">
						<div className="viewer-tabset">
							<div className="viewer-tabitem">
								<PreviewPanel
									ui={this.props.ui.preview}
									project={this.props.project}
								/>
							</div>
						</div>
					</main>
					<aside className="editor" style={{ width: `${this.props.layoutPreferences.editorWidth}px` }} >
						<div className="editor__width-adjuster" onMouseDown={evt => this.startAdjustEditorWidth(evt)} ></div>
						<EditorPanel width={this.props.layoutPreferences.editorWidth} />
					</aside>
				</div>
				<footer className="layout__footer"></footer>
			</div>
		);
	}

}

function mapStateToProps(state: ApplicationState) {
	return {
		project: state.project,
		users: state.users,
		ui: state.ui,
		layoutPreferences: state.preferences.layout
	}

}

export default connect(
	mapStateToProps
)(App)
