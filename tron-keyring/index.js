import TronWeb from 'tronweb';

class TronKeyring {
  static type = 'Tron Key Pair';
  type = TronKeyring.type;

  _isValidTronAddress(address) {
    return TronWeb.isAddress(address);
  }

  constructor(opts = {}) {
    this.wallets = [];
    if (opts.privateKeys && Array.isArray(opts.privateKeys)) {
      this.deserialize(opts.privateKeys);
    }
  }

  async signTransaction(address, transaction) {
    console.log('原始交易对象:', JSON.stringify(transaction, null, 2));
    
    if (!transaction.txID || typeof transaction.txID !== 'string') {
      throw new Error('交易对象必须包含字符串类型的txID字段');
    }
    
    if (!address || !this._isValidTronAddress(address)) {
      throw new Error('无效的TRON地址格式');
    }
    if (!transaction || typeof transaction !== 'object') {
      throw new Error('交易对象必须是非空对象');
    }
    
    try {
      const wallet = this._getWalletForAccount(address);
      
      // 创建TronWeb实例
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io'
      });
      tronWeb.setPrivateKey(wallet.privateKey);
      
      // 签名交易
      const signedTx = await tronWeb.trx.sign(transaction, wallet.privateKey);
      console.log('完整签名对象:', JSON.stringify(signedTx, null, 2));
      
      // 验证签名后的交易
      if (!signedTx.signature || !Array.isArray(signedTx.signature)) {
        throw new Error('签名后交易缺少有效的signature字段');
      }
      
      // 验证必要字段
      if (!signedTx.txID || !signedTx.raw_data) {
        throw new Error('签名后的交易丢失必要字段');
      }
      
      console.log('签名后的交易ID:', signedTx.txID);
      return signedTx;
    } catch (error) {
      console.error(`交易签名失败: ${error.message}`);
      throw new Error(`签名过程中发生错误: ${error.message}`);
    }
  }

  async serialize() {
    return this.wallets.map(w => w.privateKey);
  }

  async deserialize(privateKeys = []) {
    if (!Array.isArray(privateKeys)) {
      throw new Error('TronKeyring: 反序列化参数必须是数组');
    }
    this.wallets = privateKeys.map(privateKey => {
      const address = TronWeb.address.fromPrivateKey(privateKey);
      return { address, privateKey };
    });
  }

  async addAccounts(n = 1) {
    const newWallets = [];
    for (let i = 0; i < n; i++) {
      const account = TronWeb.utils.accounts.generateAccount();
      newWallets.push({
        address: account.address.base58,
        privateKey: account.privateKey
      });
    }
    this.wallets = this.wallets.concat(newWallets);
    return newWallets.map(w => w.address);
  }

  async getAccounts() {
    return this.wallets.map(w => w.address);
  }

  async removeAccount(address) {
    if (!this._isValidTronAddress(address)) {
      throw new Error('无效的TRON地址格式');
    }
    if (!this.wallets.length) {
      throw new Error('账户列表为空');
    }
    this.wallets = this.wallets.filter(w => 
      w.address.toLowerCase() !== address.toLowerCase()
    );
  }

  async exportAccount(address) {
    const wallet = this._getWalletForAccount(address);
    return wallet.privateKey;
  }

  _getWalletForAccount(address) {
    const wallet = this.wallets.find(w => 
      w.address.toLowerCase() === address.toLowerCase()
    );
    if (!wallet) {
      throw new Error('Tron Keyring - 找不到匹配的地址');
    }
    return wallet;
  }
}

export default TronKeyring;