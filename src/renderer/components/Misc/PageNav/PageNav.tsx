import './PageNav.scss';
import React from 'react';
import Checkbox from '../Checkbox';
import { ProjectPageSelection } from '../../../services/Project';
import _ from 'lodash';
import Button from '../Button';

export type PageNavProps = {
    selection:ProjectPageSelection
    total:number
    onChange:(selection:ProjectPageSelection) => void
}

type PageNavState = {
    stringSelection:string
    selection:ProjectPageSelection
    allPages:boolean
}

function sortNumbers(a:number,b:number):number{
    if(a > b) return 1;
    if(a < b) return -1;
    return 0
}

export default class PageNav extends React.Component<PageNavProps,PageNavState>{

    state = {
        allPages:this.props.selection.length == 0,
        stringSelection:this.convertSelectionToString(this.props.selection),
        selection: this.props.selection
    };

    componentDidUpdate(prevProps:PageNavProps){
        if(prevProps.total != this.props.total){
            this.setSelection(this.state.allPages?[]:this.convertStringToSelection('1'));
        }
    }

    onAllPagesChange(value:boolean){

        this.setState({
            allPages:value
        })

        this.setSelection(value?[]:this.convertStringToSelection('1'))
    }

    onNavChange(next:boolean){
        if(this.state.allPages) return;
        if(this.state.stringSelection.split(/,|-/).length > 1) return;
        const a = this.state.stringSelection;
        const aVal = parseInt(a);
        let newSelection:Array<number>|null = null;
        if(!isNaN(aVal) && aVal > 0){
            if(next){
                newSelection = [Math.min(aVal+1,this.props.total)];
            }else{
                newSelection = [Math.max(aVal-1,1)];
            }
        }
        /*
        if(this.state.stringSelection.split(',').length > 1) return;
        const [a,b] = this.state.stringSelection.split('-');
        const aVal = parseInt(a);
        let newSelection:Array<number>|null = null;
        if(!isNaN(aVal) && aVal > 0){
            if(!b){
                if(next){
                    newSelection = [Math.min(aVal+1,this.props.total)];
                }else{
                    newSelection = [Math.max(aVal-1,1)];
                }
            }else{
                const bVal = parseInt(b);
                if(!isNaN(bVal) && bVal >= aVal){
                    const diff = bVal-aVal;
                    if(next){
                        const evenTotal = this.props.total%(diff+1)==1?this.props.total+diff-1:this.props.total; 
                        const start = Math.min(bVal+1,evenTotal);
                        const end = Math.min(start+diff,evenTotal);
                        console.log(start,end)
                        if(start!=end)newSelection = _.range(start,end+1)
                    }else{
                        const end = Math.max(aVal-1,1);
                        const start = Math.max(end-diff,1);
                        if(start!=end)newSelection = _.range(start,end+1)
                    }
                }
            }
        }*/

        if(newSelection){
            this.setSelection(newSelection)
        }

    }

    setSelection(selection:ProjectPageSelection,stringSelection:string|null=null){
        if(!_.isEqual(selection,this.state.selection)){
            this.props.onChange(selection);
        }
        this.setState({
            selection,
            stringSelection: stringSelection?stringSelection:this.convertSelectionToString(selection)
        })
    }

    canNav(next:boolean):boolean{
        if(this.state.allPages) return false;
        if(this.state.stringSelection.split(/,|-/).length > 1) return false;
        const a = this.state.stringSelection;
        const aVal = parseInt(a);
        if(!isNaN(aVal) && aVal > 0){
            return next?aVal < this.props.total:aVal > 1
        }

        /*const [a,b] = this.state.stringSelection.split('-');
        const aVal = parseInt(a);
        if(!isNaN(aVal) && aVal > 0){
            if(!b){
                return next?aVal < this.props.total:aVal > 1
            }else{
                const bVal = parseInt(b);
                if(!isNaN(bVal) && bVal >= aVal){
                    if(next){
                        const diff = bVal-aVal;
                        const evenTotal = this.props.total%(diff+1)==1?this.props.total+diff-1:this.props.total;
                        return bVal+1 < evenTotal
                    }else{
                        return aVal-1 > 1
                    }
                }
            }
        }*/
        
        return true;
    }

    onInputChange(text:string){
        const selection = this.convertStringToSelection(text);
        this.setSelection(selection,text)
    }

    onInputBlur(){
        this.setState({
            stringSelection: this.convertSelectionToString(this.state.selection)
        })
    }

    convertStringToSelection(text:string):ProjectPageSelection{
        const parts = text.split(',');
        let ret:Array<number> = [];
        for(let i = 0,c=parts.length;i<c;i++){
            const [a,b] = parts[i].split('-');
            const aVal = parseInt(a);
            if(!isNaN(aVal) && aVal > 0){
                if(!b){
                    ret.push(Math.min(aVal,this.props.total))
                }else{
                    const bVal = parseInt(b);
                    if(!isNaN(bVal) && bVal >= aVal){
                        const range = _.range(aVal,Math.min(bVal,this.props.total)+1);
                        ret = ret.concat(range)
                    }
                }
            }
        }
        return _.chain(ret)
            .uniq()
            .sort(sortNumbers)
            .value();
    }

    convertSelectionToString(selection:ProjectPageSelection):string{
        const filteredSelection = _.chain(selection)
            .uniq()
            .sort(sortNumbers)
            .value();
        const count = filteredSelection.length;

        if(count == 1){
            return filteredSelection[0].toString()
        }else if(count > 1){
            
            let ret = '';
            let start = filteredSelection[0];
            let last = start;
            for(let i = 1;i<count;i++){
                const curr = filteredSelection[i];
                if(curr-last > 1){
                    ret += `${ret.length>0?',':''}${start}-${last}`;
                    start = curr;
                }
                last = curr;
            }
            ret += `${ret.length>0?',':''}${start}-${last}`;

            return ret;
        }else{
            if(this.props.total == 1){
                return '1'
            }
            return `1-${this.props.total}`
        }
       
    }

    render(){
        return (
            <div className={"PageNav"+(this.props.total==0?" PageNav_disabled":"")}>
                <label >
                    Page(s) : 
                </label>
                <Button fontIcon="fas fa-chevron-left" className="PageNav__button" borderless={true} disabled={!this.canNav.bind(this)(false)}  onClick={() => this.onNavChange(false)} />

                <input type="text" disabled={this.state.allPages}  className="PageNav__input input-field" value={this.state.stringSelection} onBlur={()=>this.onInputBlur()} onChange={e => this.onInputChange(e.target.value)} />
                <span className={"PageNav__total"+(this.state.allPages?' PageNav__total_disabled':'')}> / {this.props.total}</span>
                <Button fontIcon="fas fa-chevron-right" className="PageNav__button" borderless={true} disabled={!this.canNav.bind(this)(true)}  onClick={() => this.onNavChange(true)} />
                <Checkbox id="PageNav__allPages" label="All pages" defaultChecked={this.state.allPages} onChange={this.onAllPagesChange.bind(this)} />
            </div>
        )
    }
}