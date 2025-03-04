const SimpleKeyring = require('./index');
const { FeeMarketEIP1559Transaction: Transaction } = require('@ethereumjs/tx');
const ethUtil = require('ethereumjs-util');

// 创建SimpleKeyring实例
async function main() {
  try {
    // 初始化keyring
    const keyring = new SimpleKeyring();
    console.log('创建SimpleKeyring实例成功');

    // 创建新账户
    const accounts = await keyring.addAccounts(1);
    const address = accounts[0];
    console.log('创建的账户地址:', address);

    // 获取所有账户
    const allAccounts = await keyring.getAccounts();
    console.log('当前所有账户:', allAccounts);

    // 签名交易
    const txParams = {
      nonce: '0x00',
      maxFeePerGas: '0x09184e72a000',
      maxPriorityFeePerGas: '0x09184e72a000',
      gasLimit: '0x2710',
      to: '0x0000000000000000000000000000000000000000',
      value: '0x00',
      data: '0x',
      chainId: '0x01',
      type: '0x02'
    };
    const tx = Transaction.fromTxData(txParams);
    const signedTx = await keyring.signTransaction(address, tx);
    console.log('交易签名成功:', signedTx.isSigned());

    // 签名消息
    const message = '0x48656c6c6f2c20776f726c6421'; // "Hello, world!" in hex
    const signature = await keyring.signMessage(address, message);
    console.log('消息签名:', signature);

    // 加密功能演示
    const pubKey = await keyring.getEncryptionPublicKey(address);
    console.log('加密公钥:', pubKey);

    // 导出账户私钥
    const privateKey = await keyring.exportAccount(address);
    console.log('账户私钥:', privateKey);

    // 序列化和反序列化演示
    const serialized = await keyring.serialize();
    console.log('序列化数据:', serialized);

    // 创建新的keyring实例并使用序列化数据恢复
    const newKeyring = new SimpleKeyring();
    await newKeyring.deserialize(serialized);
    const recoveredAccounts = await newKeyring.getAccounts();
    console.log('恢复的账户:', recoveredAccounts);

  } catch (error) {
    console.error('发生错误:', error);
  }
}

main();