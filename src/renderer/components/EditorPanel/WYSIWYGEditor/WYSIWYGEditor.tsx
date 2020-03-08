import React from "react";
import './WYSIWYGEditor.scss';
import TabNav, { TabNavItem } from "../../Misc/TabNav/TabNav";
import Input from "../../Misc/Input";
import Checkbox from "../../Misc/Checkbox/Checkbox";
import ActivableInput from "../../Misc/ActivableInput";


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

export enum TextAlign {
    Center = "center",
    Left = "left",
    Right = "right",
}

export type CardTypeBoxText = {
    color: string
    weight: FontWeight | number
    style: FontStyle
    align: TextAlign
    size: number
}

type Dimension = number | "auto" ;

export type CardTypeBox = {
    ref: string // variable name
    type: CardTypeBoxType
    top: Dimension
    left: Dimension
    bottom: Dimension
    right: Dimension
    width: Dimension
    height: Dimension
    data: CardTypeBoxText
}

export type CardTypeData = {
    width: number
    height: number
    haveVerso: boolean
    rectoBoxes: Array<CardTypeBox>
    versoBoxes: Array<CardTypeBox>
}

export type WYSIWYGEditorProps = {

}

export type WYSIWYGEditorState = {
    cardTypeData: CardTypeData
    boxIndexSelected: number
    currentTab: number
}

type CardTypeBoxViewProps = {
    data: CardTypeBox
    selected: boolean
    onSelect: (box: CardTypeBox) => void
    onChange: (box: CardTypeBox) => void
}

function cssAbsPos(value: number | undefined | null | string): string {
    if (!value || value === "auto") return "auto";
    return `${value}mm`;
}



class CardTypeBoxView extends React.Component<CardTypeBoxViewProps> {

    createBoxViewCSS() {
        const styles = {
            top: cssAbsPos(this.props.data.top),
            bottom: cssAbsPos(this.props.data.bottom),
            left: cssAbsPos(this.props.data.left),
            right: cssAbsPos(this.props.data.right),
            width: cssAbsPos(this.props.data.width),
            height: cssAbsPos(this.props.data.height),

        }

        switch (this.props.data.type) {
            case CardTypeBoxType.Text: return {
                ...styles,
                color: this.props.data.data.color,
                fontSize: `${this.props.data.data.size}pt`,
                fontStyle: this.props.data.data.style,
                fontWeight: this.props.data.data.weight,
                textAlign: this.props.data.data.align,
            }
        }

        return styles;
    }

    render() {
        return (
            <div className={"CardTypeBoxView" + (this.props.selected ? ' CardTypeBoxView_selected' : '')} style={this.createBoxViewCSS()} onClick={() => this.props.onSelect(this.props.data)}>
                {this.props.data.ref}
                {this.props.data.top != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_top" 
                    style={{
                        top:`-${this.props.data.top}mm`,
                        height:`${this.props.data.top}mm`
                    }}
                ></div>}
                {this.props.data.left != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_left"
                    style={{
                        left:`-${this.props.data.left}mm`,
                        width:`${this.props.data.left}mm`
                    }}
                ></div>}
                {this.props.data.bottom != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_bottom"
                    style={{
                        bottom:`-${this.props.data.bottom}mm`,
                        height:`${this.props.data.bottom}mm`
                    }}
                
                ></div>}
                {this.props.data.right != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_right"
                    style={{
                        right:`-${this.props.data.right}mm`,
                        width:`${this.props.data.right}mm`
                    }}
                ></div>}
            </div>
        )
    }

}

export default class WYSIWYGEditor extends React.Component<WYSIWYGEditorProps, WYSIWYGEditorState>{

    state = {
        boxIndexSelected: -1,
        currentTab: 0,
        cardTypeData: {
            width: 63,
            height: 87.5,
            haveVerso: true,
            rectoBoxes: [
                {
                    ref: "pouet",
                    type: CardTypeBoxType.Text,
                    top: 5,
                    left: 5,
                    width: 20,
                    height: 10,
                    right:"auto" as Dimension,
                    bottom:"auto" as Dimension,
                    data: {
                        color: "red",
                        size: 12,
                        weight: FontWeight.Bold,
                        style: FontStyle.Normal,
                        align: TextAlign.Center
                    }
                }
            ],
            versoBoxes: []
        }
    }

    onBoxChange(index: number, box: CardTypeBox) {

    }

    onBoxSelect(index: number, box: CardTypeBox) {
        this.setState({
            currentTab: 1,
            boxIndexSelected: index
        })
    }

    onTabChange(index: number) {
        this.setState({
            currentTab: index
        })
    }

    render() {
        return (
            <div className="WYSIWYGEditor full-space">
                <div className="WYSIWYGEditor__Canvas">
                    <div className="WYSIWYGEditor__CardBox">
                        <div className="WYSIWYGEditor__Card WYSIWYGEditor__CardRecto" style={{
                            width: `${this.state.cardTypeData.width}mm`,
                            height: `${this.state.cardTypeData.height}mm`
                        }}>
                            {this.state.cardTypeData.rectoBoxes.map((box, i) => <CardTypeBoxView data={box} key={i} selected={i == this.state.boxIndexSelected} onChange={(newBox) => this.onBoxChange(i, newBox)} onSelect={(selectedBox) => this.onBoxSelect(i, selectedBox)} />)}
                        </div>
                        <div className="WYSIWYGEditor__CardBoxLabel">Recto</div>
                    </div>
                    {this.state.cardTypeData.haveVerso &&
                        <div className="WYSIWYGEditor__CardBox">
                            <div className="WYSIWYGEditor__Card WYSIWYGEditor__CardVerso" style={{
                                width: `${this.state.cardTypeData.width}mm`,
                                height: `${this.state.cardTypeData.height}mm`
                            }}>
                                {this.state.cardTypeData.versoBoxes.map((box, i) => <CardTypeBoxView data={box} key={i} selected={i == this.state.boxIndexSelected} onChange={(newBox) => this.onBoxChange(i, newBox)} onSelect={(selectedBox) => this.onBoxSelect(i, selectedBox)} />)}
                            </div>
                            <div className="WYSIWYGEditor__CardBoxLabel">Verso</div>
                        </div>
                    }
                </div>
                <div>
                    <TabNav className="WYSIWYGEditor__Tabs" currentTab={this.state.currentTab} onTabChange={this.onTabChange.bind(this)} >
                        <TabNavItem label="Card Settings">
                            <div className="ContentWithLine">
                                <div className="ContentWithLine__Line">
                                    <Input label="width : " labelOnTop={true} type="number" defaultValue={this.state.cardTypeData.width} units="mm" />
                                    <Input label="height : " labelOnTop={true} type="number" defaultValue={this.state.cardTypeData.height} units="mm" />
                                    <Checkbox label="With Verso" defaultChecked={this.state.cardTypeData.haveVerso} />
                                </div>
                            </div>
                        </TabNavItem>
                        <TabNavItem label="Boxes">
                            <div className="ContentWithColumn">
                                <div className="ContentWithColumn__Col">
                                    <ActivableInput type="number" label="top : " units="mm" labelOnTop={true} />
                                    <ActivableInput type="number" label="left : " units="mm" labelOnTop={true} />
                                    <ActivableInput type="number" label="bottom : " units="mm" labelOnTop={true} activated={false} />
                                    <ActivableInput type="number" label="right : " units="mm" labelOnTop={true} activated={false} />
                                </div>
                                <div className="ContentWithColumn__Col">
                                    <ActivableInput type="number" label="width : " units="mm" labelOnTop={true} />
                                    <ActivableInput type="number" label="height : " units="mm" labelOnTop={true} />
                                </div>

                            </div>
                        </TabNavItem>

                    </TabNav>
                </div>
            </div>
        )
    }

}