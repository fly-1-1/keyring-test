import TronKeyring from "./index.js";
import TronWeb from "tronweb";

async function main() {
  try {
    // 初始化keyring
    const keyring = new TronKeyring();
    console.log("创建TronKeyring实例成功");

    // 创建新账户
    const accounts = await keyring.addAccounts(3);
    const address = accounts[0];
    console.log("创建的TRON地址:", accounts);
    const privateKey = await keyring.exportAccount(address);
    console.log("创建的私钥:", privateKey);

    await keyring.removeAccount(accounts[1]);
    const removedAddress = await keyring.getAccounts();
    console.log("删除后的TRON地址列表:", removedAddress);

    // 使用已有测试币的地址
    let testAddress = "TSTJDk8Ec6z329LA9gAvJ8655Ah81HmCeo";
    console.log("使用已有测试币的地址:", testAddress);

    // 为测试地址导入私钥（这里需要替换为实际的私钥）
    const testPrivateKey =
      "21581BD83403451F639D8438D526BBB05884BDD40D49AA217E8CDD371A5589EC"; // 替换为实际的私钥
    await keyring.deserialize([testPrivateKey]);

    // 验证测试地址是否已添加到keyring
    const updatedAccounts = await keyring.getAccounts();
    if (!updatedAccounts.includes(testAddress)) {
      console.log("警告：测试地址未成功添加到keyring，将使用新创建的地址");
      // 如果测试地址未成功添加，则使用新创建的地址
      testAddress = address;
    }

    // 获取所有账户
    const allAccounts = await keyring.getAccounts();
    console.log("当前所有账户:", allAccounts);

    // 创建TronWeb实例
    const tronWeb = new TronWeb({
      fullHost: "https://api.nileex.io", // 使用Nile测试网
    });

    // 构造TRON交易
    const transaction = await tronWeb.transactionBuilder.sendTrx(
      "TJRabPrwbZy45sbavfcjinPJC18kjpRTv8", // 接收地址
      10000, // 金额，单位是sun (1 TRX = 1,000,000 sun)
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

    // 测试签名消息功能
    console.log("\n=== 测试签名消息功能 ===");
    try {
      const messageToSign = "Hello Tron Blockchain!";
      console.log("准备签名的消息:", messageToSign);
      
      // 尝试签名消息
      const signedMessage = await keyring.signMessage(testAddress, messageToSign);
      console.log("消息签名成功!");
      console.log("签名:", signedMessage.signature);
      
      // 验证消息
      console.log("\n=== 测试验证消息功能 ===");
      try {
        const isVerified = await keyring.verifyMessage(
          messageToSign,
          signedMessage.signature
        );
        console.log("消息验证结果:", isVerified ? "有效" : "无效");
      } catch (verifyError) {
        console.error("消息验证失败:", verifyError.message || verifyError);
      }
    } catch (error) {
      console.error("消息签名失败:", error.message || error);
    }

    // 测试序列化功能
    console.log("\n=== 测试序列化功能 ===");
    const serializedData = await keyring.serialize();
    console.log("序列化后的数据:", serializedData);

    // 测试签名交易功能
    console.log("\n=== 测试签名交易功能 ===");
    try {
      // 创建一个简单的转账交易 (注意：这只是示例，不会实际广播到网络)
      const tronWeb = new TronWeb({
        fullHost: 'https://api.nileex.io', // 使用Nile测试网
        privateKey: testPrivateKey
      });
      
      // 构建一个交易对象
      const receiverAddress = address; // 使用我们创建的第一个地址作为接收方
      const amount = 10000; // 转账金额 (10000 SUN = 0.00001 TRX)
      
      try {
        const transaction = await tronWeb.transactionBuilder.sendTrx(
          receiverAddress,
          amount,
          testAddress
        );
        
        console.log("成功创建交易对象");
        
        // 尝试使用keyring签名交易
        try {
          const signedTransaction = await keyring.signTransaction(testAddress, transaction);
          console.log("交易签名成功，交易ID:", signedTransaction.txID);
        } catch (signError) {
          console.error("使用keyring签名交易失败:", signError.message);
          
          // 如果keyring签名失败，尝试使用tronWeb直接签名
          console.log("尝试使用tronWeb直接签名...");
          const directSignedTx = await tronWeb.trx.sign(transaction);
          console.log("tronWeb直接签名成功，交易ID:", directSignedTx.txID);
        }
      } catch (txError) {
        console.error("创建交易失败:", txError.message);
      }
    } catch (error) {
      console.error("初始化TronWeb或执行交易过程中出错:", error.message);
    }
  } catch (error) {
    console.error("发生错误:", error);
  }
  process.exit(0);
}

main();
