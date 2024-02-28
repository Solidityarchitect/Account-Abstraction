const hre = require("hardhat")

async function main() {
    const [sign0] = await hre.ethers.getSigners()
    const signature = sign0.signMessage(hre.ethers.getBytes(hre.ethers.id("wee")))

    const Test = await hre.ethers.getContractFactory("Test")
    const test = await Test.deploy(signature)

    console.log("address0", await sign0.getAddress())
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
