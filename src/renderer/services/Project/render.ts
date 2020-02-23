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
    if(!selection.cardType) return null;

    const template = project.files[selection.cardType.template].content;
    const layout = project.files[selection.layout.template].content;

    if(!template) return null;
    if(!layout) return null;

    Handlebars.registerPartial('card',template)
    const tpl = Handlebars.compile(layout);
    const cards = applyMetaVariableEffects(metaVariables,selection.data.cards);
    const globalVars = {
        layoutCSSPath: selection.layout.styles,
        templateCSSPath: selection.cardType.styles
    }
    const variables = {cards,...globalVars};
    return tpl(variables);
}

import nunjucks from 'nunjucks';

export async function renderNJKToHtml(project:Project,selection:ProjectSelection):Promise<string|null>{
    if(!project) return null;
    if(!selection.data) return null;
    if(!selection.layout) return null;
    if(!selection.cardType) return null;

    const template = project.files[selection.cardType.template].content;
    const layout = project.files[selection.layout.template].content;

    if(!template) return null;
    if(!layout) return null;

    const env = new nunjucks.Environment();

    env.addFilter('template', function(card) {
        return env.renderString(template,{card:card});
    });

    const cards = applyMetaVariableEffects(metaVariables,selection.data.cards);
    const globalVars = {
        layoutCSSPath: selection.layout.styles,
        templateCSSPath: selection.cardType.styles
    }
    const variables = {cards,...globalVars};

    return env.renderString(layout,variables);
}
