/**
 * It creates string for SET section
 * @example
 *
 *  generateUpdateAssignements('rel', 'params', {firstName: 'Jonh', lastName: 'Doe}
 *  // rel.firstName = {params}.firstName , rel.lastName = {params}.lastName
 *
 * @param targetName
 * @param paramsName
 * @param props
 * @returns {string}
 */
export const generateUpdateAssignments = (targetName:string, paramsName:string, props):string => {
    return Object.keys(props).map((key:string) => `${targetName}.${key} = {${paramsName}}.${key}`).join(', ');
};

export const generateMatchAssignments = (paramsName:string, props):string => {
    return Object.keys(props).map((key:string) => `${key}: {${paramsName}}.${key}`).join(', ');
};