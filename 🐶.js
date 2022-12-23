const networks = require("./🔗.js");
const utils = require("./utils.js");
const data = require("./data/🗄.js");
async function run (token) {
    console.log("running", token)
    const transfers_data = await networks.token.transfers(token.address, data.networks.mainnet(token.network), data.interfaces.get("ERC20"),utils);
    return data.archive.set(token.address, transfers_data);
}
const load = async () => {
    if (!networks.verify_address(utils.args().address)) throw Error("Invalid address");
    data.registry.init(utils.args().address);
    const tokenInfo = await networks.token.info(utils.args().address, data.networks.mainnet(), data.interfaces.get("ERC20"));
     tokenInfo.filter((t) => t.success == true).forEach((t) => {
        data.registry.update(utils.args().address, t);
    });
    const transfers_ = await data.registry.get(utils.args().address).map(async (token) => {
        return await run(token);
    });
    const transfers = await Promise.all(transfers_);
    console.log("transfers", transfers)
    data.report.get(transfers);
}
const update = async () => {
    console.log("updating info on", data.registry.all())
    data.networks.mainnet().forEach(async (network) => {
        try {
            const blocks = await networks.network.avgBlockTime(network);
            const blocks_per_day = parseInt(86400 / blocks.avgBlockTime);
            const blocks_since_yesterday = blocks.last_block - blocks_per_day;
            console.log("last block yesterday", blocks_since_yesterday, "last block today", blocks.last_block, "blocks per day", blocks_per_day);
        } catch (e) {
        }
    });
}
const report = async () => {
    const address = utils.args().address;
    if(!address) throw Error("No address provided");
    const data = data.registry.get(address);
}
(async () => {
    if (utils.args().method == "load") await load();
    if (utils.args().method == "update") await update();
    if (utils.args().method == "report") await report();
})();

