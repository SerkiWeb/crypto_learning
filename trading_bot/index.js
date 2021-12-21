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

const getAllTokens = async (market) => {

    const btcHistory = await getTokenHistory('BTC/USDT', market);
    const ethHistory = await getTokenHistory('ETH/USDT', market);
    const solHistory = await getTokenHistory('SOL/USDT', market);
    const bnbHistory = await getTokenHistory('BNB/USDT', market);
    const adaHistory = await getTokenHistory('ADA/USDT', market);
    const lunaHistory = await getTokenHistory('LUNA/USDT', market);
    const dotHistory = await getTokenHistory('DOT/USDT', market);
    return {
        dates : btcHistory.dates,
        tokens : 
        [
            {
                name : 'ethereum', 
                allTimeHigh : ethHistory.ath,
                weeklyVariation : ethHistory.history,
            },
            { 
                name : 'bitcoin',
                allTimeHigh : btcHistory.ath,
                weeklyVariation : btcHistory.history,
            },
            {
                name : 'solana',
                allTimeHigh : solHistory.ath,
                weeklyVariation : solHistory.history,
            },
            {
                name :'binance coin',
                allTimeHigh : bnbHistory.ath,
                weeklyVariation : bnbHistory.history,
            },
            {
                name :'ada',
                allTimeHigh : adaHistory.ath,
                weeklyVariation : adaHistory.history,
            },
            {
                name :'luna',
                allTimeHigh : lunaHistory.ath,
                weeklyVariation : lunaHistory.history,
            },
            {
                name :'polkadot',
                allTimeHigh : dotHistory.ath,
                weeklyVariation : dotHistory.history,
            },
        ] 
    };
}

const getTokenHistory = async (token, market) => {

    const tokenOHLCV = await market.fetchOHLCV (token, '1w');
    tokenHistory = modifyHistory(tokenOHLCV);
    tokenHistory.history.forEach((week)=> {
        week.variation = (((week.close - week.open)/week.open) * 100).toFixed(2);
    });

    return tokenHistory;
}

const modifyHistory = (prices) => {
    const history = [];
    const ath = {
        date : 0,
        value : 0,
    };
    
    prices.forEach((week) => {
        tokenPrices = {
            date  : getFrDate(new Date(week[0])),
            open  : week[1],
            high  : week[2],
            low   : week[3],
            close : week[4],
        }

        if (tokenPrices.close >= ath.value) {
            ath.value = tokenPrices.close;
            ath.date  = tokenPrices.date;
        }
        
        history.push(tokenPrices);
    });
    history.sort((a,b) => {return a - b});
    const dates = history.map((week) => {
        return week.date;
    })
    return {dates:dates, ath:ath, history:history };
}

const getFrDate = (date) => {
    return (date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear());
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
     //console.log(btcHistory);
     //console.log(ethHistory);    
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

app.get('/allToken', (req, res) => {
    const market = new ccxt.binance();
    getAllTokens(market)
    .then((result) => {
        console.log("result !!!!!!!!!!!!!!!!!!!!!!!")
        console.log(result);
        return res.render('stats.ejs',{
            result : result
        });
    })
});

app.listen(8080, () => {
    console.log('server running on port 8080');
});