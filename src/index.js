var Web3          = require('web3');
const express     = require('express');
const app         = express();
const path        = require('path');
var parisContract = require('../build/contracts/Paris.json');

app.use(express.static(__dirname + '/public/'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const CONTRACT_ADDRESS = '0x39B16c46de5337c4dE37Ef9Daf17102A760104fa';

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));

app.get('/' , (req , res)=>{
    var reward = 0;

    var myContract = new web3.eth.Contract( parisContract.abi, CONTRACT_ADDRESS,  {
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

    var equipe1 = myContract.methods.getEquipe1().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((equipe1) => {
        return equipe1;
    })
    .catch((err) => {console.log(err);
    });

    var equipe2 = myContract.methods.getEquipe2().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((equipe2) => {
        return equipe2;
    })
    .catch((err) => {console.log(err);
    });

    var homePage = async () => {
        var rewardContract = await reward;
        var statusContract = await isClosed;
        var cote1Contract = await cote1;
        var cote2Contract = await cote2;
        var coteNulleContract = await coteNulle;
        var equipe1Contract = await equipe1;
        var equipe2Contract = await equipe2;
        
        
        return res.render('market', {
            contractName : parisContract.contractName, 
            reward: rewardContract, 
            marketIsClosed : statusContract,
            cote1 : cote1Contract,
            cote2 : cote2Contract,
            coteNulle : coteNulleContract,
            equipe1 : equipe1Contract,
            equipe2 : equipe2Contract,
            scoreEquipe1 : 0,
            scoreEquipe2 : 0,
        });
    };

    homePage();
});

app.post('/bet', (req, res) => {
 
    var privateKey = 'abf99e597cfecc57653608e0f9406adbae258ae6bb937f0f052211d2485f4d79';
    var myContract = new web3.eth.Contract( parisContract.abi, CONTRACT_ADDRESS,  {
        from: '0x61639B80171D8175760204636e3a56BdB931bdf6',
        gasPrice: '20000000000'
    });

    var userBet = req.body.userBet;
    var ether = req.body.ether;
    
    const transaction = myContract.methods.addBet(userBet);
    const options = {
        to      : transaction._parent._address,
        value : web3.utils.toWei(ether, 'ether'),
        data    : transaction.encodeABI(),
        gas : '1222220'
    };

    var calculateGas = async () => {
        var gas = await transaction.estimateGas({from: '0x61639B80171D8175760204636e3a56BdB931bdf6'});
        return gas;
    };

    var signTransac = async () => {
        const signed  = await web3.eth.accounts.signTransaction(options, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        console.log(receipt);
    };

    signTransac();
    return res.send('your bet has been added to blockchain');
});

app.get('/myBets', (req, res) => {
    var myContract = new web3.eth.Contract( parisContract.abi, CONTRACT_ADDRESS,  {
        from: '0x61639B80171D8175760204636e3a56BdB931bdf6',
        gasPrice: '20000000000'
    });
    var bets = myContract.methods.getBets().call({from : '0x61639B80171D8175760204636e3a56BdB931bdf6'})
    .then((bet) => {
        console.log(bet);
        //res.write(bet);
    })
    .catch((err) => {
        console.log(err);
    });    
});

app.get('/getResult', (req,res) => {
    var myContract = new web3.eth.Contract( parisContract.abi, CONTRACT_ADDRESS,  {
        from: '0x61639B80171D8175760204636e3a56BdB931bdf6',
        gasPrice: '20000000000'
    });

    myContract.methods.getResult().call({from : '0x61639B80171D8175760204636e3a56BdB931bdf6'})
    .then((winner) => {
        res.write(winner);
        res.end();
    })
    .catch((err) => {
        res.send({'result' :'event is not finished' });
        res.end();
    });
});

app.listen(8080, ()=>{
    console.log('server running on port 8080');
});

