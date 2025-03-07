import ecc from 'eosjs-ecc';
import bip39 from 'bip39';
import hdkey from 'hdkey';
import { publicToAddress, toChecksumAddress } from 'ethereumjs-util';

class EosHdKeyring {
  static type = 'EOS HD Key Pair';
  type = EosHdKeyring.type;

  constructor(opts = {}) {
    this.mnemonic = null;
    this.hdPath = "m/44'/194'/0'/0";
    this.wallets = [];
    this.root = null;
    this.deserialize(opts);
  }

  async serialize() {
    return {
      mnemonic: this.mnemonic,
      hdPath: this.hdPath,
      privateKeys: this.wallets.map(w => w.privateKey)
    };
  }

  async deserialize(opts = {}) {
    this.mnemonic = opts.mnemonic || null;
    this.hdPath = opts.hdPath || "m/44'/194'/0'/0";
    this.wallets = (opts.privateKeys || []).map(privateKey => ({
      privateKey,
      publicKey: ecc.privateToPublic(privateKey)
    }));
    
    if (this.mnemonic) {
      this._initFromMnemonic(this.mnemonic);
    }

    if (this.mnemonic) {
      this._initFromMnemonic(this.mnemonic);
      if (opts.numberOfAccounts) {
        await this.addAccounts(opts.numberOfAccounts);
      }
    }
  }

  async addAccounts(n = 1) {
    if (!this.mnemonic) {
      this.mnemonic = bip39.generateMnemonic();
      this._initFromMnemonic(this.mnemonic);
    }

    const newWallets = [];
    for (let i = 0; i < n; i++) {
      const index = this.wallets.length;
      const path = `${this.hdPath}/${index}`;
      const childKey = this.root.derive(path);
      const privateKeyBuffer = childKey.privateKey;
      const eosPrivateKey = ecc.PrivateKey.fromHex(privateKeyBuffer.toString('hex'));
      const privateKey = eosPrivateKey.toString();
      const publicKey = eosPrivateKey.toPublic().toString();
      
      this.wallets.push({
        privateKey,
        publicKey,
        index,
      });
    }
    return this.wallets.map(w => w.publicKey);
  }

  _initFromMnemonic(mnemonic) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    this.root = hdkey.fromMasterSeed(seed);
    this.root = this.root.derive(this.hdPath);
  }

  async getAccounts() {
    return this.wallets.map(w => w.publicKey);
  }

  async signTransaction(publicKey, transaction) {
    const wallet = this._getWalletForAccount(publicKey);
    return ecc.sign(transaction, wallet.privateKey);
  }

  async signMessage(publicKey, data) {
    const wallet = this._getWalletForAccount(publicKey);
    return ecc.sign(data, wallet.privateKey);
  }

  async exportAccount(publicKey) {
    const wallet = this._getWalletForAccount(publicKey);
    return wallet.privateKey;
  }

  _getWalletForAccount(publicKey) {
    const wallet = this.wallets.find(w => 
      w.publicKey.toLowerCase() === publicKey.toLowerCase()
    );
    if (!wallet) {
      throw new Error('EOS HD Keyring - 找不到匹配的公钥');
    }
    return wallet;
  }
}

export default EosHdKeyring;