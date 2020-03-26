import React from "react";
import './PathInput.scss'
import { showOpenDialog } from "../../../utils";
import Button from "../Button";
import { PathInputType } from ".";
import { FileFilter } from "electron";

export type PathInputProps = {
    id?:string,
    label?:string
    labelOnTop?:boolean
    type:PathInputType
    defaultPath?:string
    filters?:FileFilter[]
    value:string
    className?:string
    onChange?: (path:string) => void
}

export type PathInputState = {
    value:string
}

export default class PathInput extends React.Component<PathInputProps>{

    state:PathInputState = {
        value:this.props.value
    }

    componentDidUpdate(prevProps:PathInputProps){
        if(this.props.value != prevProps.value){
            this.setState({
                value:this.props.value
            })
        }
    }

    getDialogProperties():any{
        switch(this.props.type){
            default:
            case PathInputType.Folder: return ['openDirectory','createDirectory','promptToCreate'];
            case PathInputType.File: return ['openFile ','promptToCreate'];
        }
    }

    async openExplorer(){

        const result = await showOpenDialog({
            title:"Select Folder",
            defaultPath: this.props.defaultPath,
            filters: this.props.filters,
            properties: this.getDialogProperties()
        })
        if (!result.canceled && result.filePaths.length > 0) {
            const value = result.filePaths[0];
            this.setState({
                value
            })
            if(this.props.onChange)this.props.onChange(value);
        }
    
    }

    onInputChange(e: React.ChangeEvent<HTMLInputElement>){
        const value = e.target.value;
        this.setState({
            value
        })
        if(this.props.onChange)this.props.onChange(value)
    }

    render(){
        return (
            <div className={"PathInput"+(this.props.className?" "+this.props.className:"")+(this.props.labelOnTop?" PathInput_labeltop":"")}>
                {this.props.label && <label className="PathInput__label" htmlFor={this.props.id} >{this.props.label}</label>}
                <div className="PathInput__content">
                <input className="PathInput__input" id={this.props.id} type="string" value={this.state.value} onChange={this.onInputChange.bind(this)} />
                <Button fontIcon="far fa-folder-open" className="PathInput__button" onClick={this.openExplorer.bind(this)} />
                </div>
            </div>
        )
    }
}