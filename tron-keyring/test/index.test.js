import TronKeyring from '../index.js';
import TronWeb from 'tronweb';

describe('TronKeyring', () => {
  let keyring;

  beforeEach(() => {
    keyring = new TronKeyring();
  });

  describe('构造函数', () => {
    it('应该正确初始化空钱包', () => {
      expect(keyring.wallets).toEqual([]);
      expect(keyring.type).toEqual('Tron Key Pair');
    });

    it('应该从私钥数组初始化钱包', async () => {
      // 创建一个带有私钥的keyring
      const account = TronWeb.utils.accounts.generateAccount();
      const privateKey = account.privateKey;
      const keyringWithPrivateKey = new TronKeyring({
        privateKeys: [privateKey],
      });
      
      const accounts = await keyringWithPrivateKey.getAccounts();
      expect(accounts.length).toBe(1);
      expect(accounts[0]).toBe(account.address.base58);
    });
  });

  describe('账户管理', () => {
    it('应该能添加账户', async () => {
      const newAccounts = await keyring.addAccounts(3);
      expect(newAccounts.length).toBe(3);
      expect(keyring.wallets.length).toBe(3);
      
      const allAccounts = await keyring.getAccounts();
      expect(allAccounts.length).toBe(3);
      expect(allAccounts).toEqual(newAccounts);
    });

    it('应该能移除账户', async () => {
      await keyring.addAccounts(3);
      const accounts = await keyring.getAccounts();
      
      await keyring.removeAccount(accounts[1]);
      const remainingAccounts = await keyring.getAccounts();
      
      expect(remainingAccounts.length).toBe(2);
      expect(remainingAccounts).not.toContain(accounts[1]);
    });

    it('移除不存在的账户应该抛出错误', async () => {
      await expect(keyring.removeAccount('TJRabPrwbZy45sbavfcjinPJC18kjpRTv8'))
        .rejects.toThrow('账户列表为空');
      
      await keyring.addAccounts(1);
      await expect(keyring.removeAccount('TJRabPrwbZy45sbavfcjinPJC18kjpRTv8'))
        .resolves.not.toThrow();
    });
  });

  describe('序列化和反序列化', () => {
    it('应该能序列化和反序列化钱包', async () => {
      await keyring.addAccounts(2);
      const originalAccounts = await keyring.getAccounts();
      
      const serialized = await keyring.serialize();
      expect(serialized.length).toBe(2);
      
      const newKeyring = new TronKeyring();
      await newKeyring.deserialize(serialized);
      
      const deserializedAccounts = await newKeyring.getAccounts();
      expect(deserializedAccounts).toEqual(originalAccounts);
    });
  });

  describe('交易签名', () => {
    it('应该能签名交易', async () => {
      await keyring.addAccounts(1);
      const accounts = await keyring.getAccounts();
      const address = accounts[0];
      
      // 模拟交易对象
      const transaction = {
        txID: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        raw_data: {
          contract: [
            {
              parameter: {
                value: {
                  amount: 1000000,
                  owner_address: address,
                  to_address: 'TJRabPrwbZy45sbavfcjinPJC18kjpRTv8'
                },
                type_url: 'type.googleapis.com/protocol.TransferContract'
              },
              type: 'TransferContract'
            }
          ],
          ref_block_bytes: '0000',
          ref_block_hash: '0000000000000000',
          expiration: 1000000000000,
          timestamp: 1000000000000
        }
      };
      
      // 使用mock替代实际签名
      const mockSignedTx = {
        txID: transaction.txID,
        raw_data: transaction.raw_data,
        signature: ['mock_signature']
      };
      
      // 模拟TronWeb.trx.sign方法
      const originalTronWebTrxSign = TronWeb.prototype.trx.sign;
      TronWeb.prototype.trx.sign = jest.fn().mockResolvedValue(mockSignedTx);
      
      try {
        const signedTx = await keyring.signTransaction(address, transaction);
        expect(signedTx).toEqual(mockSignedTx);
        expect(signedTx.signature).toBeDefined();
        expect(Array.isArray(signedTx.signature)).toBe(true);
      } finally {
        // 恢复原始方法
        TronWeb.prototype.trx.sign = originalTronWebTrxSign;
      }
    });
    
    it('签名无效交易应该抛出错误', async () => {
      await keyring.addAccounts(1);
      const accounts = await keyring.getAccounts();
      const address = accounts[0];
      
      // 缺少txID的交易
      const invalidTransaction = {
        raw_data: {
          contract: []
        }
      };
      
      await expect(keyring.signTransaction(address, invalidTransaction))
        .rejects.toThrow('交易对象必须包含字符串类型的txID字段');
      
      // 无效地址
      await expect(keyring.signTransaction('invalid_address', { txID: '123' }))
        .rejects.toThrow('无效的TRON地址格式');
    });
  });

  describe('账户导出', () => {
    it('应该能导出账户私钥', async () => {
      await keyring.addAccounts(1);
      const accounts = await keyring.getAccounts();
      const privateKey = await keyring.exportAccount(accounts[0]);
      
      expect(typeof privateKey).toBe('string');
      expect(privateKey.length).toBeGreaterThan(0);
    });
    
    it('导出不存在的账户应该抛出错误', async () => {
      await expect(keyring.exportAccount('TJRabPrwbZy45sbavfcjinPJC18kjpRTv8'))
        .rejects.toThrow('Tron Keyring - 找不到匹配的地址');
    });
  });
});