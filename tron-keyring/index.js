import TronWeb from 'tronweb';

/**
 * TronKeyring类 - 波场(TRON)账户管理工具
 * 
 * 用于管理TRON账户的钥匙串类，支持以下功能：
 * - 创建和管理TRON账户
 * - 签名交易(TRX转账和智能合约交互)
 * - 消息签名(TIP-191标准)和验证
 * - 导入/导出私钥
 * - 账户序列化和反序列化
 * 
 * @class TronKeyring
 */
class TronKeyring {
  /**
   * 波场(TRON)钥匙串类型标识符
   * @type {string}
   * @static
   */
  static type = 'Tron Key Pair';
  
  /**
   * 实例类型标识符
   * @type {string}
   */
  type = TronKeyring.type;

  /**
   * 验证TRON地址格式是否有效
   * @param {string} address - 待验证的TRON地址
   * @returns {boolean} - 如果地址有效返回true，否则返回false
   * @private
   */
  _isValidTronAddress(address) {
    // 检查地址是否为字符串类型
    if (typeof address !== 'string') {
      return false;
    }
    
    // 使用TronWeb进行地址验证
    return TronWeb.isAddress(address);
  }

  /**
   * 创建TronWeb实例
   * @param {string} [privateKey] - 可选的私钥，如果提供则会设置为当前实例使用的私钥
   * @param {string} [node='https://api.trongrid.io'] - TRON节点RPC地址
   * @returns {Object} - 配置好的TronWeb实例
   * @private
   */
  _createTronWeb(privateKey, node = 'https://api.trongrid.io') {
    const tronWeb = new TronWeb({
      fullHost: node
    });
    
    if (privateKey) {
      tronWeb.setPrivateKey(privateKey);
    }
    
    return tronWeb;
  }

  /**
   * 构造函数
   * @param {Object} opts - 配置选项
   * @param {Array<string>} [opts.privateKeys] - 初始化时导入的私钥数组
   */
  constructor(opts = {}) {
    this.wallets = [];
    if (opts.privateKeys && Array.isArray(opts.privateKeys)) {
      this.deserialize(opts.privateKeys);
    }
  }

  /**
   * 签名TRON交易
   * @param {string} address - 签名交易的账户地址
   * @param {Object} transaction - 要签名的交易对象，必须包含txID和交易数据
   * @returns {Promise<Object>} - 返回已签名的交易对象
   * @throws {Error} 如果地址无效、交易对象无效或签名过程中发生错误
   */
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
      const tronWeb = this._createTronWeb(wallet.privateKey);
      
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

  /**
   * 使用指定地址的私钥对消息进行签名
   * @param {string} address - 用于签名的TRON地址
   * @param {string} message - 要签名的消息
   * @returns {Promise<Object>} - 包含消息、签名和地址的对象
   * @throws {Error} 如果地址无效、消息无效或签名过程中发生错误
   */
  async signMessage(address, message) {
    if (!address || !this._isValidTronAddress(address)) {
      throw new Error('无效的TRON地址格式');
    }
    if (!message || typeof message !== 'string') {
      throw new Error('消息必须是非空字符串');
    }
    
    try {
      const wallet = this._getWalletForAccount(address);
      
      // 直接使用TronWeb.Trx的静态方法进行签名，避免实例化问题
      const signature = await TronWeb.Trx.signMessageV2(message, wallet.privateKey);
      
      // 返回签名结果
      return {
        message,
        signature,
        address
      };
    } catch (error) {
      console.error(`消息签名失败:`, error);
      throw new Error(`签名过程中发生错误: ${error.message || String(error)}`);
    }
  }

  /**
   * 验证消息签名
   * @param {string} message - 原始消息
   * @param {string} signature - 消息签名
   * @returns {Promise<boolean>} - 如果签名有效则返回true，否则返回false
   * @throws {Error} 如果消息无效、签名无效或验证过程中发生错误
   */
  async verifyMessage(message, signature) {
    if (!message || typeof message !== 'string') {
      throw new Error('消息必须是非空字符串');
    }
    if (!signature || typeof signature !== 'string') {
      throw new Error('签名必须是非空字符串');
    }
    
    try {
      // 创建TronWeb实例
      const tronWeb = this._createTronWeb();
      
      try {
        // 使用verifyMessageV2方法验证签名并恢复地址
        const recoveredAddress = await tronWeb.trx.verifyMessageV2(message, signature);
        
        // 验证地址是否是当前钥匙串管理的地址
        const accounts = await this.getAccounts();
        return accounts.includes(recoveredAddress);
      } catch (e) {
        console.log('签名验证失败:', e);
        return false;
      }
    } catch (error) {
      console.error(`消息验证失败:`, error);
      throw new Error(`验证过程中发生错误: ${error.message || String(error)}`);
    }
  }

  /**
   * 序列化钥匙串为私钥数组
   * @returns {Promise<Array<string>>} - 返回钥匙串中所有账户的私钥数组
   */
  async serialize() {
    return this.wallets.map(w => w.privateKey);
  }

  /**
   * 从私钥数组反序列化钥匙串
   * @param {Array<string>} privateKeys - 私钥数组
   * @throws {Error} 如果privateKeys不是数组
   */
  async deserialize(privateKeys = []) {
    if (!Array.isArray(privateKeys)) {
      throw new Error('TronKeyring: 反序列化参数必须是数组');
    }
    this.wallets = privateKeys.map(privateKey => {
      const address = TronWeb.address.fromPrivateKey(privateKey);
      return { address, privateKey };
    });
  }

  /**
   * 添加新的TRON账户
   * @param {number} n - 要添加的账户数量，默认为1
   * @returns {Promise<Array<string>>} - 返回新添加账户的地址数组
   */
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

  /**
   * 获取当前钥匙串中所有账户的地址
   * @returns {Promise<Array<string>>} - 返回所有账户地址的数组
   */
  async getAccounts() {
    return this.wallets.map(w => w.address);
  }

  /**
   * 移除指定地址的账户
   * @param {string} address - 要移除的账户地址
   * @throws {Error} 如果地址无效或账户列表为空
   */
  async removeAccount(address) {
    if (!this._isValidTronAddress(address)) {
      throw new Error('无效的TRON地址格式');
    }
    if (!this.wallets.length) {
      throw new Error('账户列表为空');
    }
    this.wallets = this.wallets.filter(w => 
      w.address !== address
    );
  }

  /**
   * 导出指定地址账户的私钥
   * @param {string} address - 要导出私钥的账户地址
   * @returns {Promise<string>} - 返回对应账户的私钥
   * @throws {Error} 如果找不到匹配的账户
   */
  async exportAccount(address) {
    const wallet = this._getWalletForAccount(address);
    return wallet.privateKey;
  }

  /**
   * 根据地址获取钱包对象
   * @param {string} address - 账户地址
   * @returns {Object} - 包含地址和私钥的钱包对象
   * @throws {Error} 如果找不到匹配的账户
   * @private
   */
  _getWalletForAccount(address) {
    if (!address || !this._isValidTronAddress(address)) {
      throw new Error('无效的TRON地址格式');
    }
    
    // TRON地址比较应该直接比较，而不是转为小写后比较
    const wallet = this.wallets.find(w => 
      w.address === address
    );
    
    if (!wallet) {
      throw new Error(`Tron Keyring - 找不到地址为 ${address} 的账户`);
    }
    
    return wallet;
  }
}

export default TronKeyring;