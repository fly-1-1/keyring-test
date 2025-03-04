const TronKeyring = require('./index');
const TronWeb = require('tronweb');

async function main() {
  try {
    // 初始化keyring
    const keyring = new TronKeyring();
    console.log('创建TronKeyring实例成功');

    // 创建新账户
    const accounts = await keyring.addAccounts(1);
    const address = accounts[0];
    console.log('创建的账户地址:', address);

    // 获取所有账户
    const allAccounts = await keyring.getAccounts();
    console.log('当前所有账户:', allAccounts);

    // // 签名交易
    // const transaction = {
    //   to: 'TW6Kq5pWYcHrKMMuqYVAjVBsFqNxLNDe1q',
    //   amount: 1000000, // 1 TRX = 1,000,000 SUN
    //   data: '',
    // };
    // const signedTx = await keyring.signTransaction(address, transaction);
    // console.log('交易签名:', signedTx);

    // 签名消息
    const message = 'Hello, TRON!';
    const messageSignature = await keyring.signMessage(address, message);
    console.log('消息签名:', messageSignature);

    // 导出账户私钥
    const privateKey = await keyring.exportAccount(address);
    console.log('账户私钥:', privateKey);

    // 序列化和反序列化演示
    const serialized = await keyring.serialize();
    console.log('序列化数据:', serialized);

    // 创建新的keyring实例并使用序列化数据恢复
    const newKeyring = new TronKeyring();
    await newKeyring.deserialize(serialized);
    const recoveredAccounts = await newKeyring.getAccounts();
    console.log('恢复的账户:', recoveredAccounts);

  } catch (error) {
    console.error('发生错误:', error);
  }
}

main();