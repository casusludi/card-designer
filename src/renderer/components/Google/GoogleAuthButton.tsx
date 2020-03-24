import React from 'react';
import './GoogleAuthButton.scss';
import Button from '../Misc/Button';

export type GoogleAuthButtonProps = {
    connected:Boolean
    label:string
    onClick:(event:React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export function GoogleAuthButton(props:GoogleAuthButtonProps){

    return (
        <Button className="GoogleAuthButton" onClick={props.onClick} >
            {props.connected?
            <React.Fragment><i className="fab fa-google"></i>{props.label && <span>{props.label}</span>}<i className="fas fa-sign-out-alt"></i></React.Fragment>
            :
            <i className="fab fa-google"></i>
        }
        </Button>

    )
}
