const Marks = require('./Marks')

module.exports = class Tokenizer {

    constructor(){
        this.Marks = new Marks
    }

    set_tokenizer(text){ 
        this.Marks.english_char.map(i => {
            text = text.replaceAll(i, "")
        })
        let word_list = this.split(text.trim().replaceAll("\n", " "), this.Marks.sep_list)
        return word_list
    }

    split(txt, seps){
        let default_sep = seps[0]
        let new_seps = seps.slice(1)
        new_seps.splice(1).map(sep => {
            txt = txt.replaceAll(sep, default_sep)
        })
        let words =[]
        txt.split(default_sep).map((rows,i) => {
            words[i] = rows
        })
        return words
    }

    
}
