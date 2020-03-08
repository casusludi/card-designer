import React from "react";
import './Input.scss';
import uuid from "uuid";



export type InputProps = {
    type:string
    id?:string
    className?:string
    disabled?:boolean
    name?:string
    label?:string
    labelOnTop?:boolean
    units?:string
    defaultValue?:string|number
    value?:string|number
    onChange?:(e:React.ChangeEvent<HTMLInputElement>) => void
}

export type InputState = {
    id:string
}

export default class Input extends React.Component<InputProps>{

    state = {
        id:this.props.id?this.props.id:uuid()
    }

    render(){
        return (
            <div className={"Input"+(this.props.className?' '+this.props.className:'')+(this.props.disabled?' Input__disabled':'')+(this.props.labelOnTop?" Input_labeltop":"")}>
                {this.props.label && <label className="Input__label" htmlFor={this.state.id}>{this.props.label}</label>}
                <div className="Input__wrapper">
                    <input 
                        className="Input__input"
                        type={this.props.type} 
                        disabled={this.props.disabled}
                        id={this.state.id} 
                        name={this.props.name} 
                        defaultValue={this.props.defaultValue}
                        value={this.props.value}
                        onChange={this.props.onChange}
                        />
                    {this.props.units && <div className="Input__units">{this.props.units}</div>}
                </div>
            </div>
        )
    }
}
