import RippleKeyring from '../index.js';
import xrpl from 'xrpl';

describe('RippleKeyring', () => {
  let keyring;

  beforeEach(() => {
    keyring = new RippleKeyring();
  });

  describe('账户管理', () => {
    it('生成新账户', async () => {
      const accounts = await keyring.addAccounts(1);
      expect(accounts[0]).toMatch(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/);
    });

    it('获取账户列表', async () => {
      await keyring.addAccounts(2);
      const accounts = await keyring.getAccounts();
      expect(accounts.length).toBe(2);
    });
  });

  describe('账户移除', () => {
    it('正常移除账户', async () => {
      const [addr1, addr2] = await keyring.addAccounts(2);
      await keyring.removeAccount(addr1);
      expect(await keyring.getAccounts()).toEqual([addr2]);
    });

    it('移除不存在的账户应报错', async () => {
      await expect(keyring.removeAccount('rInvalidAddress'))
        .rejects.toThrow('账户列表为空');
    });

    it('移除格式错误地址应报错', async () => {
      await expect(keyring.removeAccount('invalid_address'))
        .rejects.toThrow('无效的XRP地址格式');
    });
  });

  describe('交易签名', () => {
    it('正确签名XRP交易', async () => {
      const [address] = await keyring.addAccounts(1);
      const tx = {
        TransactionType: 'Payment',
        Account: address,
        Amount: xrpl.xrpToDrops('1'),
        Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
        Fee: '12',
        Sequence: 1
      };
      
      const signedTx = await keyring.signTransaction(address, tx);
      expect(signedTx.hash).toBeDefined();
      expect(signedTx.tx.signature).toBeDefined();
    });

    it('签名无效地址应报错', async () => {
      await expect(keyring.signTransaction('invalid_addr', {}))
        .rejects.toThrow('无效的XRP地址格式');
    });

    it('签名缺少必要交易字段应报错', async () => {
      const [address] = await keyring.addAccounts(1);
      const invalidTx = {
        Amount: xrpl.xrpToDrops('1'),
        Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe'
      };
      
      await expect(keyring.signTransaction(address, invalidTx))
        .rejects.toThrow('交易缺少必要字段');
    });
  });

  describe('序列化', () => {
    it('正确序列化/反序列化', async () => {
      await keyring.addAccounts(2);
      const serialized = await keyring.serialize();
      
      const newKeyring = new RippleKeyring();
      await newKeyring.deserialize(serialized);
      expect(await newKeyring.getAccounts()).toEqual(await keyring.getAccounts());
    });
  });

  describe('消息签名', () => {
    it('生成有效签名', async () => {
      const [address] = await keyring.addAccounts(1);
      const message = 'Test message';
      const signature = await keyring.signMessage(address, message);
      
      const wallet = keyring._getWalletForAccount(address);
      expect(wallet.verifySignature(message, signature)).toBe(true);
    });
  });
});