import { hdWallet } from "jcc_wallet";
const { HDWallet, BIP44Chain } = hdWallet;

export default class CCDAOHDKeyring {
  static type = "CCDAO HD Keyring";
  type = CCDAOHDKeyring.type;

  wallets = [];
  mnemonic;
  mutichainAccountLength = new Map();
  numberOfAccounts;

  async serialize() {
    return {
      type: this.type,
      mnemonic: this.mnemonic,
      numberOfAccounts: this.numberOfAccounts,
      mutichainAccountLength: Array.from(this.mutichainAccountLength.entries()),
    };
  }

  async deserialize(obj) {
    this.type = obj.type;
    this.mnemonic = obj.mnemonic;
    this.numberOfAccounts = this.wallets.length;
    this.mutichainAccountLength = new Map(obj.mutichainAccountLength);
    return this;
  }

  async addAccounts(n = 1, chain = BIP44Chain.SWTC) {
    const newWallets = [];
    const hd = HDWallet.fromMnemonic({
      mnemonic: this.mnemonic,
      language: "english",
    });
    const index = this.mutichainAccountLength.get(chain) || 0;

    for (let i = 0; i < n; i++) {
      const wallet = hd.deriveWallet({ chain, account: 0, index: index + i });
      this.mutichainAccountLength.set(chain, index + i + 1);
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
