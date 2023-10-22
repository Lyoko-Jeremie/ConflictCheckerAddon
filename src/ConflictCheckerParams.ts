import {get, set, has, isString, isArray, every, isNil, cloneDeep} from 'lodash';

export interface ModLimit {
    modName: string;
    version: string;
}

export interface ConflictCheckerParams {
    mustBefore?: ModLimit[];
    mustAfter?: ModLimit[];
    optionalBefore?: ModLimit[];
    optionalAfter?: ModLimit[];
}

export function checkModLimit(ml: any): ml is ModLimit {
    return ml && isString(ml.modName) && isString(ml.version);
}

export function checkParams(a: any): a is ConflictCheckerParams {
    const c = (k: keyof ConflictCheckerParams) => {
        if (!a[k]) {
            return true;
        }
        return a && a[k] && isArray(a[k]) && a[k].every(checkModLimit);
    };
    return a
        && c('mustBefore')
        && c('mustAfter')
        && c('optionalBefore')
        && c('optionalAfter')
        ;
}
