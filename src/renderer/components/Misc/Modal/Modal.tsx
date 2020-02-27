import React from "react";
import "./Modal.scss"

export type ModalProps = {
    children:any,
    opener:(open:()=>void) => any
}

export type ModalStats = {
    isOpened:boolean
}


export default class Modal extends React.Component<ModalProps,ModalStats>{

    state = {
        isOpened:false
    }

    openModal(){
        this.setState({
            isOpened:true
        })
    }

    render(){

        return (
            <React.Fragment>
                {this.props.opener(this.openModal.bind(this))}
                {this.state.isOpened  && <div className={"Modal"}>
                    <div className="Modal__Background" onClick={()=> this.setState({isOpened:false})}></div>
                    <div className="Modal__Content">
                        {this.props.children}
                    </div>
                </div>}
            </React.Fragment>
        )
    }
}