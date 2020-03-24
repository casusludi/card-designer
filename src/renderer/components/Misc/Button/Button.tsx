import React from "react"
import { createClassName } from "../../../utils"

export type ButtonProps = {
    label?:any
    children?:any
    className?:string
    disabled?:boolean
    fontIcon?:string
    borderless?:boolean
    onClick?:((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined
}

export default function Button(props:ButtonProps){


    return (
    <button type="button" className={createClassName("button",{"button-frameless":!!props.borderless},[props.className])} disabled={props.disabled} onClick={props.onClick}>{props.fontIcon && <i className={createClassName("icon",{},[props.fontIcon])}></i>}{props.label && <span>{props.label}</span>}{props.children}</button>
    )
}