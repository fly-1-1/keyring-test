import EosHdKeyring from '../index.js';
import ecc from 'eosjs-ecc';

describe('EosHdKeyring', () => {
  let keyring;

  beforeEach(() => {
    keyring = new EosHdKeyring();
  });

  it('应该正确生成助记词', async () => {
    await keyring.addAccounts(1);
    expect(keyring.mnemonic).toMatch(/\w+/);
  });

  it('应该通过助记词恢复钱包', async () => {
    const accounts = await keyring.addAccounts(2);
    const serialized = await keyring.serialize();
    
    const newKeyring = new EosHdKeyring();
    await newKeyring.deserialize(serialized);

    
    expect(await newKeyring.getAccounts()).toEqual(accounts);
  });

  it('应该正确签名交易', async () => {
    const [publicKey] = await keyring.addAccounts(1);
    const transaction = JSON.stringify({ actions: [] });
    const signature = await keyring.signTransaction(publicKey, transaction);
    
    const recoveredPub = ecc.recover(signature, transaction);
    expect(recoveredPub).toBe(publicKey);
  });

  it('应该正确导出私钥', async () => {
    const [publicKey] = await keyring.addAccounts(1);
    const privateKey = await keyring.exportAccount(publicKey);
    
    expect(ecc.privateToPublic(privateKey)).toBe(publicKey);
  });
});