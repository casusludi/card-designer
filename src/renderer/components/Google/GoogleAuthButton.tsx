import React from 'react';
import './GoogleAuthButton.scss';

export type GoogleAuthButtonProps = {
    connected:Boolean
    label:string
    onClick:(event:React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export function GoogleAuthButton(props:GoogleAuthButtonProps){

    return (
        <button type="button" className="button GoogleAuthButton" onClick={props.onClick}>
        {props.connected?
            <React.Fragment><i className="fab fa-google"></i>{props.label && <span>{props.label}</span>}<i className="fas fa-sign-out-alt"></i></React.Fragment>
            :
            <i className="fab fa-google"></i>
        }
        </button>
    )
}



/*
   props$: state$.map( (state:State) => 
            ({
                className:"button",
                normalSkin:<span className="auth-box-button"><i className="fab fa-google"></i><span>{state.user && state.user.name}</span><i className="fas fa-sign-out-alt"></i></span>,
                toggledSkin:<i className="fab fa-google"></i>
            })
            ).startWith({
                className:"button",
                normalSkin:<i className="fas fa-sign-out-alt"></i>,
                toggledSkin:<i className="fab fa-google"></i>
            }) 

            */