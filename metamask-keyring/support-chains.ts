import { hdWallet } from "jcc_wallet";
const { BIP44Chain } = hdWallet;

const chains = [
  {
    chainId: BIP44Chain.ETH,
    label: "Ethereum",
    name: "ethereum"
  },
  {
    chainId: BIP44Chain.BSC,
    label: "Binance",
    name: "binance"
  },
  {
    chainId: BIP44Chain.POLYGON,
    label: "Polygon",
    name: "polygon"
  },
  {
    chainId: BIP44Chain.SWTC,
    label: "SWTC",
    name: "swtc"
  },
  {
    chainId: BIP44Chain.RIPPLE,
    label: "Ripple",
    name: "ripple"
  },
  {
    chainId: BIP44Chain.TRON,
    label: "Tron",
    name: "tron"
  },
  {
    chainId: BIP44Chain.EOS,
    label: "EOS",
    name: "eos"
  },
  {
    chainId: BIP44Chain.MOAC,
    label: "MOAC",
    name: "moac"
  }
];

export default chains;
