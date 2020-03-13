import React from "react"
import { CardTypeBox, Dimension, FontStyle, FontWeight, CardTypeBoxType, TextAlign } from "../../../../services/Project"
import ActivableInput from "../../../Misc/ActivableInput"
import "./CardTypeBoxEditor.scss";
import Input from "../../../Misc/Input";
import Checkbox from "../../../Misc/Checkbox";
import _ from "lodash";
import Select from "../../../Misc/Select";
import { InputSize } from "../../../Misc/Input/Input";

type CSSDimensionViewProps = {
    name: string
    value: Dimension
    onChange: (name: string, value: Dimension) => void
}

function CSSDimensionView(props: CSSDimensionViewProps) {
    return (
        <ActivableInput type="text" pattern="/[.0-9]*|auto/" defaultActivatedValue={0} desactivatedValue="auto" label={props.name + " : "} units={props.value != "auto" ? "mm" : ""} labelOnTop={true} defaultValue={props.value} activated={props.value != "auto"} onChange={(value) => props.onChange(props.name, value as Dimension)} />
    )
}

export type CardTypeBoxEditorProps = {
    box: CardTypeBox
    className?: string
    onDimensionChange: (name: string, value: Dimension) => void
}

export default function CardTypeBoxEditor(props: CardTypeBoxEditorProps) {

    const { box } = props;
    return (
        <div className={"CardTypeBoxEditor" + (props.className ? " " + props.className : "")}>
            {box ?
                <div className="ContentWithColumn">
                    <div className="ContentWithColumn">
                        <div className="ContentWithColumn__Col">
                            <CSSDimensionView name="top" value={box.top} onChange={props.onDimensionChange} />
                            <CSSDimensionView name="left" value={box.left} onChange={props.onDimensionChange} />
                            <CSSDimensionView name="width" value={box.width} onChange={props.onDimensionChange} />
                        </div>
                        <div className="ContentWithColumn__Col">
                            <CSSDimensionView name="bottom" value={box.bottom} onChange={props.onDimensionChange} />
                            <CSSDimensionView name="right" value={box.right} onChange={props.onDimensionChange} />
                            <CSSDimensionView name="height" value={box.height} onChange={props.onDimensionChange} />
                        </div>
                    </div>
                    <div className="ContentWithLine">
                        <div className="ContentWithLine__Line">
                            <Input label="Ref" labelOnTop={true} type="text" defaultValue={box.ref} />
                            <Select size={InputSize.Small} label="Type" labelOnTop={true} value={box.type} options={_.map(CardTypeBoxType, (o, k) => ({ label: o, value: o }))} />
                            <Checkbox label="On Verso" defaultChecked={box.face == "verso"} />
                        </div>
                        {box.type == CardTypeBoxType.Text && <React.Fragment>
                            <div className="ContentWithLine__Line">
                                <Input size={InputSize.Small} label="Color" labelOnTop={true} type="color" defaultValue={box.data.color} />
                                <Select size={InputSize.Small} label="Style" labelOnTop={true} value={box.data.style} options={_.map(FontStyle, (o, k) => ({ label: o, value: o }))} />
                                <Select size={InputSize.Small} label="Weight" labelOnTop={true} value={box.data.weight} options={_.map(FontWeight, (o, k) => ({ label: o, value: o }))} />
                                <Select size={InputSize.Small} label="Align" labelOnTop={true} value={box.data.align} options={_.map(TextAlign, (o, k) => ({ label: o, value: o }))} />
                            </div>
                            <div className="ContentWithLine__Line">
                                                      </div>
                        </React.Fragment>}

                    </div>
                </div>
                : <div className="CardTypeBoxEditor__NoBox">No Box Selected</div>}
        </div>
    )
}