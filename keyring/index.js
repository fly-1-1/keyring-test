const Wallet = require('ethereumjs-wallet').default;
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');

class SimpleKeyring {
  static type = 'Simple Key Pair';

  constructor(opts = {}) {
    this.wallets = [];
    this.deserialize(opts);
  }

  async serialize() {
    return this.wallets.map((w) => w.getPrivateKey().toString('hex'));
  }

  async deserialize(privateKeys = []) {
    if (!Array.isArray(privateKeys)) {
      privateKeys = [];
    }
    this.wallets = privateKeys.map((key) => {
      const privateKeyBuffer = ethUtil.toBuffer('0x' + key);
      return Wallet.fromPrivateKey(privateKeyBuffer);
    });
  }

  async addAccounts(n = 1) {
    const newWallets = [];
    for (let i = 0; i < n; i++) {
      const wallet = Wallet.generate();
      newWallets.push(wallet);
    }
    this.wallets = this.wallets.concat(newWallets);
    return newWallets.map((w) => ethUtil.bufferToHex(w.getAddress()));
  }

  async getAccounts() {
    return this.wallets.map((w) => ethUtil.bufferToHex(w.getAddress()));
  }

  async signTransaction(address, tx) {
    const wallet = this._getWalletForAccount(address);
    const privKey = wallet.getPrivateKey();
    return tx.sign(privKey);
  }

  async signMessage(address, data) {
    const wallet = this._getWalletForAccount(address);
    const privKey = wallet.getPrivateKey();
    const msgHash = ethUtil.hashPersonalMessage(ethUtil.toBuffer(data));
    const sig = ethUtil.ecsign(msgHash, privKey);
    return ethUtil.bufferToHex(Buffer.concat([
      sig.r,
      sig.s,
      Buffer.from([sig.v]),
    ]));
  }

  async getEncryptionPublicKey(address) {
    const wallet = this._getWalletForAccount(address);
    const privKey = wallet.getPrivateKey();
    return sigUtil.getEncryptionPublicKey(privKey.toString('hex'));
  }

  async decryptMessage(address, data) {
    const wallet = this._getWalletForAccount(address);
    const privKey = wallet.getPrivateKey();
    const decryptedData = sigUtil.decrypt(JSON.parse(ethUtil.toBuffer(data).toString()), privKey.toString('hex'));
    return JSON.parse(decryptedData).data;
  }

  async exportAccount(address) {
    const wallet = this._getWalletForAccount(address);
    return wallet.getPrivateKey().toString('hex');
  }

  async removeAccount(address) {
    if (!this.wallets.length) {
      throw new Error('No accounts found.');
    }

    this.wallets = this.wallets.filter((w) => {
      const currentAddress = ethUtil.bufferToHex(w.getAddress());
      return currentAddress.toLowerCase() !== address.toLowerCase();
    });
  }

  _getWalletForAccount(address) {
    const wallet = this.wallets.find((w) => {
      const currentAddress = ethUtil.bufferToHex(w.getAddress()).toLowerCase();
      return currentAddress === address.toLowerCase();
    });
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching address.');
    }
    return wallet;
  }
}

module.exports = SimpleKeyring;