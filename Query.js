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

        //this.dictionary = this.Dictionary.set_dictionary()
    }
    
    one_word_query(query) {
        let query_normal = []
        query_normal = this.Normalizer.set_normalizer([query])
        //onsole.log(query_normal);
        Object.keys(this.dictionary).map((rows,key) => {
            if (rows == query_normal) {
                for (let i = 0; i < Object.keys(this.dictionary[rows]).length-1; i++) {
                    console.log(this.Dictionary.docs_title[Object.keys(this.dictionary[rows])[i]-1])
                }
            }
        })
    }

    multi_word_query(query){
        let query_normal = []
        let query_token = []
        query_token = this.Tokenizer.set_tokenizer(query)
        query_normal = this.Normalizer.set_normalizer(query_token)
        //console.log(query_normal);
        let postings = []
        Object.keys(this.dictionary).map((rows,key) => {
            query_normal.map(token => {
                if (rows==token) {
                    postings.push(this.dictionary[rows])
                }
            })
        })
        //console.log(postings);
        let reserve = []
        let r = 0
        postings.map((word,key) => {
            for ( let i = 0; i < Object.keys(postings[key]).length-1; i++) {
                let posting_key = Object.keys(postings[key])[i]
                if(!reserve.includes(posting_key)) {
                    reserve[r] = posting_key
                    r++
                }
            }
        })
        this.check_position(postings,reserve)
    }

    check_position(postings, reserve){
        let positions = {}
        reserve.map(docid => {
            let total = []
            postings.map((word,key) => {
                if (Object.keys(word).includes(docid)) {
                    let pos = Object.values(word[docid])
                    pos.pop()
                    total = total.concat(pos)
                    positions[docid] = []
                    positions[docid] = positions[docid].concat(total)
                }
            })
        })
        let title2 = []
        Object.keys(positions).map(docid => {
            positions[docid].sort()
            // console.log(positions[docid]);
            let flag = true
            if (positions[docid].length == 1) {
                flag = false
            }
            for (let i = positions[docid].length-1 ; i >=1 ; i--) {
                if(positions[docid][i] - positions[docid][i-1] != 1){
                    // console.log(positions[docid][i],positions[docid][i-1]);
                    flag = false
                }  
            }
            if(flag){
                //Olaviat bala
                console.log(this.Dictionary.docs_title[docid-1])
            }else{
                //Olaviat Kam
                title2.push(docid)

            }
        })

        title2.map(docid => {
            console.log(this.Dictionary.docs_title[docid-1])
        })
        //console.log(positions);
    }

    kind_query(query){
        query.split(' ').length==1 ? this.one_word_query(query) : this.multi_word_query(query)
    }

    split_query(query){

        let champion_list = this.Champion.create_championlist()
        let query_normal = []
        let query_token = []
        let weights = {}

        query_token = this.Tokenizer.set_tokenizer(query)
        query_normal = this.Normalizer.set_normalizer(query_token)
        
        query_token.map(tokenq => {
            
            var count = query_token.filter((v) => (v === tokenq)).length
            let wt = 1 + Math.log10(count)
            console.log('wt: ',wt);

            Object.keys(champion_list).map((tokend,key) => {

                if (tokend==tokenq) {
                    console.log();
                    Object.keys(champion_list[tokend]).map((doc,index)=>{

                        if(!weights[doc]){
                            weights[doc] = champion_list[tokend][doc]*wt
                        }else{
                            weights[doc] = parseFloat(((champion_list[tokend][doc]*wt)+weights[doc]).toFixed(2))
                        }
                    
                    })
                }
            })
        })
        console.log(weights);
    }
}