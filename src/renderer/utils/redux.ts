


export function asError() {
    return (t: Error) => ({ payload: t,error:true })
}