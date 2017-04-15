import {expect} from 'chai';

export function expectIsNowTimeStamp(timestamp:number){
    let now = new Date().getTime();
    expect(Math.abs(timestamp - now)).to.be.below(1000); //1ms;
}