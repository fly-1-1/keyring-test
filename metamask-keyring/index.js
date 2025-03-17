import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { hdWallet } from "jcc_wallet";
const { HDWallet } = hdWallet;
//import chains from "./support-chains.js";

import {
  keyringBuilderFactory,
  KeyringController,
} from "@metamask/keyring-controller";
import { Messenger } from "@metamask/base-controller";
import EosKeyring from "../eos-keyring/index.js";
import RippleKeyring from "../ripple-keyring/index.js";
import EosHdKeyring from "../eos-hd-keyring/index.js";
import SwtcKeyring from "../swtc-keyring/lib/swtc-keyring.js";
import CCDAOHDKeyring from "../ccdao-hd-keyring/index.js";
const encryptor = require("@metamask/browser-passworder");

let controllerMessenger = new Messenger();

const keyringControllerMessenger = controllerMessenger.getRestricted({
  name: "KeyringController",
  allowedActions: ["KeyringController:*"],
  allowedEvents: [
    "KeyringController:stateChange",
    "KeyringController:getState",
  ],
});

const keyringController = new KeyringController({
  messenger: keyringControllerMessenger,
  keyringBuilders: [
    keyringBuilderFactory(EosKeyring),
    keyringBuilderFactory(RippleKeyring),
    keyringBuilderFactory(EosHdKeyring),
    keyringBuilderFactory(SwtcKeyring),
    keyringBuilderFactory(CCDAOHDKeyring),
  ],
});

keyringControllerMessenger.subscribe(
  "KeyringController:stateChange",
  (state) => {
    //console.log("Keyring state changed:", state);
  }
);

//Test CCDAOHDKeyring

async function testCCDAOHDKeyring() {
  await keyringController.createNewVaultAndKeychain("Gcc123456.");
  await keyringController.submitPassword("Gcc123456.");
  await keyringController.addNewKeyring(CCDAOHDKeyring.type);
  const CCDAOHdSelector = { type: CCDAOHDKeyring.type };

  await keyringController.withKeyring(CCDAOHdSelector, async ({ keyring }) => {
    await keyring.addAccount(HDWallet.generateMnemonic());
    const accounts = await keyring.getAccounts();
    console.log(accounts);
  });
}

// decode vault
async function decodeVault() {
  const result = await encryptor.decryptWithDetail(
    "Gcc123456.",
    '{"data":"fugjL54fq3MEd1Vl9WPNTUP6Ns6KCC09BbR4/Rnma2nDsAJg5xbpKEGPh+g/LTmeGEFr8kVVSqKwWCQtifCREQYcIaIEp0HeOL/PoejXKbkXptNGaLrU8AvhLxVX83O8/Np7uTQPp0kdkvs8peEeAKTvUYODx8IE8lv1/k8H4LCPEaYL0UoDJ/xqyNUX7q4VjydWe1Jhfuz3mpXJCp++6HzqcvMbAYJXJr8RrMd/ymSo4h3BtKCAE1slqSB37O1Hi1wRNIvb3nUiZ9CJGHLTZUJNMpNpt2zMbdSYz7AJIsqBY6z+r9yPqqpOsINylGzFKWXTGJ0r7AN0X6dSi5Nskd5sfydObqLOf0OXsiO50QJdRqvT3ZbBZrYVBrcXeCfht4C8Qw39QGvYx1wcFRx87uIZ743NZHGYxcBvms9XRXD9Lv42jbrYRcgyYoFN+Egkc4vL63trJlYupgIC+3JU/4HmFc5WyDyOEFA/M0iajt1IosAx1rQvbJK3ghX6WK/J6V13ylaGM0Sf93ged2I3oNTYq6ePzpiABCGWffWl2RIftHnOMu6PFTpB/X5S8/R/W89yyV1axEVB16rRZISIJOMlkNuSwYRwpuLQzshqmB34iUy6nS+ZDIPbqRmRMleOC71F0nMvnCuzI1gH+qUfbafq2ecc39yFl/NWN0Mg5YyXKHB9OhC2yVs+SFKPEwj1Xf3+wAbwepqAsFLxUpLgctiyA0C42MnEG+IXb3PqwWfxZBezTXSzPhIr/jDfXxsIXK1xi7EpEVh6m/bEB2FrZro6YPptIRr2DmCX0diAYewDvGKSyUJMdVNXGXCXGYjBj/+Q4niF4Cf6POtDZfcjA5gCPaakjAAjJ/llBxxsi8e+KIBcPzOS6zvNeEwOuvNoK7udHWthn+7Y0sS4ha82was4+Jn6qP0Ab5c/THljHvyQNHIYNF2DtbuWZbAFpleQVOB0aalCVaP8hf27CtVt8PueTHUWZc2aNb98T0U2kRvVJpw=","iv":"s5mVitkB1JIu/AC9vdeA5g==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"LOFdDg1tr0HVsIeeacmrSmYsxbPr15FjX1phtXlESc8="}'
  );
  console.log(JSON.stringify(result));
}

async function initHDWallet() {
  await keyringController.createNewVaultAndKeychain("Gcc123456.");
  await keyringController.submitPassword("Gcc123456.");
  await keyringController.addNewKeyring(CCDAOHDKeyring.type);
  const CCDAOHdSelector = { type: CCDAOHDKeyring.type };

  const mnemonic = HDWallet.generateMnemonic();
  await keyringController.withKeyring(CCDAOHdSelector, async ({ keyring }) => {
    await keyring.addAccount(mnemonic);
    const accounts = await keyring.getAccounts();
    console.log(accounts);
  });

  // for(const chain of chains){
  //   const subAccount  = await keyring.
  // }
}

testCCDAOHDKeyring();

//decodeVault();
