const Dictionary = require('./Dictionary')
const Tokenizer = require('./Tokenizer')
const Normalizer = require('./Normalizer')

module.exports = class Champion {
    constructor(){
        this.Dictionary = new Dictionary
        this.Tokenizer = new Tokenizer
        this.Normalizer = new Normalizer

        this.dictionary = this.Dictionary.set_dictionary()
    }
    
    create_championlist(){
        //console.log(this.dictionary);
    }
}