import React from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { UserStatus, User } from '../../services/Auth';

export type GoogleBarProps = {
    className?: string
    user: User
    signInAction: () => void
    signOutAction: () => void
    fetchAction: () => void
}

export function GoogleBar(props: GoogleBarProps) {
    return (
        <nav className={"button-bar" + (props.className ? " " + props.className : "")}>
            <button disabled={props.user.status != UserStatus.CONNECTED} className="button" onClick={() => props.fetchAction()}><i className="icon fas fa-download"></i><span>Google Sheets</span></button>
            {<GoogleAuthButton connected={props.user.status == UserStatus.CONNECTED} label={props.user.name} onClick={() => {
                switch (props.user.status) {
                    case UserStatus.DISCONNECTED: props.signInAction(); break;
                    case UserStatus.CONNECTED: props.signOutAction(); break;
                }
            }} />}
        </nav>
    )
}

GoogleBar.defaultProps = {
    signInAction: () => {console.log("call GoogleBar::signInAction()")  },
    signOutAction: () => {console.log("call GoogleBar::signOutAction()")  },
    fetchAction: () => { console.log("call GoogleBar::fetchAction()") }
}