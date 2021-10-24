var Web3          = require('web3');
const express     = require('express');
const app         = express();
const path        = require('path');
var Tx = require('@ethereumjs/tx').Transaction;
var parisContract = require('../build/contracts/Paris.json');

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'))

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));

app.get('/' , (req , res)=>{
    var reward = 0;
    var marketIsClosed = false;

    var myContract = new web3.eth.Contract( parisContract.abi, '0x39B16c46de5337c4dE37Ef9Daf17102A760104fa',  {
        from: '0x61639B80171D8175760204636e3a56BdB931bdf6',
        gasPrice: '20000000000'
    });

    var reward = myContract.methods.getTotalReward().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((reward) => {
       return web3.utils.fromWei(reward, 'ether');
    })
    .catch((err) => {
        console.log(err);
    });
    
    var isClosed = myContract.methods.marketIsClosed().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((isClosed) => {
        return isClosed;
    })
    .catch((err) => {
        console.log(err);
    });

    var cote1 =  myContract.methods.getCote1().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((cote1) => {
        return cote1;
    })
    .catch((err) => {console.log(err);
    });

    var cote2 =  myContract.methods.getCote2().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((cote1) => {
        return cote1;
    })
    .catch((err) => {console.log(err);
    });

    var coteNulle =  myContract.methods.getCoteNulle().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((coteNulle) => {
        return coteNulle;
    })
    .catch((err) => {console.log(err);
    });

    var homePage = async () => {
        var rewardContract = await reward;
        var statusContract = await isClosed;
        var cote1Contract = await cote1;
        var cote2Contract = await cote2;
        var coteNulleContract = await coteNulle;
        
        return res.render('market', {
            contractName : parisContract.contractName, 
            reward: rewardContract, 
            marketIsClosed : statusContract,
            cote1 : cote1Contract,
            cote2 : cote2Contract,
            coteNulle : coteNulleContract
        });
    };

    homePage();
});

app.post('/bet', (req, res) => {
    var privateKey = 'abf99e597cfecc57653608e0f9406adbae258ae6bb937f0f052211d2485f4d79';
    var myContract = new web3.eth.Contract( parisContract.abi, '0x39B16c46de5337c4dE37Ef9Daf17102A760104fa',  {
        from: '0x61639B80171D8175760204636e3a56BdB931bdf6',
        gasPrice: '20000000000'
    });

    const transaction = myContract.methods.addBet(1);
    const options = {
        to      : transaction._parent._address,
        value : web3.utils.toWei('10', 'ether'),
        data    : transaction.encodeABI(),
        gas : '1222220'
    };

    var calculateGas = async () => {
        var gas = await transaction.estimateGas({from: '0x61639B80171D8175760204636e3a56BdB931bdf6'})
        return gas;
    };

    var signTransac = async () => {
        const signed  = await web3.eth.accounts.signTransaction(options, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        console.log(receipt);
    };

    signTransac();
});

app.listen(8080, ()=>{
    console.log('server running on port 8080');
});

