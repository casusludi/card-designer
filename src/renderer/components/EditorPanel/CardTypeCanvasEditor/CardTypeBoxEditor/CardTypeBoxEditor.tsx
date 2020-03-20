import React from "react"
import { CardTypeBox, Dimension, FontStyle, FontWeight, CardTypeBoxType, TextAlign, Overflow } from "../../../../services/Project"
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
    fonts:string[]
    className?: string
    onChange?:(box:CardTypeBox,prevBox:CardTypeBox) => void
}

export default function CardTypeBoxEditor(props: CardTypeBoxEditorProps) {

    const { box } = props;

    function onMainValueChange(name: string, value: any) {
       if( props.onChange){
            const updatedBox = { ...box, [name]: value };
            props.onChange(updatedBox,box);
       }
    }

    function onDataValueChange(name: string, value: any) {
        if( props.onChange){
            const data = {...box.data,[name]: value};
            const updatedBox = { ...box, data };
            props.onChange(updatedBox,box);

        }
     }

     console.log(props.fonts);

    return (
        <div className={"CardTypeBoxEditor" + (props.className ? " " + props.className : "")}>
            {box ?
                <div className="ContentWithColumn">
                    <div className="ContentWithColumn">
                        <div className="ContentWithColumn__Col">
                            <CSSDimensionView name="top" value={box.top} onChange={onMainValueChange} />
                            <CSSDimensionView name="left" value={box.left} onChange={onMainValueChange} />
                            <CSSDimensionView name="width" value={box.width} onChange={onMainValueChange} />
                        </div>
                        <div className="ContentWithColumn__Col">
                            <CSSDimensionView name="bottom" value={box.bottom} onChange={onMainValueChange} />
                            <CSSDimensionView name="right" value={box.right} onChange={onMainValueChange} />
                            <CSSDimensionView name="height" value={box.height} onChange={onMainValueChange} />
                        </div>
                    </div>
                    <div className="ContentWithLine">
                        <div className="ContentWithLine__Line">
                            <Input label="Ref" labelOnTop={true} type="text" defaultValue={box.ref} onChange={ value => onMainValueChange("ref",value)} />
                            <Select size={InputSize.Small} label="Type" labelOnTop={true} value={box.type} options={_.map(CardTypeBoxType, (o, k) => ({ label: o, value: o }))} onChange={ value => onMainValueChange("type",value)} />
                            <Checkbox label="On Verso" defaultChecked={box.face == "verso"} onChange={ value => onMainValueChange("face",value?"verso":"recto")} />
                        </div>
                        {box.type == CardTypeBoxType.Text && <React.Fragment>
                            <div className="ContentWithLine__Line">
                                <Input size={InputSize.Small} label="Color" labelOnTop={true} type="color" defaultValue={box.data.color} onChange={ value => onDataValueChange("color",value)}  />
                                <Input size={InputSize.Small} label="Size"  labelOnTop={true} type="text" pattern="/[.0-9]*/" defaultValue={box.data.size} onChange={ value => onDataValueChange("size",value)}  />
                                <Select size={InputSize.Normal} label="Font" labelOnTop={true} value={box.data.font} options={_.map(props.fonts, (o, k) => ({ label: o, value: o }))} onChange={ value => onDataValueChange("font",value)} />

                            </div>
                            <div className="ContentWithLine__Line">
                                <Select size={InputSize.Small} label="Style" labelOnTop={true} value={box.data.style} options={_.map(FontStyle, (o, k) => ({ label: o, value: o }))} onChange={ value => onDataValueChange("style",value)} />
                                <Select size={InputSize.Small} label="Weight" labelOnTop={true} value={box.data.weight} options={_.map(FontWeight, (o, k) => ({ label: o, value: o }))} onChange={ value => onDataValueChange("weight",value)} />
                                <Select size={InputSize.Small} label="Align" labelOnTop={true} value={box.data.align} options={_.map(TextAlign, (o, k) => ({ label: o, value: o }))} onChange={ value => onDataValueChange("align",value)} />
                                <Select size={InputSize.Small} label="Overflow" labelOnTop={true} value={box.data.overflow} options={_.map(Overflow, (o, k) => ({ label: o, value: o }))} onChange={ value => onDataValueChange("overflow",value)} />
                            </div>
                        </React.Fragment>}

                    </div>
                </div>
                : <div className="CardTypeBoxEditor__NoBox">No Box Selected</div>}
        </div>
    )
}