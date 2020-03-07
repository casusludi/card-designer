import React from "react";
import './WYSIWYGEditor.scss';


export enum CardTypeBoxType {
    Text = "text",
    Image = "image"
}

export enum FontWeight {
    Normal = "normal",
    Bold = "bold",
    Bolder = "bolder",
    Lighter = "lighter",
}

export enum FontStyle {
    Normal = "normal",
    Italic = "italic",
    Oblique = "oblique",
}

export type CardTypeBoxText = {
    color:string
    weight:FontWeight|number
    style:FontStyle
    size:number
}


export type CardTypeBox = {
    ref:string // variable name
    type:CardTypeBoxType
    top?:number|null
    left?:number|null
    bottom?:number|null
    right?:number|null
    width?:number|null
    height?:number|null
    data:CardTypeBoxText
}

export type CardTypeData = {
    width:number
    height:number
    boxes:Array<CardTypeBox>
}

export type WYSIWYGEditorProps = {

}

export type WYSIWYGEditorState = {
    cardTypeData:CardTypeData
}

type CardTypeBoxViewProps = {
    data:CardTypeBox
    onChange:(box:CardTypeBox) => void
}

class CardTypeBoxView extends React.Component<CardTypeBoxViewProps> {

    render(){
        return (
            <div className="CardTypeBoxView" style={{
                color: this.props.data.data.color,
                fontSize: `${this.props.data.data.size}pt`,
                fontStyle: this.props.data.data.style,
                fontWeight: this.props.data.data.weight,
            }}>
                {this.props.data.ref}
            </div>
        )
    }
    
}

export default class WYSIWYGEditor extends React.Component<WYSIWYGEditorProps,WYSIWYGEditorState>{

    state = {
        cardTypeData: {
            width: 63,
            height: 87.5,
            boxes:[
                {
                    ref:"pouet",
                    type: CardTypeBoxType.Text,
                    top:5,
                    left:5,
                    width: 20,
                    height: 10,
                    data: {
                        color:"red",
                        size: 12,
                        weight: FontWeight.Bold,
                        style: FontStyle.Normal
                    }
                }
            ]
        }
    }

    onBoxChange(index:number,box:CardTypeBox){

    }

    render(){
        return (
            <div className="WYSIWYGEditor">
                <div className="WYSIWYGEditor__Canvas">
                    <div className="WYSIWYGEditor__Card" style={{
                        width: `${this.state.cardTypeData.width}mm`,
                        height: `${this.state.cardTypeData.height}mm`
                    }}>
                        {this.state.cardTypeData.boxes.map( (box,i) => <CardTypeBoxView data={box} key={i} onChange={(newBox) => this.onBoxChange(i,newBox)} />)}
                    </div>
                </div>
                <div>
                    <input className="input-field" type="number" defaultValue={this.state.cardTypeData.width}  />
                    <input className="input-field" type="number" defaultValue={this.state.cardTypeData.height} />
                </div>
            </div>
        )
    }
 
}