const Dictionary = require('./Dictionary')
const Tokenizer = require('./Tokenizer')
const Normalizer = require('./Normalizer')

module.exports = class Champion {
    constructor(){
        this.Dictionary = new Dictionary
        this.Tokenizer = new Tokenizer
        this.Normalizer = new Normalizer

        this.prechampion = this.Dictionary.set_dictionary()
    }
    
    create_championlist(){

        let champion_list={}

        Object.values(this.prechampion).map((i,j)=>{
            
            const sortedArr = Object.entries(i).sort(([, v1], [, v2]) => v2 - v1)
            const sorted = Object.fromEntries(sortedArr)
            let keys = Object.keys(sorted)

            if(keys.length>80){
                for(let x=keys.length; x>2;x--){
                    delete sorted[keys[x]]
                }
            }

            champion_list[Object.keys(this.prechampion)[j]] = {}
            champion_list[Object.keys(this.prechampion)[j]] = sorted

        })

        //console.log(champion_list);
        return champion_list
    }
}