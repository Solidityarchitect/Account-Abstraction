const hre = require("hardhat")

// const FACTORY_NONCE = 1
const FACTORY_ADDRESS = "0x09c7d95e266ef661416632610cfe77C3AED28892"
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
const PM_ADDRESS = "0x82D137af9E9E43EC90B4D11166e0c15921bd3a8F"

async function main() {
    const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS)

    // CREATE = hash(deployer, nonce)
    // const sender = await hre.ethers.getCreateAddress({
    //     from: FACTORY_ADDRESS,
    //     nonce: FACTORY_NONCE,
    // })
    // console.log({ sender })
    // 0xCafac3dD18aC6c6e92c921884f9E4176737C052c

    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory")
    const [signer0, signer1] = await hre.ethers.getSigners()
    const address0 = await signer0.getAddress()
    // const adderss1 = await signer1.getAddress()
    let initCode = // "0x"
        FACTORY_ADDRESS +
        AccountFactory.interface.encodeFunctionData("createAccount", [address0]).slice(2)
    console.log(initCode)

    let sender

    try {
        await entryPoint.getSenderAddress(initCode)
    } catch (ex) {
        sender = "0x" + ex.data.slice(-40)
    }

    const code = await ethers.provider.getCode(sender)
    if (code !== "0x") {
        initCode = "0x"
    }

    console.log({ sender })
    // address0: 0x03703b9c959d4ed45fb93793b46a7a1c291fec1c
    // address1: 0x1e2234080c65333e2d31c00fd91a4dde6c287f03

    const Account = await hre.ethers.getContractFactory("Account")

    const userOp = {
        sender: sender, // smart contract address
        nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
        initCode,
        callData: Account.interface.encodeFunctionData("execute"),
        paymasterAndData: PM_ADDRESS,
        signature:
            "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        // signer0.signMessage(hre.ethers.getBytes(hre.ethers.id("wee"))),
    }

    const { preVerificationGas, verificationGasLimit, callGasLimit } = await ethers.provider.send(
        "eth_estimateUserOperationGas",
        [userOp, EP_ADDRESS],
    )

    userOp.preVerificationGas = preVerificationGas
    userOp.verificationGasLimit = verificationGasLimit
    userOp.callGasLimit = callGasLimit

    const { maxFeePerGas } = await ethers.provider.getFeeData()
    userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16)

    const maxPriorityFeePerGas = await ethers.provider.send("rundler_maxPriorityFeePerGas")
    userOp.maxPriorityFeePerGas = maxPriorityFeePerGas

    const userOpHash = await entryPoint.getUserOpHash(userOp)
    userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash))

    const opHash = await ethers.provider.send("eth_sendUserOperation", [userOp, EP_ADDRESS])
    console.log(opHash)

    setTimeout(async () => {
        const { transactionHash } = await ethers.provider.send("eth_getUserOperationByHash", [
            opHash,
        ])

        console.log(transactionHash)
    }, 5000)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
