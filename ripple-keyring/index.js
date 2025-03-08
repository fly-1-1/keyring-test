import xrpl from 'xrpl';
import crypto from 'crypto';

class RippleKeyring {
  static type = 'Ripple Key Pair';
  type = RippleKeyring.type;

  _isValidRippleAddress(address) {
    return xrpl.isValidAddress(address);
  }

  constructor(opts = {}) {
    this.wallets = [];
    if (opts.seeds && Array.isArray(opts.seeds)) {
      this.deserialize(opts.seeds);
    }
  }

  async signTransaction(address, transaction) {
    console.log('原始交易对象:', JSON.stringify(transaction, null, 2));
    
    if (!transaction.TransactionType || typeof transaction.TransactionType !== 'string') {
      throw new Error('交易对象必须包含字符串类型的TransactionType字段');
    }
    
    if (!transaction.Account || !this._isValidRippleAddress(transaction.Account)) {
      throw new Error('交易对象包含无效的Account字段');
    }
    if (!address || !this._isValidRippleAddress(address)) {
      throw new Error('无效的XRP地址格式');
    }
    if (!transaction || typeof transaction !== 'object') {
      throw new Error('交易对象必须是非空对象');
    }
    
    try {
      const wallet = this._getWalletForAccount(address);
      
      // 使用xrpl库提供的签名方法
      const signed = xrpl.Wallet.fromSeed(wallet.seed).sign(transaction);
      console.log('完整签名对象:', JSON.stringify(signed, null, 2));
      
      // 新增tx_blob校验
      if (!signed.tx_blob || typeof signed.tx_blob !== 'string') {
        throw new Error('签名后交易缺少有效的tx_blob字段');
      }
      if (!/^[A-Fa-f0-9]+$/.test(signed.tx_blob)) {
        throw new Error('tx_blob必须是有效的16进制字符串');
      }
      
      // 解析签名后的交易blob
      const decodedTx = xrpl.decode(signed.tx_blob);
      
      console.log('解析后的交易对象:', JSON.stringify(decodedTx, null, 2));
      
      // 验证必要字段
      if (!decodedTx.TransactionType || !decodedTx.Account || !decodedTx.SigningPubKey) {
        throw new Error('解析后的交易丢失必要字段');
      }
      
      // 添加二进制格式校验
      if (!/^[A-Fa-f0-9]+$/.test(signed.tx_blob)) {
        throw new Error('无效的交易二进制格式');
      }
      
      console.log('签名后的原始tx_blob:', signed.tx_blob);
      return signed;
    } catch (error) {
      console.error(`交易签名失败: ${error.message}`);
      throw new Error(`签名过程中发生错误: ${error.message}`);
    }
  }



  async serialize() {
    return this.wallets.map(w => w.seed);
  }

  async deserialize(seeds = []) {
    if (!Array.isArray(seeds)) {
      throw new Error('RippleKeyring: 反序列化参数必须是数组');
    }
    this.wallets = seeds.map(seed => xrpl.Wallet.fromSeed(seed));
  }

  async addAccounts(n = 1) {
    const newWallets = [];
    for (let i = 0; i < n; i++) {
      const wallet = xrpl.Wallet.generate();
      newWallets.push(wallet);
    }
    this.wallets = this.wallets.concat(newWallets);
    return newWallets.map(w => w.address);
  }

  async getAccounts() {
    return this.wallets.map(w => w.address);
  }

  async removeAccount(address) {
    if (!this._isValidRippleAddress(address)) {
      throw new Error('无效的XRP地址格式');
    }
    if (!this.wallets.length) {
      throw new Error('账户列表为空');
    }
    this.wallets = this.wallets.filter(w => 
      w.address.toLowerCase() !== address.toLowerCase()
    );
  }

  _getWalletForAccount(address) {
    const wallet = this.wallets.find(w => 
      w.address.toLowerCase() === address.toLowerCase()
    );
    if (!wallet) {
      throw new Error('Ripple Keyring - 找不到匹配的地址');
    }
    return wallet;
  }
}

export default RippleKeyring;