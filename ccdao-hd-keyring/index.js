import { hdWallet } from "jcc_wallet";
const { HDWallet, BIP44Chain } = hdWallet;

const type = "Ccdao Hd Keyring";
export default class CcdaoHdKeyring {
  static type = type;
  
  constructor(opts = {}) {
    this.type = type;
    this.mnemonic = opts.mnemonic || "";
    this.wallets = [];
    this.multichainAccountLength = new Map();
    this.numberOfAccounts = 0;
  }

  async serialize() {
    return {
      type: this.type,
      mnemonic: this.mnemonic,
      numberOfAccounts: this.numberOfAccounts,
      multichainAccountLength: Array.from(this.multichainAccountLength.entries()),
    };
  }

  async deserialize(obj) {
    this.type = type;
    this.mnemonic = obj.mnemonic;
    this.numberOfAccounts = this.wallets.length;
    this.multichainAccountLength = new Map(obj.multichainAccountLength || []);
    return this;
  }

  async addAccounts(n = 1, chain = BIP44Chain.SWTC) {
    const newWallets = [];
    const hd = HDWallet.fromMnemonic({
      mnemonic: this.mnemonic,
      language: "english",
    });
    const index = this.multichainAccountLength.get(chain) || 0;

    for (let i = 0; i < n; i++) {
      const wallet = hd.deriveWallet({ chain, account: 0, index: index + i });
      this.multichainAccountLength.set(chain, index + i + 1);
      newWallets.push(wallet);
      this.wallets.push(wallet);
      this.numberOfAccounts = this.wallets.length;
    }
    return newWallets.map((w) => w.address());
  }

  async getAccounts() {
    return this.wallets.map((w) => w.address());
  }
}
