const Web3 = require("web3");


const verify_address = (address) => {
    if (Web3.utils.isAddress(address)) {
        return true;
    } else {
        return false;
    }
}
const getChuncks = async (web3, query) => {
    const last_block = await web3.eth.getBlockNumber();
    const chunk_size = query
    var chunks = [];
    for (var i = 0; i < last_block; i += chunk_size) {
        chunks.push({
            fromBlock: i,
            toBlock: i + chunk_size
        });
    }
    return chunks.reverse();
}
const info_worker = async (network, interface, address) => {
    try {
        const web3 = new Web3(network.rpc);
        const handler = new web3.eth.Contract(interface, address);
        return {
            name: await handler.methods.name().call(),
            symbol: await handler.methods.symbol().call(),
            decimals: await handler.methods.decimals().call(),
            totalSupply: await handler.methods.totalSupply().call(),
            address: address,
            success: true,
            network: network.name,
            chainId: network.chain
        }
    } catch (e) {
        return {
            address: address,
            success: false,
            network: network.name,
            chainId: network.chain
        }
    }
}
const transfers_worker = async (network, interface, address, utils) => {
    try {
        var started = new Date().getTime();
        const web3 = new Web3(network.rpc);
        const handler = new web3.eth.Contract(interface, address);
        const decimals = await handler.methods.decimals().call();
        const chunks = await getChuncks(web3, utils.query);
        const last_block = await web3.eth.getBlockNumber();
        const last_timestamp = await web3.eth.getBlock(last_block)
        const sample_data = await web3.eth.getBlock(last_block - utils.query)
        const last = {
            number: last_block,
            timestamp: last_timestamp.timestamp,
            sample: {
                number: last_block - utils.query,
                timestamp: sample_data.timestamp
            }
        };
        const first_timestamp = await web3.eth.getBlock(1)
        const first = {
            number: 0,
            timestamp: first_timestamp.timestamp
        }
        const block_time = (last.timestamp - last.sample.timestamp) / utils.query; // seconds
        var transfers = [];
        var transfers_ = [];
        var stop_chunk = chunks.length;
        for (var i = 0; i < stop_chunk; i++) {
            const chunk = chunks[i];
            const events_ = await handler.getPastEvents('Transfer', {
                fromBlock: chunk.fromBlock,
                toBlock: chunk.toBlock
            });
            transfers = transfers.concat(events_.map((event) => {
                return {
                    from: event.returnValues.from,
                    to: event.returnValues.to,
                    value: event.returnValues.value,
                    blockNumber: event.blockNumber,
                    blockTime: parseInt(last.timestamp - ((last.number - event.blockNumber) * block_time)),
                    receipt: event.transactionHash,
                    decimals: decimals
                }
            }));
            var status_ = ``;
            var deployed = ``;
            const loaded_percent = (last.number - chunk.fromBlock) / last.number * 100;
            const time_elapsed = parseInt(new Date().getTime() - started) / 1000;
            const estimated_time = parseInt(time_elapsed / loaded_percent * 100);
            const last_date = parseInt(last.timestamp - ((last.number - chunk.fromBlock) * block_time))
            const time_resume = `First Block ${new Date(first.timestamp * 1000).toLocaleDateString()} <== Last Processed Block ${new Date(last_date * 1000).toLocaleDateString()} ==> Last Block ${new Date(last.timestamp * 1000).toLocaleDateString()}`
            status_ = `Elapsed: ${utils.parsePeriod(time_elapsed)}\nEstimate: ${utils.parsePeriod(estimated_time)}\nParsed data between block ${chunk.fromBlock} and ${last.number} \nLoaded: ${parseFloat(loaded_percent).toFixed(3)}% of all ${network.name} \nFount ${transfers.length} transfers \nRemained blocks: ${chunk.toBlock}\n${time_resume}\n${deployed}`;
            console.clear();
            if (transfers.length > 0) {
                const last_loaded = transfers[transfers.length - 1];
                if (last_loaded.from === utils.zero) {
                    status_ += `\nContract created at block ${last_loaded.blockNumber}`;
                    deployed = `Contract created at block ${last_loaded.blockNumber}`;
                    if(stop_chunk == chunks.length) stop_chunk = i + utils.delay;   
                }
                status_ += `\nLast transfer: `;
                console.log(status_, last_loaded);
            } else {
                console.log(status_);
            }
            if (i > stop_chunk) break;
        }
        console.log("outside for")
        return {
            network: network.name,
            chainId: network.chain,
            address: address,
            transfers: transfers
        } 
    } catch (e) {
        console.log(e);
        return {
            network: network.name,
            chainId: network.chain,
            address: address,
            transfers: []
        }
    }
}
const token = {
    info: async (address, networks, interface) => {
        return Promise.all(networks.map((network) => {
            return info_worker(network, interface, address);
        }))
    },
    transfers: async (address, network, interface,utils) => {
        const transfers = await transfers_worker(network, interface, address, utils);
        return transfers;
    }
}
const network = {
    avgBlockTime: async (network) => {
        const web3 = new Web3(network.rpc);
        const last_block = await web3.eth.getBlockNumber();
        const first_block = last_block - 1000;
        const first_block_time = await web3.eth.getBlock(first_block);
        const last_block_time = await web3.eth.getBlock(last_block);
        const avg_block_time = (last_block_time.timestamp - first_block_time.timestamp) / 1000;
        return {
            network: network.name,
            chainId: network.chain,
            avgBlockTime: avg_block_time,
            last_block: last_block
        }
    }
}

module.exports = {
    verify_address,
    token,
    network
}