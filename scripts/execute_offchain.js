const hre = require("hardhat")

// const FACTORY_NONCE = 1
const FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

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
    const adderss1 = await signer1.getAddress()
    let initCode = // "0x"
        FACTORY_ADDRESS +
        AccountFactory.interface.encodeFunctionData("createAccount", [address0]).slice(2)
    console.log(initCode)

    let sender

    try {
        await entryPoint.getSenderAddress(initCode)
    } catch (ex) {
        sender = "0x" + ex.data.data.slice(-40)
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
        nonce: await entryPoint.getNonce(sender, 0),
        initCode,
        callData: Account.interface.encodeFunctionData("execute"),
        callGasLimit: 400_000,
        verificationGasLimit: 400_000,
        preVerificationGas: 100_000,
        maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
        paymasterAndData: PM_ADDRESS,
        signature: "0x",
        // signer0.signMessage(hre.ethers.getBytes(hre.ethers.id("wee"))),
    }

    const userOpHash = await entryPoint.getUserOpHash(userOp)
    userOp.signature = signer0.signMessage(hre.ethers.getBytes(userOpHash))

    const tx = await entryPoint.handleOps([userOp], address0)
    const receipt = await tx.wait()
    console.log(receipt)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
