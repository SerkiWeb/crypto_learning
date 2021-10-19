var http = require('http');
var url = require('url');
var Web3  = require('web3');
var parisContract = require('../build/contracts/Paris.json');

http.createServer(function (req, res) {
    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));
    var myContract = new web3.eth.Contract( parisContract.abi, '0x39B16c46de5337c4dE37Ef9Daf17102A760104fa',  {
        from: '0x1234567890123456789012345678901234567891', // default from address
        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    });
    myContract.methods.getTotalReward().send({from : '0x61639B80171D8175760204636e3a56BdB931bdf6'})
    .then(console.log)
    .catch((err) =>
        console.log(err)
    );
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(req.url);
    res.end();
}).listen(8080);