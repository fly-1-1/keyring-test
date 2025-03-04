const TronWeb = require('tronweb');

class TronKeyring {
  static type = 'Simple Key Pair';

  constructor(opts = {}) {
    this.wallets = [];
    this.deserialize(opts);
  }

  async serialize() {
    return this.wallets.map(w => w.privateKey);
  }

  async deserialize(privateKeys = []) {
    if (!Array.isArray(privateKeys)) {
      privateKeys = [];
    }
    this.wallets = privateKeys.map(privateKey => {
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        privateKey: privateKey
      });
      return {
        privateKey,
        address: tronWeb.address.fromPrivateKey(privateKey)
      };
    });
  }

  async addAccounts(n = 1) {
    const newWallets = [];
    for (let i = 0; i < n; i++) {
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io'
      });
      const account = await tronWeb.createAccount();
      const address = tronWeb.address.fromPrivateKey(account.privateKey);
      newWallets.push({
        privateKey: account.privateKey,
        address: address
      });
    }
    this.wallets = this.wallets.concat(newWallets);
    return newWallets.map(w => w.address);
  }

  async getAccounts() {
    return this.wallets.map(w => w.address);
  }

  async signTransaction(address, transaction) {
    const wallet = this._getWalletForAccount(address);
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      privateKey: wallet.privateKey
    });

    try {
      // 创建模拟交易
      const tx = await tronWeb.transactionBuilder.createTransaction(
        transaction.to,
        transaction.amount,
        address
      );
      // 签名交易
      const signedTx = await tronWeb.trx.sign(tx);
      // 确保返回的交易对象包含签名
      if (!signedTx || !signedTx.signature) {
        throw new Error('Failed to generate transaction signature');
      }
      return signedTx;
    } catch (error) {
      throw new Error(`Transaction signing failed: ${error.message || 'Unknown error'}`);
    }
  }

  async signMessage(address, message) {
    const wallet = this._getWalletForAccount(address);
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      privateKey: wallet.privateKey
    });

    const messageHex = tronWeb.toHex(message);
    const signedMsg = await tronWeb.trx.sign(messageHex);
    return signedMsg;
  }

  async exportAccount(address) {
    const wallet = this._getWalletForAccount(address);
    return wallet.privateKey;
  }

  async removeAccount(address) {
    if (!this.wallets.length) {
      throw new Error('No accounts found.');
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
      throw new Error('TRON Keyring - Unable to find matching address.');
    }
    return wallet;
  }
}

module.exports = TronKeyring;