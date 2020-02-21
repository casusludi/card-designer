import _ from 'lodash';
import Handlebars from 'handlebars';
import { ProjectSelection, Project } from '.';

type MetaVariables = {
    [key:string]:  (value:string,card:any,cards:Array<any>) => void
}

function applyMetaVariableEffects(metaVariables:MetaVariables,cards:Array<any>, metaIndic = '_'){
    return _.reduce(cards, 
            (result,card) => {
                result.push(card);
                _.chain(card)
                    .pickBy((value,key) => key.startsWith(metaIndic))
                    .mapKeys( (value,key) => key.slice(1))
                    .each( (value,key) => {
                        const action = metaVariables[key];
                        if(action)action(value,card,result);
                    })
                    .value()
                    

                return result;
            },
            Array<any>()
    );
}

const metaVariables:MetaVariables = {
    "COUNT": (value,card,cards) => {
        let val = parseInt(value);
        if(val < 0)val=0;
        const start = cards.length;
        const newLength = cards.length+val-1;
        if(newLength >= 0){
            cards.length = cards.length+val-1;
            _.fill(cards,card,start);
        }
    },
    "SKIP": (value, card, cards) => {
        let val = parseInt(value);
        if(  val >= 1 || value == "TRUE"){
            _.remove(cards,card)
        }
    }
}

Handlebars.registerHelper('modulo', function(options) {
    const index = options.data.index + 1,
        gap = options.hash.gap;

    if (index % gap === 0)
    // @ts-ignore // todo find why the use of this here
        return options.fn(this);
    else
    // @ts-ignore
        return options.inverse(this);
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            // @ts-ignore
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            // @ts-ignore
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            // @ts-ignore
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            // @ts-ignore
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            // @ts-ignore
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            // @ts-ignore
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            // @ts-ignore
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            // @ts-ignore
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            // @ts-ignore
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            // @ts-ignore
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            // @ts-ignore
            return options.inverse(this);
    }
});

export function renderHBSToHtml(project:Project,selection:ProjectSelection):string|null{
    if(!project) return null;
    if(!selection.data) return null;
    if(!selection.layout) return null;
    if(!selection.template) return null;

    const template = project.files[selection.template.hbs].content;
    const layout = project.files[selection.layout.hbs].content;

    if(!template) return null;
    if(!layout) return null;

    Handlebars.registerPartial('card',template)
    const tpl = Handlebars.compile(layout);
    const cards = applyMetaVariableEffects(metaVariables,selection.data.cards);
    const globalVars = {
        layoutCSSPath: selection.layout.styles,
        templateCSSPath: selection.template.styles
    }
    const variables = {cards,...globalVars};
    return tpl(variables);
}

/*
const ejs = require('ejs');

export function renderEJSToHtml(project:Project,selection:ProjectSelection):string|null{
    if(!project) return null;
    if(!selection.data) return null;
    if(!selection.layout) return null;
    if(!selection.template) return null;

    const template = project.files[selection.template.hbs].content;
    const layout = project.files[selection.layout.hbs].content;

    if(!template) return null;
    if(!layout) return null;

  
    const cards = applyMetaVariableEffects(metaVariables,selection.data.cards);
    const globalVars = {
        title: selection.template.id,
        layoutCSSPath: selection.layout.styles,
        templateCSSPath: selection.template.styles
    }
    const variables = {cards,...globalVars};
    const tpl = ejs.compile(layout,{client:true});
    return tpl(variables,null,(path:string,d:any) => {
        switch(path){
            case 'card': return ejs.render(template,d)
        }
        return "";
    });
}
 */

