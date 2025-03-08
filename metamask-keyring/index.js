import {
  keyringBuilderFactory,
  KeyringController,
} from "@metamask/keyring-controller";
import { Messenger } from "@metamask/base-controller";
import EosKeyring from "../eos-keyring/index.js";
import RippleKeyring from "../ripple-keyring/index.js";

let controllerMessenger = new Messenger();

const keyringControllerMessenger = controllerMessenger.getRestricted({
  name: "KeyringController",
  allowedActions: ["KeyringController:*"],
  allowedEvents: ["KeyringController:stateChange"],
});

const keyringController = new KeyringController({
  messenger: keyringControllerMessenger,
  keyringBuilders: [keyringBuilderFactory(EosKeyring), keyringBuilderFactory(RippleKeyring)],
});

keyringControllerMessenger.subscribe(
  "KeyringController:stateChange",
  (state) => {
    //console.log("Keyring state changed:", state);
  }
);

await keyringController.createNewVaultAndKeychain("password");
await keyringController.submitPassword("password");
await keyringController.addNewKeyring(EosKeyring.type);
await keyringController.addNewKeyring(RippleKeyring.type);
const selector = { type: EosKeyring.type };

keyringController.withKeyring(selector, async ({ keyring }) => {
  const a1 = await keyring.addAccounts(3);
  console.log("成功创建EOS账户:", a1);
});

keyringController.withKeyring(selector, async ({ keyring }) => {
  const accounts = await keyring.getAccounts();
  console.log("获取EOS账户:", accounts);
});

const rippleSelector = { type: RippleKeyring.type };

keyringController.withKeyring(rippleSelector, async ({ keyring }) => {
  const a1 = await keyring.addAccounts(3);
  console.log("成功创建Ripple账户:", a1);
});

keyringController.withKeyring(rippleSelector, async ({ keyring }) => {
  const a1 = await keyring.getAccounts();
  console.log("成功获取Ripple账户:", a1);
  await keyring.removeAccount(a1[0]);
  const a2 = await keyring.getAccounts()
  console.log("成功删除Ripple账户:", a2);
});