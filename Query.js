const Dictionary = require('./Dictionary')
const Tokenizer = require('./Tokenizer')
const Normalizer = require('./Normalizer')
const Champion = require('./Champion')

module.exports = class Query {
    
    constructor(){
        this.Dictionary = new Dictionary
        this.Tokenizer = new Tokenizer
        this.Normalizer = new Normalizer
        this.Champion = new Champion
    }

    split_query(query){

        let champion_list = this.Champion.create_championlist()
        let query_normal = []
        let query_token = []
        let score = {}
        let sorted_docs = {}

        query_token = this.Tokenizer.set_tokenizer(query)
        query_normal = this.Normalizer.set_normalizer(query_token)
        
        query_token.map(tokenq => {
            
            var count = query_token.filter((v) => (v === tokenq)).length
            let wt = 1 + Math.log10(count)

            Object.keys(champion_list).map((tokend,key) => {

                if (tokend==tokenq) {
                    console.log();
                    Object.keys(champion_list[tokend]).map((doc,index)=>{

                        if(!score[doc]){
                            score[doc] = champion_list[tokend][doc]*wt
                        }else{
                            score[doc] = parseFloat(((champion_list[tokend][doc]*wt)+score[doc]).toFixed(2))
                        }
                    
                    })
                }
            })
        })

        Object.keys(score).map(doc => {
            let docid = parseFloat(doc.match(/\d+/g));
            score[doc] = parseFloat((score[doc]/this.Dictionary.contents[docid-1].length).toFixed(5))
            const sortedArr = Object.entries(score).sort(([, v1], [, v2]) => v2 - v1)
            sorted_docs = Object.fromEntries(sortedArr)
        })
        
        Object.keys(sorted_docs).map((doc,index) => {
            let docid = parseFloat(doc.match(/\d+/g));
            if(index<10){
                console.log(this.Dictionary.docs_title[docid-1]);
            }
        })
    }
}