import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { hdWallet } from "jcc_wallet";
const { HDWallet } = hdWallet;

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
  allowedEvents: ["KeyringController:stateChange"],
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
    console.log("Keyring state changed:", state);
  }
);

//Test CCDAOHDKeyring

async function testCCDAOHDKeyring() {
  const mnemonic =
    "insane father swing truth twice blanket apart hollow enemy wink vault approve";

  //await keyringController.createNewVaultAndKeychain("password")//await keyringController.createNewVaultAndRestore("password",mnemonic);
  await keyringController.createNewVaultAndRestore("Gcc123456.", mnemonic);
  await keyringController.submitPassword("Gcc123456.");

  await keyringController.addNewKeyring(CCDAOHDKeyring.type);


  const CCDAOHdSelector = { type: CCDAOHDKeyring.type };

  await keyringController.withKeyring(CCDAOHdSelector, async ({ keyring }) => {
    await keyring.addAccount(HDWallet.generateMnemonic());
    await keyring.addAccount(HDWallet.generateMnemonic());

    //await keyring.addAccount(1,HDWallet.generateMnemonic());

    const accounts =  await keyring.getAccounts()
    console.log(accounts)
  
  });
}

// decode vault
async function decodeVault() {
  const result = await encryptor.decryptWithDetail(
    "Gcc123456.",
   '{"data":"Fi137rDRIt+MtTbbgh288sTVcK9Vd3iwAcXo3oEpDWRv/A1111qmUQarUXIFc06H1kVLCQnK1lh4O1x3M5lYhSczxkGz2hi0Z1SfCkr5AwQ/p3fYnphkOtE1DJaZQaL+6WQFfgjNnJTFc45BuZKdb3wD+Tk7v4+q3iL9T0X5hg79vIpYxhkOVZiMxeLXSIBU+0cT25Ug0/6sAkeQ+1EjspnaxrOTJf2er6cGgt+Fps9YH+J4aQceLAnJhbOBSAHabVZ2OraIFnZI8/OIcyXqSSezPe3aFHClMyICq1HoBRiGGgloHSdVGCaaFRARA1F8MZw9vRtWR+qs79EANnUlQVNiC5m2xjQGQy8gf2A9pfSSgOL/BCn8nwmk0zAzG1KmWKLcVuLRJYYKnlQvYzHBQpm2MOuyRhpJhaiDhN68WWNLlTmq54m8vZMIjAL9vLZ8LUS6CltVo9hJrA+AhdYzr2qL5xZGiVOXQxsM/F+vKmfWSkTJ050kHkabV6EjXfcAMLYXVUWDt4uTAzuP9JKf+xsyvxLBwGkih8OdBgud1ilfmbZfwWA5k1/Rimdj2IYZzTSG8BW9ZTI1uTKqKidtrhdRcKD/bEUWD2ZBV8i+9bD2v0TsEQTriZD02lxETAO+yW4KfwtEO1wTvXT7ftyDOzbR6N4o5UtMilWvwv8+3gFSMwxBN96WKkXuabJNYS52Y6DxUG/Ac53ESN4wlcoAer4RAa4U5s9L7YaHaOcWPDx6YdLEgp0FpLyyy7VeM3RCNZIRr2VWjNUFcBedjROHjNEtU3wUS8FnAj6jhmZkKN8N1dGgtfZzo9E/Sl1MuNbV5putdlxkxD6Kux7Oha0qiKZC6OcasnmAFSDMRWXR0qAnWa6tVdq3ypiuNh5yPw4/+OL3x3iBjNOHsWhUtXqCsIkXZUGPsRTbhvnnzb1rgL1MLJ0CPtpMBExfb7cEjIKr29DWZt+/QANvF5Ti8aVy5iAa5ZnrUESx8a6R2W9qbwKD1JXci12KWfvPpIfHmo8MCofFSak/IscjIYhSljNnehiKmX6WVnfRafPJThQUm2hVHwQ6CteCmhdW4h9I3BesePrvb6Y18iBmVtM1+t+3BzkUdUSrE+64v59vpeJaUwKYh4znVtEwYsexDNE0lXsPm0VEwGLvo8AG16xBSbhXnBPx7LRHDBLMV6QnnyktFjD3CT8K2P3/vdvrdsBZUMdLdl1pW48J6cUOXF6HlWxH6sKKJn7K0ARdzTyG8SYSphHQoKTjZLsVkkl+7lnR5d/4iPtBcEYvJb/nPoBZS8ikEly/juVjNffP1FwQ7jL5jVJDhteoKeX0cHwpj1I6ZFumQF2QT4Bk3Vgw81PyzTgaQdQKcRxbvVZJr0oNS8fD2RV7","iv":"qVXcV9VcQJwFRRIdPQ6V7g==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"Pt3el1fs5umZhwA/8NHTC8GB20d2N8oQzTgHP6b/Kf8="}'
  );
  console.log(JSON.stringify(result));
}

//testCCDAOHDKeyring();
decodeVault();

// const account = await keyringController.addNewAccount(0);
// const account2 = await keyringController.addNewAccount(1);
// const account3 = await keyringController.addNewAccount(2);
// await keyringController.addNewAccount();

// const accounts = await keyringController.getAccounts();
// //console.log("成功获取账户:", accounts)

// //const result = await encryptor.decryptWithDetail('Gcc123456.',  '{"data":"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","iv":"43gL21kMC2j8ZIcmTj4HYQ==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"zd0qDQ7J8Jl9/cZnJhUuPz+wxJzyE18A/rx1M7sgeP4="}');

// const result = await encryptor.decryptWithDetail(
//   "password",
//   '{"data":"hVq1JNCm6jRNsMg4JZrhNgvqhtrlPWBA59YwI7iozxOc3FTMZfTDrgIx+xzPUx9NnG4nOKxAPHvoJvgSlD9BIB/Rlrw3g516UMiiR1l1YkHGjtDvp9Yth2GFAyCmWkCOT/3v+EqXTEpiCyDR1T4egaxChTQtI6Ic6AQgtquBEoG/KpYJE3dpdaUkda88AGXxS5RDYD+ULIfsoF107FgEEsasLm9q21FZO/hBqD68n1FK7Ge2pJByrCs8ceanBGUtkAwGxmMeRMpdfK4U3hPfjdemvhUOqoePxBjrQRy9BzFSS03ee/ikQ0xERdkpcjhiHe0KyPR92cO0azyyvaGFukc1K/T9rNKbfk7Nq8Mg+l4oNqqWyu4ahpyPiYivR+1jEw7glDrcsYkBiBjR3c0pDh46v1eyjA1aC+Urw0U91SJgUQeH8hJSiwRut2eLwJrelNbKRSaKRfyXSrhK+tHB2hgUWWQgLmQ20XVlpHGFfeGIVn2733RFOLf+tR2pMGHkpThwdTKXRZGuVcKYEg==","iv":"WOyzCmo4QMcnH4LsApkflA==","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":900000}},"salt":"hDeZXGYsoeaU1ahFQ+z9juI1MNb8GaBQgo2k7Iz5n0A="}'
// );
// console.log(JSON.stringify(result));

// // 将助记词数组转换为字符串
// const mnemonicArray = result.vault[0].data.mnemonic;
// const rmnemonic = String.fromCharCode.apply(null, mnemonicArray);
// console.log("助记词:", rmnemonic);

//console.log("成功创建账户:", accounts)

// await keyringController.addNewKeyring(EosKeyring.type);
// await keyringController.addNewKeyring(EosHdKeyring.type,{mnemonic: mnemonic});
// await keyringController.addNewKeyring(RippleKeyring.type);
// await keyringController.addNewKeyring(SwtcKeyring.type);

// const swtcSelector = { type: SwtcKeyring.type };

// keyringController.withKeyring(swtcSelector, async ({ keyring }) => {
//   const a1 = await keyring.addAccounts(2);
//   console.log("成功创建SWTC账户:", a1);
//   const swtcPrivateKey = await keyring.exportAccount(a1[0])
//   console.log("导出SWTC账户私钥:", swtcPrivateKey);

// })

// const add1 = await keyringController.addNewAccount(1)
// const privateKey = await keyringController.exportAccount("password",add1)
// console.log("address:", add1)
// console.log("导出私钥:", privateKey);

// const selector = { type: EosKeyring.type };
// keyringController.withKeyring(selector, async ({ keyring }) => {
//   const a1 = await keyring.addAccounts(3);
//   console.log("成功创建EOS账户:", a1);
//   const eosPrivateKey = await keyring.exportAccount(a1[0])
//   console.log("导出EOS账户私钥:", eosPrivateKey);
// });

// const eosHdSelector = { type: EosHdKeyring.type };
// keyringController.withKeyring(eosHdSelector, async ({ keyring }) => {
//   const a1 = await keyring.addAccounts(3);
//   console.log("成功创建EOS HD账户:", a1);
//   const eosPrivateKey = await keyring.exportAccount(a1[0])
//   console.log("导出EOS HD账户私钥:", eosPrivateKey);
// });

// const rippleSelector = { type: RippleKeyring.type };

// keyringController.withKeyring(rippleSelector, async ({ keyring }) => {
//   const a1 = await keyring.addAccounts(3);
//   console.log("成功创建Ripple账户:", a1);
//   const ripplePrivateKey = await keyring.exportAccount(a1[0])
//   console.log("导出Ripple账户私钥:", ripplePrivateKey);
// });

// keyringController.withKeyring(rippleSelector, async ({ keyring }) => {
//   const a1 = await keyring.getAccounts();
//   console.log("成功获取Ripple账户:", a1);
//   await keyring.removeAccount(a1[0]);
//   const a2 = await keyring.getAccounts()
//   console.log("成功删除Ripple账户:", a2);
// });
