export type GlobalSettings = {
    customScheme: string ,
    googleapi:{
        clientId:string
        scope:string
    }
}

export type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]?: U;
};
