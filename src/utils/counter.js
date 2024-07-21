const {Counter} = require('@app/models');


async function getInvoiceCode(){
    let counter = await Counter.findOne({}).lean();
    if(!counter){
        return "";
    }
    counter.invoice += 1;
    await Counter.findByIdAndUpdate(counter._id, counter, {new: true, runValidators: true});
    return process.env.PREFIX_INVOICE + String(counter.invoice).padStart(6, '0');
}

async function getCustomerCode(){
    let counter = await Counter.findOne({}).lean();
    if(!counter){
        return "";
    }
    counter.customer += 1;
    await Counter.findByIdAndUpdate(counter._id, counter, {new: true, runValidators: true});
    return process.env.PREFIX_CUSTOMER + String(counter.customer).padStart(6, '0');
}

module.exports = {
    getInvoiceCode,
    getCustomerCode
  }