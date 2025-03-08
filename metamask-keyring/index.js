import {
  keyringBuilderFactory,
  KeyringController,
} from "@metamask/keyring-controller";
import { Messenger } from "@metamask/base-controller";
import EosKeyring from "../eos-keyring/index.js";
import RippleKeyring from "../ripple-keyring/index.js";
import EosHdKeyring from "../eos-hd-keyring/index.js";

let controllerMessenger = new Messenger();

const keyringControllerMessenger = controllerMessenger.getRestricted({
  name: "KeyringController",
  allowedActions: ["KeyringController:*"],
  allowedEvents: ["KeyringController:stateChange"],
});

const keyringController = new KeyringController({
  messenger: keyringControllerMessenger,
  keyringBuilders: [keyringBuilderFactory(EosKeyring), keyringBuilderFactory(RippleKeyring), keyringBuilderFactory(EosHdKeyring)],
});

keyringControllerMessenger.subscribe(
  "KeyringController:stateChange",
  (state) => {
    //console.log("Keyring state changed:", state);
  }
);
const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow';

await keyringController.createNewVaultAndKeychain("password");
await keyringController.submitPassword("password");
await keyringController.addNewKeyring(EosKeyring.type);
await keyringController.addNewKeyring(EosHdKeyring.type,{mnemonic: mnemonic});
await keyringController.addNewKeyring(RippleKeyring.type);

const add1 = await keyringController.addNewAccount(1)
const privateKey = await keyringController.exportAccount("password",add1)
console.log("address:", add1)
console.log("导出私钥:", privateKey);

const selector = { type: EosKeyring.type };
keyringController.withKeyring(selector, async ({ keyring }) => {
  const a1 = await keyring.addAccounts(3);
  console.log("成功创建EOS账户:", a1);
  const eosPrivateKey = await keyring.exportAccount(a1[0])
  console.log("导出EOS账户私钥:", eosPrivateKey);
});



const eosHdSelector = { type: EosHdKeyring.type };
keyringController.withKeyring(eosHdSelector, async ({ keyring }) => {
  const a1 = await keyring.addAccounts(3);
  console.log("成功创建EOS HD账户:", a1);
  const eosPrivateKey = await keyring.exportAccount(a1[0])
  console.log("导出EOS HD账户私钥:", eosPrivateKey);
});

const rippleSelector = { type: RippleKeyring.type };

keyringController.withKeyring(rippleSelector, async ({ keyring }) => {
  const a1 = await keyring.addAccounts(3);
  console.log("成功创建Ripple账户:", a1);
  const ripplePrivateKey = await keyring.exportAccount(a1[0])
  console.log("导出Ripple账户私钥:", ripplePrivateKey);
});

keyringController.withKeyring(rippleSelector, async ({ keyring }) => {
  const a1 = await keyring.getAccounts();
  console.log("成功获取Ripple账户:", a1);
  await keyring.removeAccount(a1[0]);
  const a2 = await keyring.getAccounts()
  console.log("成功删除Ripple账户:", a2);
});