import React from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { UserStatus, User } from '../../services/Auth';
import { FetchDataStatus } from '../../services/Project/Sources';
import Button from '../Misc/Button';

export type GoogleBarProps = {
    className?: string
    user: User|null|undefined
    gsheetAvailable: boolean
    fetchDataStatus:FetchDataStatus
    signInAction: () => void
    signOutAction: () => void
    fetchAction: () => void
}

export function GoogleBar(props: GoogleBarProps) {
    return (
        <nav className={"button-bar" + (props.className ? " " + props.className : "")}>
            <Button label="Google Sheets" fontIcon={props.fetchDataStatus == FetchDataStatus.LOADING? "fas fa-spin fa-spinner": "fas fa-download"} disabled={!props.gsheetAvailable || !!props.user && props.user.status != UserStatus.CONNECTED || props.fetchDataStatus == FetchDataStatus.LOADING} className="button" onClick={() => props.fetchAction()}/>
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