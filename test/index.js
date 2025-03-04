import { AssetsContractController } from "@metamask/assets-controllers";
import { Messenger } from "@metamask/base-controller";
import { NetworkController } from "@metamask/network-controller";

let controllerMessenger = new Messenger();

const networkController = new NetworkController({
  messenger: controllerMessenger,
  infuraProjectId: "0d468ae3788d4b78a511016a855a4cf7",
});

networkController.initializeProvider();

const assetsContractControllerMessenger = controllerMessenger.getRestricted({
  name: "AssetsContractController",
  allowedActions: ["NetworkController:getSelectedNetworkClient"],
  allowedEvents: [
    "PreferencesController:stateChange",
    "NetworkController:networkDidChange",
  ],
});

const assetsContractController = new AssetsContractController({
  messenger: assetsContractControllerMessenger,
  chainId: "0x89",
});

const stander = await assetsContractController.getERC721Standard();

const flag = await stander.contractSupportsInterface(
  "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD",
  "0x80ac58cd"
);

const flag2 = await stander.contractSupportsBase721Interface("0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD")
console.log(flag);
console.log(flag2);
