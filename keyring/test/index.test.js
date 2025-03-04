const SimpleKeyring = require('../index');
const ethUtil = require('ethereumjs-util');
const { FeeMarketEIP1559Transaction: Transaction } = require('@ethereumjs/tx');
const sigUtil = require('eth-sig-util');

describe('SimpleKeyring', () => {
  let keyring;

  beforeEach(() => {
    keyring = new SimpleKeyring();
  });

  describe('构造函数', () => {
    it('正确构造实例', () => {
      expect(keyring instanceof SimpleKeyring).toBe(true);
      expect(keyring.wallets).toEqual([]);
    });

    it('可以从私钥数组初始化', async () => {
      const privateKeys = [
        'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
      ];
      keyring = new SimpleKeyring(privateKeys);
      const accounts = await keyring.getAccounts();
      expect(accounts).toHaveLength(1);
    });
  });

  describe('账户管理', () => {
    describe('addAccounts', () => {
      it('可以创建一个新账户', async () => {
        const accounts = await keyring.addAccounts(1);
        expect(accounts).toHaveLength(1);
        expect(accounts[0].startsWith('0x')).toBe(true);
        expect(accounts[0]).toHaveLength(42);
      });

      it('可以创建多个账户', async () => {
        const accounts = await keyring.addAccounts(5);
        expect(accounts).toHaveLength(5);
      });
    });

    describe('getAccounts', () => {
      it('返回所有账户地址', async () => {
        await keyring.addAccounts(3);
        const accounts = await keyring.getAccounts();
        expect(accounts).toHaveLength(3);
        accounts.forEach(account => {
          expect(account.startsWith('0x')).toBe(true);
          expect(account).toHaveLength(42);
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
        await expect(keyring.removeAccount('0x0000000000000000000000000000000000000000'))
          .rejects.toThrow('No accounts found.');
      });
    });
  });

  describe('序列化', () => {
    it('可以序列化和反序列化', async () => {
      await keyring.addAccounts(2);
      const serialized = await keyring.serialize();
      const newKeyring = new SimpleKeyring();
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
        expect(signedTx.isSigned()).toBe(true);
      });
    });

    describe('signMessage', () => {
      it('可以签名消息', async () => {
        const message = '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0';
        const signature = await keyring.signMessage(address, message);
        expect(signature.startsWith('0x')).toBe(true);
        expect(signature).toHaveLength(132); // 0x + 130 chars
      });
    });

    describe('加密功能', () => {
      it('可以获取加密公钥', async () => {
        const pubKey = await keyring.getEncryptionPublicKey(address);
        expect(typeof pubKey).toBe('string');
      });

      it('可以加密和解密消息', async () => {
        const pubKey = await keyring.getEncryptionPublicKey(address);
        const originalMessage = 'Hello, encryption!';
        
        const encryptedData = ethUtil.bufferToHex(
          Buffer.from(
            JSON.stringify(
              sigUtil.encryptSafely(
                pubKey,
                { data: originalMessage },
                'x25519-xsalsa20-poly1305'
              )
            ),
            'utf8'
          )
        );

        const decryptedMessage = await keyring.decryptMessage(address, encryptedData);
        expect(decryptedMessage).toBe(originalMessage);
      });
    });
  });

  describe('exportAccount', () => {
    it('可以导出账户私钥', async () => {
      const accounts = await keyring.addAccounts(1);
      const privateKey = await keyring.exportAccount(accounts[0]);
      expect(privateKey).toMatch(/^[0-9a-fA-F]{64}$/);
    });

    it('导出不存在的账户时抛出错误', async () => {
      await expect(keyring.exportAccount('0x0000000000000000000000000000000000000000'))
        .rejects.toThrow('Simple Keyring - Unable to find matching address.');
    });
  });
});