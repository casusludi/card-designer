import {google,sheets_v4} from 'googleapis';
import _ from 'lodash';

const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
function indexToLetters(index:number){
    const c = letters.length
    let cycle = Math.floor(index/c);
    let ret = "";
    while(cycle > 0){
        ret += 'A';
        cycle--;
    } 
    ret += letters[index%c]
    return ret;
}

export async function fetchFromGSheet(id:string,tokens:any){

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    const gsheets = new sheets_v4.Sheets({auth:oauth2Client});
    const {data:infos} = await gsheets.spreadsheets.get({
        spreadsheetId: id
    })
    //console.log("gsheet infos : ",infos);


    const sheetsByRange = _.chain(infos.sheets).map( o => ({
        title: o.properties?.title,
        range:`${o.properties?.title}!A1:${indexToLetters((o.properties?.gridProperties?.columnCount || 1)-1)}${o.properties?.gridProperties?.rowCount}`
    }))
    .keyBy( o => o.range || "")
    .value();

    const ranges = _.map(sheetsByRange, o => o.range);

    //console.log(sheetsByRange)
    //console.log(ranges)

    const {data:rawData} = await gsheets.spreadsheets.values.batchGet({
        spreadsheetId: id, 
        ranges
    });

    if(rawData.valueRanges && rawData.valueRanges.length > 0){

    }

    //console.log(rawData);

    const data = _.chain(rawData.valueRanges).map((o,k) => {
        
        if(o.range && o.values){
            const rawValues:Array<any> = o.values;

            if(rawValues.length > 1){

                const varNames:Array<string> = rawValues[0];
                const values:Array<any> = [];
                for(let i = 1,c = rawValues.length;i < c;i++){
                    const obj:any = {};
                    for(let j = 0,d = rawValues[i].length;j < d;j++){
                        obj[varNames[j]] = rawValues[i][j]
                    }
                    values.push(obj);
                }

                const ret:any = {
                    id: sheetsByRange[o.range].title,
                    cards:values
                };
                return ret;
            }
        }
        return null;
    })
    .filter( o => !!o)
    .value()

    return data;
}

