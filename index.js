let strategyType="Aggressive"; // or "Safe"

let observations = ['B','B','B','S','B','S','B','S','B','S'];

let randomProb=0.25;

const getProbability = (observations) => { 
    /*
    
    1     2    3    4   5    6    7   8     9
    
    1/5 8/45 7/45 2/15 1/9 4/45 1/15 2/45 1/45

    */
    
    let digitProb = [1/5, 8/45, 7/45, 2/15, 1/9, 4/45, 1/15, 2/45, 1/45];
    
    let alt=0.0; let same=0.0;
    for(let i=0;i<9;i++){
        if(observations[i]===observations[i+1]){
            same+=digitProb[i];
        }
        else{
            alt+=digitProb[i];
        }
    }
    return {same,alt};
}

obj = getProbability(observations);
console.log(obj.same,obj.alt)
