'use strict';

import SWTCKeyring from './lib/index.js';

async function main() {
  try {
    // 创建一个新的keyring实例
    const keyring = new SWTCKeyring();
    console.log('已创建SWTC Keyring实例');
    
    // 创建一个新账户
    const address1 = await keyring.addAccount();
    console.log('创建的新地址:', address1);
    
    // 查询所有账户
    const accounts = await keyring.getAccounts();
    console.log('当前所有账户:', accounts);
    
    // 导出私钥
    const privateKey = await keyring.exportAccount(address1);
    console.log('账户私钥:', privateKey);
    
    // 使用私钥导入账户
    const address2 = await keyring.addAccount({ privateKey });
    console.log('导入的地址:', address2);
    
    // 签名消息
    const message = 'Hello SWTC!';
    const signature = await keyring.signMessage(address1, message);
    console.log('消息签名结果:', signature);
    
    // 测试交易签名
    const tx = {
      Account: address1,
      Amount: "1000000", // 1 SWTC = 1000000 drops
      Destination: "jGXjV6DFVaRsGBA7YSaQfiPNGrwBmQkVkR",
      Fee: "10",
      Flags: 0,
      Sequence: 1,
      TransactionType: "Payment"
    };
    
    const signedTx = await keyring.signTransaction(address1, tx);
    console.log('交易签名结果:', signedTx);
    
    // 序列化keyring
    const serialized = keyring.serialize();
    console.log('序列化结果:', JSON.stringify(serialized, null, 2));
    
    // 移除一个账户
    await keyring.removeAccount(address1);
    const remainingAccounts = await keyring.getAccounts();
    console.log('移除账户后剩余账户:', remainingAccounts);
    
  } catch (error) {
    console.error('错误:', error);
  }
}

main(); 
