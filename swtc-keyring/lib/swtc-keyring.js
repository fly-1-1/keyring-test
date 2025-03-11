'use strict';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jccWallet = require('jcc_wallet');
const { hdWallet, jtWallet } = jccWallet;

import { EventEmitter } from 'events';

class SwtcKeyring extends EventEmitter {

  static type = 'Swtc Key Pair';
  type = SwtcKeyring.type;
  constructor(opts = {}) {
    super();
    this.wallets = [];
    this.deserialize(opts);
  }

  /**
   * 返回密钥管理类型
   * @returns {string} - 密钥管理类型
   */
  getType() {
    return this.type;
  }

  /**
   * 序列化keyring内容
   * @returns {Object} 序列化后的数据对象
   */
  serialize() {
    return {
      wallets: this.wallets.map((w) => ({
        address: w.address,
        privateKey: w.privateKey
      }))
    };
  }

  /**
   * 反序列化数据到keyring
   * @param {Object} data - 要导入的数据
   */
  deserialize(data = {}) {
    if (data.wallets) {
      this.wallets = data.wallets;
    }
  }

  /**
   * 添加新账户/钱包
   * @param {Object} [opts={}] - 选项
   * @returns {string} 返回新创建的地址
   */
  async addAccount(opts = {}) {
    if (opts.privateKey) {
      const wallet = this._getWalletFromPrivateKey(opts.privateKey);
      this.wallets.push({
        address: wallet.address,
        privateKey: opts.privateKey
      });
      return wallet.address;
    } else {
      // 创建新钱包
      const wallet = this._generateWallet();
      this.wallets.push({
        address: wallet.address,
        privateKey: wallet.secret
      });
      return wallet.address;
    }
  }

  /**
   * 获取所有账户地址
   * @returns {string[]} 地址数组
   */
  async getAccounts() {
    return this.wallets.map((w) => w.address);
  }

  /**
   * 根据地址获取私钥
   * @param {string} address - 账户地址
   * @returns {string} 私钥
   */
  async exportAccount(address) {
    const wallet = this._getWalletByAddress(address);
    if (!wallet) {
      throw new Error(`找不到地址为 ${address} 的钱包`);
    }
    return wallet.privateKey;
  }

  /**
   * 删除账户
   * @param {string} address - 要删除的账户地址
   */
  async removeAccount(address) {
    this.wallets = this.wallets.filter((w) => w.address !== address);
  }

  /**
   * 签名交易
   * @param {string} address - 账户地址
   * @param {Object} tx - 交易数据
   * @returns {Object} 签名后的交易数据
   */
  async signTransaction(address, tx) {
    const wallet = this._getWalletByAddress(address);
    if (!wallet) {
      throw new Error(`找不到地址为 ${address} 的钱包`);
    }
    
    try {
      // 确保tx是有效的交易对象
      if (!tx || typeof tx !== 'object') {
        throw new Error('无效的交易数据');
      }

      // 使用jcc_wallet的hdWallet进行交易签名，与消息签名方法相同
      const { HDWallet } = hdWallet;
      
      // 从私钥创建HDWallet实例
      const hdWalletInstance = HDWallet.fromSecret(wallet.privateKey);
      
      // 将交易转换为字符串进行签名
      const txString = JSON.stringify(tx);
      const signature = hdWalletInstance.sign(txString);
      
      // 返回签名后的交易
      return {
        ...tx,
        signature
      };
    } catch (error) {
      throw new Error(`交易签名失败: ${error.message}`);
    }
  }

  /**
   * 签名消息
   * @param {string} address - 账户地址
   * @param {string} data - 要签名的消息
   * @returns {string} 签名结果
   */
  async signMessage(address, data) {
    const wallet = this._getWalletByAddress(address);
    if (!wallet) {
      throw new Error(`找不到地址为 ${address} 的钱包`);
    }
    
    try {
      // 确保数据是有效的
      if (!data) {
        throw new Error('无效的消息数据');
      }
      
      // 将数据转换为字符串（如果不是字符串）
      const message = typeof data !== 'string' ? JSON.stringify(data) : data;
      
      // 使用jcc_wallet的hdWallet进行消息签名
      const { HDWallet } = hdWallet;
      
      // 从私钥创建HDWallet实例
      const hdWalletInstance = HDWallet.fromSecret(wallet.privateKey);
      
      // 使用HDWallet实例对消息进行签名
      const signature = hdWalletInstance.sign(message);
      
      return signature;
    } catch (error) {
      throw new Error(`消息签名失败: ${error.message}`);
    }
  }

  // 私有方法

  /**
   * 根据地址查找钱包
   * @private
   * @param {string} address - 钱包地址
   * @returns {Object|null} 找到的钱包对象或null
   */
  _getWalletByAddress(address) {
    return this.wallets.find((w) => w.address === address) || null;
  }

  /**
   * 从私钥创建钱包
   * @private
   * @param {string} privateKey - 私钥
   * @returns {Object} 钱包对象
   */
  _getWalletFromPrivateKey(privateKey) {
    try {
      // 使用jcc_wallet API从私钥创建钱包
      // jtWallet.isValidSecret验证私钥格式是否正确
      if (!privateKey || typeof privateKey !== 'string') {
        throw new Error("私钥不能为空且必须是字符串");
      }
      if (!jtWallet.isValidSecret(privateKey)) {
        throw new Error("无效的SWTC私钥格式");
      }
      // 从私钥获取地址
      const address = jtWallet.getAddress(privateKey);
      if (!address) {
        throw new Error("无法从私钥获取有效地址");
      }
      return { address, secret: privateKey };
    } catch (error) {
      throw new Error(`从私钥创建钱包失败: ${error.message}`);
    }
  }

  /**
   * 生成新钱包
   * @private
   * @returns {Object} 包含地址和私钥的新钱包
   */
  _generateWallet() {
    try {
      // 使用jcc_wallet API创建新钱包
      const wallet = jtWallet.createWallet();
      if (!wallet || !wallet.address || !wallet.secret) {
        throw new Error("生成钱包失败，返回的钱包数据无效");
      }
      return wallet;
    } catch (error) {
      throw new Error(`生成新钱包失败: ${error.message}`);
    }
  }
}

export default SwtcKeyring;
