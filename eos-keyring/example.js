const EOSKeyring = require('./index');
const { Api, JsonRpc } = require('eosjs');

async function main() {
  try {
    // 初始化keyring
    const keyring = new EOSKeyring();
    console.log('创建EOSKeyring实例成功');

    // 创建新账户
    const accounts = await keyring.addAccounts(1);
    const publicKey = accounts[0];
    console.log('创建的账户公钥:', publicKey);

    // 获取所有账户
    const allAccounts = await keyring.getAccounts();
    console.log('当前所有账户:', allAccounts);

    // 签名交易
    const transaction = {
      expiration: '2024-01-01T00:00:00',
      ref_block_num: 1234,
      ref_block_prefix: 5678,
      actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: 'myaccount',
          permission: 'active',
        }],
        data: {
          from: 'myaccount',
          to: 'toaccount',
          quantity: '1.0000 EOS',
          memo: 'test transfer'
        }
      }]
    };
    const serializedTx = JSON.stringify(transaction);
    const signature = await keyring.signTransaction(publicKey, serializedTx);
    console.log('交易签名:', signature);

    // 签名消息
    const message = 'Hello, EOS!';
    const messageSignature = await keyring.signMessage(publicKey, message);
    console.log('消息签名:', messageSignature);

    // 导出账户私钥
    const privateKey = await keyring.exportAccount(publicKey);
    console.log('账户私钥:', privateKey);

    // 序列化和反序列化演示
    const serialized = await keyring.serialize();
    console.log('序列化数据:', serialized);

    // 创建新的keyring实例并使用序列化数据恢复
    const newKeyring = new EOSKeyring();
    await newKeyring.deserialize(serialized);
    const recoveredAccounts = await newKeyring.getAccounts();
    console.log('恢复的账户:', recoveredAccounts);

  } catch (error) {
    console.error('发生错误:', error);
  }
}

main();