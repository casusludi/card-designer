import React from "react";
import './Checkbox.scss'

export type CheckboxProps = {
    id: string
    label: string
    defaultChecked: boolean
    buttonStyle?:boolean
    onChange: (value: boolean) => void
}

export default function Checkbox(props: CheckboxProps) {

    return (
        <div className={"Checkbox"+(props.buttonStyle?" Checkbox__buttonStyle":"")}>
            <input className="Checkbox__input" type="checkbox" id={props.id} name={props.id} defaultChecked={props.defaultChecked} onChange={e => props.onChange(e.target.checked)} />
            <label className="Checkbox__label" htmlFor={props.id}>
                {props.label}
        </label>
        </div>
    )
}