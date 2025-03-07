import EosHdKeyring from './index.js';
import assert from 'assert';
import ecc from 'eosjs-ecc';

// 生成确定性助记词
const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow';

async function main() {
  // 初始化HD钱包
  const keyring = new EosHdKeyring({
    mnemonic,
    hdPath: "m/44'/194'/0'/0"
  });

  // 派生3个账户
  await keyring.addAccounts(3);
  const accounts = await keyring.getAccounts();
  console.log('派生账户:', accounts);

  // 交易签名演示
  const transaction = { actions: [{ account: 'eosio', name: 'transfer', data: {} }] };
  const signature = await keyring.signTransaction(accounts[0], transaction);
  console.log('签名验证结果:', ecc.verify(signature, transaction, accounts[0]));

  // 状态恢复测试
  const serialized = await keyring.serialize();
  const restoredKeyring = new EosHdKeyring();
  await restoredKeyring.deserialize(serialized);
  
  // 验证确定性特性
  const restoredAccounts = await restoredKeyring.getAccounts();
  assert.deepStrictEqual(accounts, restoredAccounts, '账户恢复不一致');
  console.log('状态恢复验证通过');
}

main().catch(console.error);