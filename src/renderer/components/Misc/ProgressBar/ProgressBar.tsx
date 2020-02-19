import React from "react";
import './ProgressBar.scss';

export type ProgressBarProps = {
    rate:number
    className?:string
    disabled?:boolean
    spinner?:boolean
}

export default function ProgressBar(props:ProgressBarProps){

    return (
        <div className={"ProgressBar"+(props.className?" "+props.className:"")+(props.disabled?" ProgressBar_disabled":"")}>
            <div className="ProgressBar__filler" style={{width:`${Math.min(Math.max(0,props.rate*100),100)}%`}}></div>
            {props.spinner && <div className="ProgressBar__spinner"><i className="fas fa-spin fa-spinner"></i></div>}
        </div>
    )
}