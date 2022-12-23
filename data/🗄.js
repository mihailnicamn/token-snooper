const fileHandler = {
    read: (file) => {
        return JSON.parse(require("fs").readFileSync(`${file}.json`));
    },
    write: (file, data) => {
        require("fs").writeFileSync(`${file}.json`, JSON.stringify(data));
    },
    exists: (file) => {
        return require("fs").existsSync(`${file}.json`);
    },
    rawRead: (file,format) => {
        return require("fs").readFileSync(`${file}`,format);
    },
    rawWrite: (file, data) => {
        require("fs").writeFileSync(`${file}`, data);
    },
}
const directives = {
    registry: `./data/registry`,
    networks: `./data/networks`,
    interfaces: `./data/interfaces`,
    archive: `./data/archive`,
    report: `./data/report`
}

const data = {
    archive: {
        get: (token) => {
            const data = fileHandler.read(directives.archive);
            return data[token];
        },
        set: (token, data) => {
            const _data = fileHandler.read(directives.archive);
            _data[token] = data;
            fileHandler.write(directives.archive, _data);
            return data;
        },
        update: (token, data) => {
            const _data = fileHandler.read(directives.archive);
            _data[token] = data;
            fileHandler.write(directives.archive, _data);
        }
    },
    interfaces: {
        get : (name) => {
            const data = fileHandler.read(directives.interfaces);
            return data[name];
        },
        set : (name, abi) => {
            var data = fileHandler.read(directives.interfaces);
            data[name] = abi;
            fileHandler.write(directives.interfaces, data);
        }
    },
    networks: {
        mainnet: (network = null )=>{
            if(network != null) return {
                ...fileHandler.read(directives.networks)[network].mainnet,
                name: network
            };
            const data = fileHandler.read(directives.networks);
            var networks = [];
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'object' && value.hasOwnProperty('mainnet')) {
                    networks.push({
                        chain: value.mainnet.chainId,
                        rpc: value.mainnet.rpc,
                        name: key
                    })
                }
            }
            return networks;
        }
    },
    registry: {
        init: (token) => {
            var continue_ = true;
            if (!fileHandler.exists(directives.registry)) fileHandler.write(directives.registry, { tokens: [] });
            const _data = fileHandler.read(directives.registry);
            _data.tokens.forEach((t) => {
                if (t.address == token) continue_ = false;
            });
            if (!continue_) {
                console.log("Token already exists in registry");
                return;
            } else {
                _data.tokens.push({
                    address: token
                });
                fileHandler.write(directives.registry, _data);
                console.log("Token added to registry")
            }
        },
        update: (token, data) => {
            if (!fileHandler.exists(directives.registry)) fileHandler.write(directives.registry, { tokens: [] });
            var _data = fileHandler.read(directives.registry);
            _data.tokens.forEach((t,i) => {
                if (t.address == token) _data.tokens[i] = data; console.log("Token updated in registry", data);
            });
            fileHandler.write(directives.registry, _data);
        },
        get: (token) => {
            if (!fileHandler.exists(directives.registry)) fileHandler.write(directives.registry, { tokens: [] });
            const _data = fileHandler.read(directives.registry);
            return _data.tokens.filter((t) =>  t.address == token);
        },
        all: () => {
            if (!fileHandler.exists(directives.registry)) fileHandler.write(directives.registry, { tokens: [] });
            const _data = fileHandler.read(directives.registry);
            return _data.tokens;
        }
    },
    report : {
        get: (token) => {
            console.log(token)
            token.forEach((t) => {
            const html = fileHandler.rawRead(`${directives.report}/index.html`, "utf8");
            console.log(html)
            console.log(t)
            const _ = html.replaceAll("{{ARCHIVE_DATA}}" , JSON.stringify(t));
            fileHandler.rawWrite(`./${t.network}:${t.address}.html`, _);
            });
        },
    }
}

module.exports = data;