import { hdWallet } from "jcc_wallet";
const { HDWallet, BIP44Chain } = hdWallet;

export default class CCDAOHDKeyring {
  static type = "CCDAO HD Keyring";
  type = CCDAOHDKeyring.type;

  wallets = [];
  mnemonic =
    "scrub slow view debate culture suspect other search unfair popular miss mouse";
  mutichainAccountLength = new Map();
  numberOfAccounts;

  async serialize() {
    return {
      type: this.type,
      mnemonic: this.mnemonic,
      wallets: this.wallets.map((wallet) => ({
        address: wallet.address(),
        keypair: wallet.keypair().toString("hex"),
        path: wallet.path(),
      })),
    };
  }

  async deserialize(obj) {
    this.type = obj.type;
    this.mnemonic = obj.mnemonic;
    this.wallets = obj.wallets.map(
      (walletData) =>
        new HDWallet({
          keypair: Buffer.from(walletData.keypair, "hex"),
          path: walletData.path,
        })
    );
    this.numberOfAccounts = this.wallets.length;
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
