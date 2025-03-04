const EOSKeyring = require('../index');
const ecc = require('eosjs-ecc');

describe('EOSKeyring', () => {
  let keyring;

  beforeEach(() => {
    keyring = new EOSKeyring();
  });

  describe('构造函数', () => {
    it('正确构造实例', () => {
      expect(keyring instanceof EOSKeyring).toBe(true);
      expect(keyring.wallets).toEqual([]);
    });

    it('可以从私钥数组初始化', async () => {
      const privateKey = await ecc.randomKey();
      keyring = new EOSKeyring([privateKey]);
      const accounts = await keyring.getAccounts();
      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toBe(ecc.privateToPublic(privateKey));
    });
  });

  describe('账户管理', () => {
    describe('addAccounts', () => {
      it('可以创建一个新账户', async () => {
        const accounts = await keyring.addAccounts(1);
        expect(accounts).toHaveLength(1);
        expect(accounts[0].startsWith('EOS')).toBe(true);
      });

      it('可以创建多个账户', async () => {
        const accounts = await keyring.addAccounts(5);
        expect(accounts).toHaveLength(5);
        accounts.forEach(account => {
          expect(account.startsWith('EOS')).toBe(true);
        });
      });
    });

    describe('getAccounts', () => {
      it('返回所有账户公钥', async () => {
        await keyring.addAccounts(3);
        const accounts = await keyring.getAccounts();
        expect(accounts).toHaveLength(3);
        accounts.forEach(account => {
          expect(account.startsWith('EOS')).toBe(true);
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
        await expect(keyring.removeAccount('EOS000000000000000000000000000000000'))
          .rejects.toThrow('No accounts found.');
      });
    });
  });

  describe('序列化', () => {
    it('可以序列化和反序列化', async () => {
      await keyring.addAccounts(2);
      const serialized = await keyring.serialize();
      const newKeyring = new EOSKeyring();
      await newKeyring.deserialize(serialized);
      const accounts = await newKeyring.getAccounts();
      expect(accounts).toHaveLength(2);
    });
  });

  describe('签名功能', () => {
    let publicKey;

    beforeEach(async () => {
      const accounts = await keyring.addAccounts(1);
      publicKey = accounts[0];
    });

    describe('signTransaction', () => {
      it('可以签名交易', async () => {
        const transaction = 'test transaction';
        const signature = await keyring.signTransaction(publicKey, transaction);
        expect(typeof signature).toBe('string');
        expect(signature.startsWith('SIG_K1_')).toBe(true);
      });
    });

    describe('signMessage', () => {
      it('可以签名消息', async () => {
        const message = 'test message';
        const signature = await keyring.signMessage(publicKey, message);
        expect(typeof signature).toBe('string');
        expect(signature.startsWith('SIG_K1_')).toBe(true);
      });
    });
  });

  describe('exportAccount', () => {
    it('可以导出账户私钥', async () => {
      const accounts = await keyring.addAccounts(1);
      const privateKey = await keyring.exportAccount(accounts[0]);
      expect(typeof privateKey).toBe('string');
      expect(ecc.isValidPrivate(privateKey)).toBe(true);
    });

    it('导出不存在的账户时抛出错误', async () => {
      await expect(keyring.exportAccount('EOS000000000000000000000000000000000'))
        .rejects.toThrow('EOS Keyring - Unable to find matching public key.');
    });
  });
});