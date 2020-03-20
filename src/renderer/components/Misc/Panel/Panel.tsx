import React from "react"
import { createClassName } from "../../../utils"
import './Panel.scss';

export type PanelProps = {
    label?:string
    children?:any
    className?:string
}

export default function Panel(props:PanelProps){

    return (
        <fieldset className={createClassName("Panel",{},[props.className])}>
            {props.label && <legend className="Panel__Label">{props.label}</legend>}
            <div className="Panel__Content">{props.children}</div>
        </fieldset>
    )
}