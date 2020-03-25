import './CardTypeBoxView.scss';
import React from 'react';
import { CardTypeBox, CardTypeBoxType } from '../../../../services/Project';
import { cssDimensionValue, createClassName, cssZIndexValue } from '../../../../utils';
import path from 'path';

type CardTypeBoxViewProps = {
    data: CardTypeBox
    selected: boolean
    cardTypeBaseUri:string | null
    onSelect: (box: CardTypeBox) => void
    onChange: (box: CardTypeBox) => void
}

export default class CardTypeBoxView extends React.Component<CardTypeBoxViewProps> {

    createBoxViewCSS() {
        return {
            top: cssDimensionValue(this.props.data.top),
            bottom: cssDimensionValue(this.props.data.bottom),
            left: cssDimensionValue(this.props.data.left),
            right: cssDimensionValue(this.props.data.right),
            width: cssDimensionValue(this.props.data.width),
            height: cssDimensionValue(this.props.data.height),
            zIndex: cssZIndexValue(this.props.data.zIndex,""),
        }

    }

    createBoxViewRefCSS() {
        const styles = {
        }

        switch (this.props.data.type) {
            case CardTypeBoxType.Text: return {
                ...styles,
                color: this.props.data.data.color,
                fontFamily: this.props.data.data.font?this.props.data.data.font.replace(/\"/g,""):"inherit",
                fontSize: this.props.data.data.size?`${this.props.data.data.size}pt`:'inherit',
                fontStyle: this.props.data.data.style,
                fontWeight: this.props.data.data.weight,
                textAlign: this.props.data.data.align,
            }
        }

        return styles;
    }

    render() {
        const box = this.props.data;
        if(box.type == CardTypeBoxType.Image){
            console.log("cardTypeBaseUri",this.props.cardTypeBaseUri);
            console.log("filePath",this.props.cardTypeBaseUri +'/'+ box.data.path);
        }
        return (
            <div className={createClassName("CardTypeBoxView",{'CardTypeBoxView_selected':this.props.selected})} style={this.createBoxViewCSS()} onClick={() => this.props.onSelect(this.props.data)}>
                <div className="CardTypeBoxView__Ref" style={this.createBoxViewRefCSS()}>
                    {box.type == CardTypeBoxType.Text && `[${box.data.ref || "unknow"}]`}   
                    {box.type == CardTypeBoxType.Image && this.props.cardTypeBaseUri && <img src={this.props.cardTypeBaseUri +'/'+ box.data.path} />} 
                </div>
                {box.top != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_top" 
                    style={{
                        top:`-${box.top}mm`,
                        height:`${box.top}mm`
                    }}
                ><span className="CardTypeBoxView__LineLabel">{box.top}mm</span></div>}
                {box.left != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_left"
                    style={{
                        left:`-${box.left}mm`,
                        width:`${box.left}mm`
                    }}
                ><span className="CardTypeBoxView__LineLabel">{box.left}mm</span></div>}
                {box.bottom != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_bottom"
                    style={{
                        bottom:`-${box.bottom}mm`,
                        height:`${box.bottom}mm`
                    }}
                
                ><span className="CardTypeBoxView__LineLabel">{box.bottom}mm</span></div>}
                {box.right != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_right"
                    style={{
                        right:`-${box.right}mm`,
                        width:`${box.right}mm`
                    }}
                ><span className="CardTypeBoxView__LineLabel">{box.right}mm</span></div>}
            </div>
        )
    }

}
