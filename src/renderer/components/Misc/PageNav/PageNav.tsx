import './PageNav.scss';
import React, { useState, useEffect } from 'react';
import Checkbox from '../Checkbox/Checkbox';
import { ProjectPageSelection } from '../../../services/Project';
import _ from 'lodash';

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

export default function PageNav(props:PageNavProps){

    const [state,setState] = useState<PageNavState>({
        allPages:props.selection.length == 0 || props.selection.length == props.total,
        stringSelection:convertSelectionToString(props.selection),
        selection: props.selection
    });


    useEffect(()=> {
        setSelection(props.selection);
    },[props.total])

    function onAllPagesChange(value:boolean){

        if(value){
            setSelection([]);
        }

        setState({
            ...state,
            allPages: value
        })
    }

    function onNavChange(next:boolean){
        if(state.stringSelection.split(',').length > 1) return;
        const [a,b] = state.stringSelection.split('-');
        const aVal = parseInt(a);
        let newSelection:Array<number>|null = null;
        if(!isNaN(aVal) && aVal > 0){
            if(!b){
                if(next){
                    newSelection = [Math.min(aVal+1,props.total)];
                }else{
                    newSelection = [Math.max(aVal-1,1)];
                }
            }else{
                const bVal = parseInt(b);
                if(!isNaN(bVal) && bVal >= aVal){
                    const diff = bVal-aVal;
                    if(next){
                        const evenTotal = props.total%2==1?props.total+1:props.total; 
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
        }

        if(newSelection){
            setSelection(newSelection)
        }

    }

    function setSelection(selection:ProjectPageSelection,stringSelection:string|null=null){
        
        if(!_.isEqual(selection,state.selection)){
            props.onChange(selection);
        }
        setState({
            ...state,
            selection,
            stringSelection: stringSelection?stringSelection:convertSelectionToString(selection)
        })
        
    }

    function canNav(next:boolean):boolean{
        if(state.allPages) return false;
        if(state.stringSelection.split(',').length > 1) return false;
        const [a,b] = state.stringSelection.split('-');
        const aVal = parseInt(a);
        if(!isNaN(aVal) && aVal > 0){
            if(!b){
                return next?aVal < props.total:aVal > 1
            }else{
                const bVal = parseInt(b);
                if(!isNaN(bVal) && bVal >= aVal){
                    if(next){
                        const evenTotal = props.total%2==1?props.total+1:props.total;
                        return bVal+1 < evenTotal
                    }else{
                        return aVal-1 > 1
                    }
                }
            }
        }
        
        return true;
    }

    function onInputChange(text:string){
        const selection = convertStringToSelection(text);
        setSelection(selection,text)
    }

    function onInputBlur(){
        setState({
            ...state,
            stringSelection: convertSelectionToString(state.selection)
        })
    }

    function convertStringToSelection(text:string):ProjectPageSelection{
        const parts = text.split(',');
        let ret:Array<number> = [];
        for(let i = 0,c=parts.length;i<c;i++){
            const [a,b] = parts[i].split('-');
            const aVal = parseInt(a);
            if(!isNaN(aVal) && aVal > 0){
                if(!b){
                    ret.push(Math.min(aVal,props.total))
                }else{
                    const bVal = parseInt(b);
                    if(!isNaN(bVal) && bVal >= aVal){
                        const range = _.range(aVal,Math.min(bVal,props.total)+1);
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

    function convertSelectionToString(selection:ProjectPageSelection):string{
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
            if(props.total == 1){
                return '1'
            }
            return `1-${props.total}`
        }
       
    }

    return (
        <div className="PageNav">
            <label >
                Page(s) : 
            </label>
            <button type="button" disabled={!canNav(false)} className="PageNav__button button button-frameless" onClick={() => onNavChange(false)}  ><i className="fas fa-chevron-left"></i></button>
            <input type="text" disabled={state.allPages}  className="PageNav__input input-field" value={state.stringSelection} onBlur={()=>onInputBlur()} onChange={e => onInputChange(e.target.value)} />
            <span className={"PageNav__total"+(state.allPages?' PageNav__total_disabled':'')}> / {props.total}</span>
            <button type="button" disabled={!canNav(true)}  className="PageNav__button button button-frameless" onClick={() => onNavChange(true)} ><i className="fas fa-chevron-right"></i></button>
            <Checkbox id="PageNav__allPages" label="All pages" defaultChecked={state.allPages} onChange={onAllPagesChange} />
        </div>
    )
}