
  const  roundQuantity= (job, quantity) => {
    if(job == 'PT' && quantity >0){
      return quantity+ ' ml ~ '+(quantity/1000).toFixed(2) +' lít';
    }
    if(job == 'BP' && quantity >0){
      return quantity+ ' kg ~ '+(quantity/25).toFixed() +' bao';
    }
    if(job == 'HC' && quantity >0){
      return quantity+' kg';
    }
  }

  module.exports = {
    roundQuantity
  };