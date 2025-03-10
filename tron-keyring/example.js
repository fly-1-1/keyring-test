import TronKeyring from "./index.js";
import TronWeb from "tronweb";

async function main() {
  try {
    // 初始化keyring
    const keyring = new TronKeyring();
    console.log("创建TronKeyring实例成功");

    // 创建新账户
    const accounts = await keyring.addAccounts(1);
    const address = accounts[0];
    console.log("创建的TRON地址:", address);

    // 使用已有测试币的地址
    const testAddress = "TBdTtThKWRBiZ8T881D4eUD2SkRVFzUCq3";
    console.log("使用已有测试币的地址:", testAddress);

    // 获取所有账户
    const allAccounts = await keyring.getAccounts();
    console.log("当前所有账户:", allAccounts);

    // 创建TronWeb实例
    const tronWeb = new TronWeb({
      fullHost: 'https://api.nileex.io', // 使用Nile测试网
    });

    // 构造TRON交易
    const transaction = await tronWeb.transactionBuilder.sendTrx(
      "TJRabPrwbZy45sbavfcjinPJC18kjpRTv8", // 接收地址
      30000, // 金额，单位是sun (1 TRX = 1,000,000 sun)
      testAddress
    );

    // 确保交易包含必要字段
    if (!transaction.txID) {
      throw new Error("交易对象缺少必要字段: txID");
    }
    console.log("完整的交易对象:", JSON.stringify(transaction, null, 2));

    // 签名交易
    const signedTx = await keyring.signTransaction(testAddress, transaction);
    console.log("签名返回对象结构:", JSON.stringify(signedTx, null, 2));
    
    try {
      // 广播交易
      const result = await tronWeb.trx.sendRawTransaction(signedTx);
      console.log("交易提交结果:", result);

      if (result.result) {
        console.log("交易成功提交到网络");
        console.log("交易哈希:", result.txid);
      } else {
        console.error("交易提交失败:", result.code);
      }
    } catch (error) {
      console.error("交易提交过程中发生错误:", error);
    }
  } catch (error) {
    console.error("发生错误:", error);
  }
  process.exit(0);
}

main();