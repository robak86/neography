import {expect} from 'chai';

export function expectIsNowDate(date:Date){
    let now = new Date().getTime();
    let timestamp = date.getTime();
    expect(Math.abs(timestamp - now)).to.be.below(1000); //1ms;
}

export function expectIsNowTimeStamp(timestamp:number){
    let now = new Date().getTime();
    expect(Math.abs(timestamp - now)).to.be.below(1000); //1ms;
}