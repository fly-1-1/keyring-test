const ecc = require('eosjs-ecc');
const { Api, JsonRpc } = require('eosjs');

class EOSKeyring {
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
    this.wallets = privateKeys.map(privateKey => ({
      privateKey,
      publicKey: ecc.privateToPublic(privateKey)
    }));
  }

  async addAccounts(n = 1) {
    const newWallets = [];
    for (let i = 0; i < n; i++) {
      const privateKey = await ecc.randomKey();
      const publicKey = ecc.privateToPublic(privateKey);
      newWallets.push({ privateKey, publicKey });
    }
    this.wallets = this.wallets.concat(newWallets);
    return newWallets.map(w => w.publicKey);
  }

  async getAccounts() {
    return this.wallets.map(w => w.publicKey);
  }

  async signTransaction(publicKey, transaction) {
    const wallet = this._getWalletForAccount(publicKey);
    const signature = ecc.sign(transaction, wallet.privateKey);
    return signature;
  }

  async signMessage(publicKey, data) {
    const wallet = this._getWalletForAccount(publicKey);
    const signature = ecc.sign(data, wallet.privateKey);
    return signature;
  }

  async exportAccount(publicKey) {
    const wallet = this._getWalletForAccount(publicKey);
    return wallet.privateKey;
  }

  async removeAccount(publicKey) {
    if (!this.wallets.length) {
      throw new Error('No accounts found.');
    }

    this.wallets = this.wallets.filter(w => 
      w.publicKey.toLowerCase() !== publicKey.toLowerCase()
    );
  }

  _getWalletForAccount(publicKey) {
    const wallet = this.wallets.find(w => 
      w.publicKey.toLowerCase() === publicKey.toLowerCase()
    );
    if (!wallet) {
      throw new Error('EOS Keyring - Unable to find matching public key.');
    }
    return wallet;
  }
}

module.exports = EOSKeyring;