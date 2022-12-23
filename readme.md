draft of token snooper 🐶

parse relevant statistics : 
- number of new addreses on timeseries (each spike without catalyst (airdrop/release/anything) may show fake addreses)
- number of in-and-out addresses on timeseries (each spike without catalyst may show wash trading done with burner addresses)
- number of transactions on timeseries (relative activity of token)
- if easy solution 😅, https://observablehq.com/@d3/collapsible-tree tree structure view with the ability to replay the transactions (to get common sens about the tokens general activity)
- tag addreses (swaps/vaults/launchpads) using web3.js directly or even using etherscan/networks blockexplorers with api
- test if "buyable"/transferable to identify honeypots


working at the moment :
- load all token transactions from blockchain using web3.js (any compatible evm blockchain) little slow including the query limit of 3000-5000 depending on the blockchain customizable within config.json, it stops on first block that has transaction from coinbase (null adress/zero address, common the deployment block) with the delay from config.json
- generate html report with transactions and addresses


``` npm start load <token_address> ```

``` npm start load 0xdac17f958d2ee523a2206206994597c13d831ec7 ``` # usdt on ethereum (if you got spare time 😅)


toTest: 
- try running custom local node with custom config (workaround for the query limit, it may result in near instant data retrieving)


final toughts : that's an old idea trying to identify the legitimacy of an token, meanwhile the best solution seems to be https://gitcoin.co/hackathon/ethshanghai/projects/15416/scam-sniffer/activity? https://scamsniffer.io/ [not tested, i dont even know what compatible networks are, with time it'll become the standard ref (it's the adblock of web3)]
