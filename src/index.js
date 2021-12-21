const Web3          = require('web3');
const express       = require('express');
const path          = require('path');
const parisContract = require('../build/contracts/Paris.json');

const app = express();
app.use(express.static(__dirname + '/public/'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const CONTRACT_ADDRESS = '0x39B16c46de5337c4dE37Ef9Daf17102A760104fa';
const OWNER_ADDRESS = '0x6781EC56a01c4331d39a221B1A0b24003B709C13';

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));

const calculateGas = async (transaction, address) => {
    var gas = await transaction.estimateGas({from: address});
    return gas;
};

app.get('/' , (req , res)=>{
    var reward = 0;

    var myContract = new web3.eth.Contract( parisContract.abi, CONTRACT_ADDRESS,  {
        from: '0x61639B80171D8175760204636e3a56BdB931bdf6',
        gasPrice: '20000000000'
    });

    var homePage = async () => {
        var rewardContract = await myContract.methods.getTotalReward().call({from : OWNER_ADDRESS});
        var statusContract = await myContract.methods.marketIsClosed().call({from : OWNER_ADDRESS});
        var cote1Contract = await myContract.methods.getCote1().call({from : OWNER_ADDRESS});
        var cote2Contract = await myContract.methods.getCote2().call({from : OWNER_ADDRESS});
        var coteNulleContract = await myContract.methods.getCoteNulle().call({from : OWNER_ADDRESS});
        var equipe1Contract = await myContract.methods.getEquipe1().call({from : OWNER_ADDRESS});
        var equipe2Contract = await myContract.methods.getEquipe2().call({from : OWNER_ADDRESS});
        var butEquipe1Contract = await myContract.methods.getButsEquipe1().call({from : OWNER_ADDRESS});
        var butEquipe2Contract = await myContract.methods.getButsEquipe2().call({from : OWNER_ADDRESS});
        var statusMatchContract = await myContract.methods.getStatusMatch().call({from : OWNER_ADDRESS});
            
        return res.render('market', {
            contractName : parisContract.contractName, 
            reward: rewardContract, 
            marketIsClosed : statusContract,
            cote1 : cote1Contract,
            cote2 : cote2Contract,
            coteNulle : coteNulleContract,
            equipe1 : equipe1Contract,
            equipe2 : equipe2Contract,
            scoreEquipe1 : butEquipe1Contract,
            scoreEquipe2 : butEquipe2Contract,
            statusMatch : statusMatchContract,
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
    const gasCost = calculateGas(transaction,OWNER_ADDRESS);
    const options = {
        to      : transaction._parent._address,
        value : web3.utils.toWei(ether, 'ether'),
        data    : transaction.encodeABI(),
        gas : gasCost
    };

    const signTransac = async () => {
        const signed  = await web3.eth.accounts.signTransaction(options, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
        .then((receipt) => {
            return receipt;
        })
        .catch((error) => {
            console.error(error);
        })
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

app.listen(8080, ()=>{
    console.log('server running on port 8080');
});