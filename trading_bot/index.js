const axios   = require('axios').default;
const path    = require('path');
const express = require('express');
const ccxt    = require('ccxt');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public/'));
app.set('views', path.join(__dirname, 'views/'));

var btcHistory = [];
var ethHistory = [];
var imbalanceHistory = [];
const INDEX_QUANTITY = 1;
const INDEX_VALUE = 0;  

const updateHistory = (arr, value) => {
    if (arr.indexOf(value) == -1) {
        arr.push(value);

        return true;
    }

    return false;
}

const getLastVariation = (arr) => {
    const length = arr.length;  

    if (length >= 2) {
        var result = ((arr[length - 1] -arr[length - 2]) /  arr[length - 2]) * 100;
        return result;
    }

    return 0;
}

const run = async () => {
    console.log('fetching bitcoin prices ...');
    const results = await Promise.all([
        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=USD'),
        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD'),
    ]);
    console.log("bitcoin prices are fetched !");
    return {bitcoin : results[0].data.bitcoin.usd, ether : results[1].data.ethereum.usd};
};

const priceDetail = async (market) => {

    var orderbook = await market.fetch_order_book('BTC/USDT');
    console.log(orderbook);

    const minBid = orderbook.bids[0][INDEX_VALUE];
    const qtqminBid = orderbook.bids[0][INDEX_QUANTITY];
    const minAsk = orderbook.asks[0][INDEX_VALUE];
    const qtqMinAsk = orderbook.asks[0][INDEX_QUANTITY];
    
    return { 
        bid : { 
            price : minBid, 
            quantity : qtqminBid
        }, 
        ask : {
            price : minAsk,
            quantity : qtqMinAsk
        },
        spread : (minAsk - minBid)
    };
}

const getAllMarkets = async () => {
    var markets  = ccxt.markets;

    
}

const accumulation = async (market) => {

    var orderbook = await market.fetch_order_book('BTC/USDT');

    var sellers = orderbook.asks.reduce((acc, val) => {
        return acc + parseFloat(val[INDEX_QUANTITY]);
    }, 0);

    var buyers = orderbook.bids.reduce((acc, val) => {
        return acc + val[INDEX_QUANTITY];
    }, 0);

    const VolB = orderbook.bids[0][INDEX_QUANTITY];
    const VolA = orderbook.asks[0][INDEX_QUANTITY];
    const imb = (VolB - VolA) / (VolB + VolA);

    imbalanceHistory.push(imb);

    return {'buyers' : buyers, 'sellers' : sellers, 'imbalance' : imb}
}

const findResitance = async (market) => {
    var orderbook = await market.fetch_order_book('BTC/USDT');
    var resistances = [];
    var supports = [];
    var sellers = orderbook.asks;
    var buyers = orderbook.bids;

    return { 
        supports : SupportResistance(buyers, supports, 10),
        resistances : SupportResistance(sellers, resistances, 10),
    }
}

const SupportResistance = (orderbook, resultArray, size) => {
    var i=0;
    while (i<orderbook.length) {
        var referenceValue = Math.round(orderbook[i][INDEX_VALUE]);
        var j=i;
        while (j<orderbook.length && (Math.abs(orderbook[j][INDEX_VALUE] - referenceValue) < size)) {
            
            var indexRes = resultArray.findIndex((value) => {
                return value.ref == referenceValue;
            })

            if (indexRes == -1) {
                resultArray.push({
                    ref : referenceValue,
                    quantity : orderbook[j][INDEX_QUANTITY],
                    last : 0,
                });
            } else {
                resultArray[indexRes].quantity += orderbook[j][INDEX_QUANTITY];
                resultArray[indexRes].last = orderbook[j][INDEX_VALUE];
            }

            j++;
        }

        i=j;
    }

    return resultArray;
};

app.get('/', (req, res) => {

    run()
    .then(({bitcoin, ether}) => {
        console.log({bitcoin, ether});
        
        updateHistory(btcHistory, bitcoin);
        updateHistory(ethHistory, ether);
       
        return res.render('index', {
            bitcoin : bitcoin,
            ethereum : ether,
            variationBtc : getLastVariation(btcHistory),
            variationEth : getLastVariation(ethHistory), 
        });
     })
     .catch((err) => {
        res.write("error market not available");
     });
     console.log(btcHistory);
     console.log(ethHistory);    
});

app.get('/markets', (req,res) => {
    const binance = new ccxt.binance();
    priceDetail(binance)
    .then((price) => {
        return res.render('price', {
            bid : price.bid,
            ask : price.ask,
            spread : price.spread
        });
    });
});

app.get('/force', (req, res) => {
    const market = new ccxt.binance();
    accumulation(market)
    .then((data) => {
        //console.log(data);
        return res.render('buyVSsell', {
            buyers : data.buyers,
            sellers : data.sellers,
            imbalance : data.imbalance,
        })
    });
});

app.get('/resistance', (req, res) => {
    const market = new ccxt.binance();
    findResitance(market)
    .then((allData) => {
        //console.log(allData);
        return res.render('resistance.ejs', {
            resistances : allData.resistances,
            supports : allData.supports,
        });
    });
});

app.listen(8080, () => {
    console.log('server running on port 8080');
});