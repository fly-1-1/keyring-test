import { KeyringController } from "@metamask/keyring-controller";

import { Messenger } from "@metamask/base-controller";

let controllerMessenger = new Messenger();

const keyringControllerMessenger = controllerMessenger.getRestricted({
  name: "KeyringController",
  allowedActions: ["KeyringController:*"],
  allowedEvents: ["KeyringController:stateChange"],
});

const keyringController = new KeyringController({
  messenger: keyringControllerMessenger,
  state: {
    vault: '',
    memStore: {
      isUnlocked: false,
      keyrings: [],
      vault: '',
      encryptionKey: null,
      encryptionSalt: null
    },
    keyrings: []
  }
});

keyringControllerMessenger.subscribe('KeyringController:stateChange', (state) => {
  console.log('Keyring state changed:', state);
});

await keyringController.createNewVaultAndKeychain('password');
await keyringController.submitPassword('password');
const accounts = await keyringController.addNewAccount(1);
console.log('成功创建账户:', accounts);

