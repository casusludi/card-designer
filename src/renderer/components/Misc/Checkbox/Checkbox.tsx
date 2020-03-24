import React from "react";
import './Checkbox.scss'
import uuid from "uuid/v4";
import { createClassName } from "../../../utils";

export type CheckboxProps = {
    id?: string
    label?: string
    className?:string
    defaultChecked?: boolean
    checked?: boolean
    buttonStyle?: boolean
    onChange?: (value: boolean) => void
}

export type CheckboxState = {
    id: string
}

export default class Checkbox extends React.Component<CheckboxProps,CheckboxState> {

    state = {
        id:this.props.id?this.props.id:uuid()
    }

    render() {
        return (
            <div className={createClassName("Checkbox",{"Checkbox__buttonStyle":!!this.props.buttonStyle},[this.props.className])} >
                <input className="Checkbox__input" type="checkbox" id={this.state.id} name={this.props.id} defaultChecked={this.props.defaultChecked} checked={this.props.checked} onChange={e => this.props.onChange && this.props.onChange(e.target.checked)} />
                <label className="Checkbox__label" htmlFor={this.state.id}>
                    {this.props.label}
                </label>
            </div>
        )
    }
}