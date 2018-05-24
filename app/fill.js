/**
 * app/fill.js
 * fills a templated string with data
 * @param {string} template - use ${THIS} format for placeholders 
 * @param {Object} data - properties of this object match with the placeholder names: data.THIS = "that"
 */
function fill(template, data){
  let r = /\${(.+?)}/gm,
      match;
  while(match = r.exec(template)){
    template = template.substring(0, match.index) + data[match[1]] + template.substring(match.index + match[0].length);
  }
  return template;
}

module.exports = fill;