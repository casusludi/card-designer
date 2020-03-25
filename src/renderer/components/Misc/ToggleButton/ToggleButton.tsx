import React from "react";
import Button from "../Button";
import { createClassName } from "../../../utils";
import './ToggleButton.scss';

export type ToggleButtonProps = {
    label?: any;
    className?: string | undefined;
    disabled?: boolean | undefined;
    fontIcon?: string | undefined;
    borderless?: boolean | undefined;
    value:boolean
    toggleFontIcon?:string
    toggleLabel?:string
    onChange?:(value:boolean) => void
}

export type ToggleButtonState = {
    value:boolean
}

export default class ToggleButton extends React.Component<ToggleButtonProps,ToggleButtonState> {
    
    state:ToggleButtonState = {
        value:this.props.value
    }

    onClick(){
        const value = !this.state.value;
        this.setState({
            value
        })
        if(this.props.onChange){
            this.props.onChange(value)
        }
    }

    render(){
        
        return (
            
            <Button 
                disabled={this.props.disabled}
                label={this.props.toggleLabel && this.state.value?this.props.toggleLabel:this.props.label} 
                fontIcon={this.props.toggleFontIcon && this.state.value?this.props.toggleFontIcon:this.props.fontIcon} 
                borderless={this.props.borderless} 
                className={createClassName("ToggleButton",{"ToggleButton_Toggled":this.state.value}, [this.props.className])}   
                onClick={this.onClick.bind(this)}
            />
        )
    }
}