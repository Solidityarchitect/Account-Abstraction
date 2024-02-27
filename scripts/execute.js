const hre = require("hardhat")

const FACTORY_NONCE = 1
const FACTORY_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
const EP_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F"
const PM_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"

async function main() {
    const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS)

    // CREATE = hash(deployer, nonce)
    const sender = await hre.ethers.getCreateAddress({
        from: FACTORY_ADDRESS,
        nonce: FACTORY_NONCE,
    })
    console.log({ sender })
    // 0xCafac3dD18aC6c6e92c921884f9E4176737C052c

    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory")
    const [signer0] = await hre.ethers.getSigners()
    const address0 = await signer0.getAddress()
    const initCode = "0x"
    //     FACTORY_ADDRESS +
    //     AccountFactory.interface.encodeFunctionData("createAccount", [address0]).slice(2)
    // console.log(initCode)

    // await entryPoint.depositTo(PM_ADDRESS, {
    //     value: hre.ethers.parseEther("100"),
    // })

    const Account = await hre.ethers.getContractFactory("Account")

    const userOp = {
        sender: sender, // smart contract address
        nonce: await entryPoint.getNonce(sender, 0),
        initCode,
        callData: Account.interface.encodeFunctionData("execute"),
        callGasLimit: 200_000,
        verificationGasLimit: 200_000,
        preVerificationGas: 50_000,
        maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
        paymasterAndData: PM_ADDRESS,
        signature: "0x",
    }

    const tx = await entryPoint.handleOps([userOp], address0)
    const receipt = await tx.wait()
    console.log(receipt)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
