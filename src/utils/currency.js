function formatCurrency(x) {
  x = x.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
  return x;
}

module.exports = {
  formatCurrency
}