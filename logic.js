const opposite = (val) => {
    if(val == 'B') return 'S';
    else return 'B';
}

let observations = ['B','S','B','B','B','S','B','B','B','S'];

const finalPrediction = (observations) => {
    let same = 1; let diff = 0;
    for(let i=0;i<observations.length-1;i++){
        if(observations[i]==observations[i+1]){
            while(i<observations.length-1 && observations[i] == observations[i+1]){
                i++;
                same++;
            }
            break;
        }
        else{
            while(i<observations.length-1 && observations[i] != observations[i+1]){
                i++;
                diff++;
            }
            break;
        }
    }
    if(same >3){
        return opposite(observations[0]);
    }
    if(diff >=3 && diff < 6){
        return opposite(observations[0]); 
    }
    if(diff >=6) return observations[0];

    return ['B','S'][Math.round(Math.random())];
}

let ledger = {
    count: 0,
    balance : 100.00,
    loss : 0.0,
    amnt : 1.0,
    denominations :1.0,
    minBal: 1000000000000.0,
    maxBal: 0.0,
}

const getNextAmount = (observations, selectedVal,ledger) => {
    ledger.count += 1;
    if(selectedVal===observations[0]){
        ledger.balance+= ledger.amnt*1.96;
        console.log("balance became -> ", ledger.balance)
        ledger.loss = 0.0;
        ledger.amnt = parseFloat(ledger.denominations);
        console.log(ledger.amnt);
        ledger.balance-=Math.round(ledger.amnt);
        console.log(ledger.balance);
        return Math.round(ledger.amnt);
    }
    else{
        ledger.loss += ledger.amnt;
        ledger.balance-= 1.0*Math.round(ledger.amnt);
        console.log("balance became -> ", ledger.balance)
        if(ledger.amnt == ledger.denominations){
            ledger.amnt = 1.0*(ledger.amnt+2);
            ledger.balance-= 1.0*Math.round(ledger.amnt);

            return Math.round(ledger.amnt);
        }
        else{
            ledger.amnt = (ledger.loss*2.0);
            ledger.balance-= 1.0*Math.round(ledger.amnt);
            return Math.round(ledger.amnt);
        }
    }
}



const updateObservation = (observations,newVal) => {
    observations.pop();
    observations.unshift(newVal);
}

const play = (observations, ledger, predictedVal) => {
    ledger.count+=1;
    if(predictedVal == observations[0]){
        ledger.balance += parseFloat(Math.round(ledger.amnt)*1.92);
        ledger.loss = 0.00;
        ledger.amnt = parseFloat(ledger.denominations);
        
    }
    else{
        ledger.balance -= parseFloat(Math.round(ledger.amnt));
        ledger.loss += parseFloat(Math.round(ledger.amnt));
        ledger.amnt = (ledger.count ==  1) ? parseFloat(ledger.denominations * 1.92): parseFloat(ledger.amnt * 1.92);
    }
}


for(let i=0; i<50;i++){
    console.log("BALANCE REFRESHED -> ", ledger.balance);
    
    ledger.minBal=Math.min(ledger.minBal,ledger.balance);
    ledger.maxBal=Math.max(ledger.maxBal,ledger.balance);

    console.log("PREVIOUS OBSERVATIONS: ", observations);
    let predictedVal = finalPrediction(observations); 
    let actualVal = ['B','S'][Math.round(Math.random())];
    console.log("YOU SELECTED -> ", predictedVal," ACTUAL -> ", actualVal);
    console.log(`You put ${Math.round(ledger.amnt)} rupees in the lot.`)
    console.log((predictedVal == actualVal)? `You won ${Math.round(ledger.amnt)*1.92} rupees` : `You lost ${Math.round(ledger.amnt)} rupees`);
    updateObservation(observations, actualVal);
    play(observations,ledger,predictedVal);
    console.log("YOUR BALANCE, BECAME -> ", ledger.balance);
    console.log()
}
console.log("Min bal-> ", ledger.minBal, " Max Bal-> ", ledger.maxBal)