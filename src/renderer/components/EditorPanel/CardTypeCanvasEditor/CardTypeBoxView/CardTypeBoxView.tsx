import './CardTypeBoxView.scss';
import React from 'react';
import { CardTypeBox, CardTypeBoxType } from '../../../../services/Project';
import { cssDimensionValue } from '../../../../utils';




type CardTypeBoxViewProps = {
    data: CardTypeBox
    selected: boolean
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

        }

    }

    createBoxViewRefCSS() {
        const styles = {
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
                <div className="CardTypeBoxView__Ref" style={this.createBoxViewRefCSS()}>[{this.props.data.ref}]</div>
                {this.props.data.top != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_top" 
                    style={{
                        top:`-${this.props.data.top}mm`,
                        height:`${this.props.data.top}mm`
                    }}
                ><span className="CardTypeBoxView__LineLabel">{this.props.data.top}mm</span></div>}
                {this.props.data.left != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_left"
                    style={{
                        left:`-${this.props.data.left}mm`,
                        width:`${this.props.data.left}mm`
                    }}
                ><span className="CardTypeBoxView__LineLabel">{this.props.data.left}mm</span></div>}
                {this.props.data.bottom != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_bottom"
                    style={{
                        bottom:`-${this.props.data.bottom}mm`,
                        height:`${this.props.data.bottom}mm`
                    }}
                
                ><span className="CardTypeBoxView__LineLabel">{this.props.data.bottom}mm</span></div>}
                {this.props.data.right != "auto" && <div className="CardTypeBoxView__Line CardTypeBoxView__Line_right"
                    style={{
                        right:`-${this.props.data.right}mm`,
                        width:`${this.props.data.right}mm`
                    }}
                ><span className="CardTypeBoxView__LineLabel">{this.props.data.right}mm</span></div>}
            </div>
        )
    }

}
