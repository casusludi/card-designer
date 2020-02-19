


export function asError() {
    return (t: Error,meta?:any) => ({ payload: t,error:true, meta })
}