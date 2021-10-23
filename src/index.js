var Web3          = require('web3');
const express     = require('express');
const app         = express();
const path        = require('path');
var parisContract = require('../build/contracts/Paris.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'))

app.get('/' , (req , res)=>{
    var reward = 0;
    var marketIsClosed = false;
    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));
    
    var myContract = new web3.eth.Contract( parisContract.abi, '0x39B16c46de5337c4dE37Ef9Daf17102A760104fa',  {
        from: '0x61639B80171D8175760204636e3a56BdB931bdf6',
        gasPrice: '20000000000'
    });

    var remoteContract = [];
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

    var cotes = myContract.methods.getCote1().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((cotes) => {
        return cotes;
    })
    .catch((err) => {console.log(err);
    });


    var homePage = async () => {
        var rewardContract = await reward;
        var statusContract = await isClosed;
        var cotesContract = await cotes;
        
        return res.render('market', {
            contractName : parisContract.contractName, 
            reward: rewardContract, 
            marketIsClosed : statusContract,
            cote1 : remoteContract.cote1,
            cote2 : remoteContract.cote2,
            coteNulle : cotesContract
        });
    };

    homePage();
});

app.listen(8080, ()=>{
    console.log('server running on port 8080');
});

