import {TronWeb} from 'tronweb';



const tronWeb = new TronWeb({fullHost: 'https://api.trongrid.io', privateKey: '21581BD83403451F639D8438D526BBB05884BDD40D49AA217E8CDD371A5589EC'});

const signature = await tronWeb.trx.signMessageV2('message')

console.log(signature)