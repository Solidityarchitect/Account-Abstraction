const hre = require("hardhat")

const ACCOUNT_ADDRESS = "0x61c36a8d610163660E21a8b7359e1Cac0C9133e1"
const EP_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F"
const PM_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"

async function main() {
    const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS)
    const count = await account.count()

    //   const code = await hre.ethers.provider.getCode(EP_ADDR);
    console.log(count)

    console.log("account balance", await hre.ethers.provider.getBalance(ACCOUNT_ADDRESS))

    const ep = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS)
    console.log("account balance on EP", await ep.balanceOf(ACCOUNT_ADDRESS))
    console.log("paymaster balance on EP", await ep.balanceOf(PM_ADDRESS))
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
