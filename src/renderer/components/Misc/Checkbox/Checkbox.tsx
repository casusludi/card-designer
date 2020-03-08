import React from "react";
import './Checkbox.scss'
import uuid from "uuid/v4";

export type CheckboxProps = {
    id?: string
    label: string
    defaultChecked: boolean
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
            <div className={"Checkbox" + (this.props.buttonStyle ? " Checkbox__buttonStyle" : "")}>
                <input className="Checkbox__input" type="checkbox" id={this.state.id} name={this.props.id} defaultChecked={this.props.defaultChecked} onChange={e => this.props.onChange && this.props.onChange(e.target.checked)} />
                <label className="Checkbox__label" htmlFor={this.state.id}>
                    {this.props.label}
                </label>
            </div>
        )
    }
}