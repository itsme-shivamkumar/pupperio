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
    balance : 99.00,
    loss : 0.0,
    amnt : 1.0,
    denominations : parseInt(Math.round(parseFloat(this.balance/100.00))),
}

const getNextAmount = (observations, selectedVal,ledger) => {
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

const updateObservation = (observations,actualVal) => {
    observations.pop();
    observations.unshift(actualVal);
}


for(let i=0; i<5;i++){
    console.log("BALANCE -> ", ledger.balance);
    let selectedVal = finalPrediction(observations); 
    let actualVal = ['B','S'][Math.round(Math.random())];
    console.log("YOU SELECTED -> ", selectedVal);
    console.log("CAME -> ", actualVal);
    console.log((selectedVal == actualVal)?"WON":"LOSE");
    updateObservation(observations, actualVal);
    console.log("NEXT AMOUNT -> ", getNextAmount(observations,selectedVal,ledger));    
}































































































// let strategyType="Aggressive"; // or "Safe"

// let observations = ['S','S','S','S','B','S','B','B','B','S'];

// let randomProb=0.25;

// const getProbability = (observations) => { 
//     /*
    
//     1     2    3    4   5    6    7   8     9
    
//     1/5 8/45 7/45 2/15 1/9 4/45 1/15 2/45 1/45

//     */
    
//     let digitProb = [1/5, 8/45, 7/45, 2/15, 1/9, 4/45, 1/15, 2/45, 1/45];
    
//     let alt=0.0; let same=0.0;
//     for(let i=0;i<9;i++){
//         if(observations[i]===observations[i+1]){
//             same+=digitProb[i];
//         }
//         else{
//             alt+=digitProb[i];
//         }
//     }
//     return {same,alt};
// }

// const getIntuition = (observations) => {
//     let same =1;
//     let alt = 1;
//     for(let i =0; i<observations.length;i++){
//         if(observations[i]==observations[i+1]){
//             while(i<observations.length -1 && observations[i]==observations[i+1]){
//                 same++;
//                 i++;
//             }
//             break;
//         }
//         else{
//             while(i<observations.length-1 && observations[i]!=observations[i+1]){
//                 alt++;
//                 i++;
//             }
//             break;
//         }
//     }
//     if(same>alt){
//         return observations[0];
//     }
//     else return (observations[0]=='S')?'B':'S';
// }


// prediction = getIntuition(observations);
// console.log("LOG: TAKE->",prediction)
// // if(prediction.same>prediction.alt){
// //     console.log("Take: ",observations[0]);
// // }
// // else{
// //     console.log("Take: ",(observations[0]==='B')?'S':'B');
// // }