const TronKeyring = require('../index');
const TronWeb = require('tronweb');

describe('TronKeyring', () => {
  let keyring;

  beforeEach(() => {
    keyring = new TronKeyring();
  });

  describe('构造函数', () => {
    it('正确构造实例', () => {
      expect(keyring instanceof TronKeyring).toBe(true);
      expect(keyring.wallets).toEqual([]);
    });

    it('可以从私钥数组初始化', async () => {
      const privateKey = 'a0d6ee43a991d2c62f5c6b7f549a1c50dd9c60c456f5b769b6b6bc907d9591b1';
      keyring = new TronKeyring([privateKey]);
      const accounts = await keyring.getAccounts();
      expect(accounts).toHaveLength(1);
    });
  });

  describe('账户管理', () => {
    describe('addAccounts', () => {
      it('可以创建一个新账户', async () => {
        const accounts = await keyring.addAccounts(1);
        expect(accounts).toHaveLength(1);
        expect(accounts[0]).toMatch(/^T[1-9A-HJ-NP-Za-km-z]{33}$/);
      });

      it('可以创建多个账户', async () => {
        const accounts = await keyring.addAccounts(5);
        expect(accounts).toHaveLength(5);
        accounts.forEach(account => {
          expect(account).toMatch(/^T[1-9A-HJ-NP-Za-km-z]{33}$/);
        });
      });
    });

    describe('getAccounts', () => {
      it('返回所有账户地址', async () => {
        await keyring.addAccounts(3);
        const accounts = await keyring.getAccounts();
        expect(accounts).toHaveLength(3);
        accounts.forEach(account => {
          expect(account).toMatch(/^T[1-9A-HJ-NP-Za-km-z]{33}$/);
        });
      });
    });

    describe('removeAccount', () => {
      it('可以移除指定账户', async () => {
        await keyring.addAccounts(3);
        const accounts = await keyring.getAccounts();
        await keyring.removeAccount(accounts[1]);
        const remainingAccounts = await keyring.getAccounts();
        expect(remainingAccounts).toHaveLength(2);
        expect(remainingAccounts).not.toContain(accounts[1]);
      });

      it('移除不存在的账户时抛出错误', async () => {
        await expect(keyring.removeAccount('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'))
          .rejects.toThrow('No accounts found.');
      });
    });
  });

  describe('序列化', () => {
    it('可以序列化和反序列化', async () => {
      await keyring.addAccounts(2);
      const serialized = await keyring.serialize();
      const newKeyring = new TronKeyring();
      await newKeyring.deserialize(serialized);
      const accounts = await newKeyring.getAccounts();
      expect(accounts).toHaveLength(2);
    });
  });

  describe('签名功能', () => {
    let address;

    beforeEach(async () => {
      const accounts = await keyring.addAccounts(1);
      address = accounts[0];
    });

    describe('signTransaction', () => {
      it('可以签名交易', async () => {
        const transaction = {
          to: 'TW6Kq5pWYcHrKMMuqYVAjVBsFqNxLNDe1q',
          amount: 1000000,
          data: ''
        };
        const signedTx = await keyring.signTransaction(address, transaction);
        expect(signedTx).toHaveProperty('signature');
        expect(typeof signedTx.signature[0]).toBe('string');
      });
    });

    describe('signMessage', () => {
      it('可以签名消息', async () => {
        const message = 'Hello, TRON!';
        const signature = await keyring.signMessage(address, message);
        expect(typeof signature).toBe('string');
      });
    });
  });

  describe('exportAccount', () => {
    it('可以导出账户私钥', async () => {
      const accounts = await keyring.addAccounts(1);
      const privateKey = await keyring.exportAccount(accounts[0]);
      expect(typeof privateKey).toBe('string');
      expect(privateKey).toMatch(/^[0-9a-fA-F]{64}$/);
    });

    it('导出不存在的账户时抛出错误', async () => {
      await expect(keyring.exportAccount('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'))
        .rejects.toThrow('TRON Keyring - Unable to find matching address.');
    });
  });
});