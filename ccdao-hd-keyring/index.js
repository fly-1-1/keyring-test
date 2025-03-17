import { hdWallet } from "jcc_wallet";
const { HDWallet } = hdWallet;
import { v4 as uuidv4 } from "uuid";

export default class CCDAOHDKeyring {
  static type = "CCDAO HD Keyring";
  type = CCDAOHDKeyring.type;
  mnemonic
  // seed
  // root
  // hdWallet
  // hdPath
  constructor(opts = {}) {
    this.mnemonic = null;
    this.path = "";
    this.wallets = [];
    this.root = null;
    this.deserialize(opts);
  }

  async serialize() {
    return {
      data: {
        mnemonic: this.mnemonic,
        wallets: this.wallets.map(w => ({
          address: w.address,
          path: w.path,
          id: w.id,
          children: w.children
        }))
      }
    };
  }

  async deserialize(opts = {}) {
    this.mnemonic = (opts.data && opts.data.mnemonic) || null;
    this.wallets = ((opts.data && opts.data.wallets) || []).map(w => ({
      ...w,
      data: this.mnemonic
    }));

    if (this.mnemonic) {
      this._initFromMnemonic(this.mnemonic);
    }

    if (opts.numberOfAccounts) {
      await this.addAccount(opts.numberOfAccounts);
    }
  }

  async addAccount(n = 1) {
    if (!this.mnemonic) {
      this.mnemonic = HDWallet.generateMnemonic();
      this._initFromMnemonic(this.mnemonic);
    }

    const newWallets = [];
    for (let i = 0; i < n; i++) {
      const hd = HDWallet.fromMnemonic({
        mnemonic: this.mnemonic,
        language: "english",
      });

      newWallets.push({
        data: this.mnemonic,
        address: hd.address(),
        path: hd.path(),
        id: uuidv4(),
        children: []
      });
    }
    this.wallets = this.wallets.concat(newWallets);
    return newWallets.map((w) => w.publicKey);
  }

  _initFromMnemonic(mnemonic) {
    this.root = HDWallet.fromMnemonic({ mnemonic, path: this.hdPath });
  }

  async getAccounts() {
    return this.wallets.map(w => w.address);
  }
}
