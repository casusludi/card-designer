import React from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { UserStatus, User } from '../../services/Auth';
import { FetchDataStatus } from '../../services/Project/Sources';

export type GoogleBarProps = {
    className?: string
    user: User|null|undefined
    fetchDataStatus:FetchDataStatus
    signInAction: () => void
    signOutAction: () => void
    fetchAction: () => void
}

export function GoogleBar(props: GoogleBarProps) {
    return (
        <nav className={"button-bar" + (props.className ? " " + props.className : "")}>
            <button disabled={!!props.user && props.user.status != UserStatus.CONNECTED || props.fetchDataStatus == FetchDataStatus.LOADING} className="button" onClick={() => props.fetchAction()}>
                {props.fetchDataStatus == FetchDataStatus.LOADING? <i className="icon fas fa-spin fa-spinner"></i>: <i className="icon fas fa-download"></i>}
                <span>Google Sheets</span>
            </button>
            {<GoogleAuthButton connected={!!props.user && props.user.status == UserStatus.CONNECTED} label={props.user?props.user.name:""} onClick={() => {
                if(props.user){
                    switch (props.user.status) {
                        case UserStatus.DISCONNECTED: props.signInAction(); break;
                        case UserStatus.CONNECTED: props.signOutAction(); break;
                    }
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