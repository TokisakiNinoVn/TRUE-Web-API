const JsBarcode = require("jsbarcode");
const { createCanvas } = require("canvas");

function generateBarCode(data) {
  const canvas = createCanvas();
  JsBarcode(canvas, data, { width: 2, height: 120, displayValue: false });
  return canvas.toDataURL("image/png");
}

module.exports = {
    generateBarCode
  };
