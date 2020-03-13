import React from "react";
import './Input.scss';
import uuid from "uuid";

export enum InputSize {
    Normal = "normal",
    Small = "small",
    Large = "large"
}

export type InputProps = {
    type:string
    id?:string
    className?:string
    size?:InputSize
    disabled?:boolean
    name?:string
    label?:string
    labelOnTop?:boolean
    pattern?:string
    units?:string
    defaultValue?:string|number
    value?:string|number
    onChange?:(value:string|number) => void
}

export type InputState = {
    id:string
}

export default class Input extends React.Component<InputProps>{

    state = {
        id:this.props.id?this.props.id:uuid()
    }

    /*componentDidUpdate(prevProps:InputProps){

    }*/
    private inputRef:HTMLInputElement| null = null;

    onUnitClick(){
        if(this.inputRef){
            this.inputRef.focus();
            this.inputRef.select();
        }
    }

    onInputFocus(){
        if(this.inputRef){
            this.inputRef.select();
        }
    }

    render(){
        return (
            <div className={"Input"+(this.props.className?' '+this.props.className:'')+(this.props.disabled?' Input__disabled':'')+(this.props.labelOnTop?" Input_labeltop":"")+(this.props.units?" Input_WithUnits":"")+ (this.props.size ? " Input_size_"+this.props.size : "")}>
                {this.props.label && <label className="Input__label" htmlFor={this.state.id}>{this.props.label}</label>}
                <div className="Input__wrapper">
                    <input 
                        className="Input__input"
                        ref={ ref => this.inputRef = ref}
                        type={this.props.type} 
                        disabled={this.props.disabled}
                        id={this.state.id} 
                        name={this.props.name} 
                        defaultValue={this.props.defaultValue}
                        value={this.props.value}
                        pattern={this.props.pattern}
                        onChange={e => this.props.onChange && this.props.onChange(e.target.value)}
                        onFocus={this.onInputFocus.bind(this)}
                        />
                    {this.props.units && <div className="Input__units" onClick={this.onUnitClick.bind(this)}>{this.props.units}</div>}
                </div>
            </div>
        )
    }
}

