import _ from 'lodash';
import nunjucks from 'nunjucks';
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

    env.addFilter('template', function(card,isRecto:boolean|string=true) {
        const aCard = {...card, isRecto: typeof(isRecto) === 'boolean'?isRecto:isRecto == "recto"}
        return env.renderString(template,{card:aCard});
    });

    let cards = applyMetaVariableEffects(metaVariables,selection.data.cards);

    if(selection.pages.length > 0){
        const cardsPerPages = selection.layout.cardsPerPage;

        cards = _.reduce(selection.pages,(selectedCards:any[],o)=> {

            const i = o-1;
            const start = i*cardsPerPages;
            const end = start+cardsPerPages;
            const extractedCards = cards.slice(start,end);
            return selectedCards.concat(extractedCards);
        },[])

    }

    const globalVars = {
        layoutCSSPath: selection.layout.styles,
        templateCSSPath: selection.cardType.styles
    }
    const variables = {cards,...globalVars};

    return env.renderString(layout,variables);
}
