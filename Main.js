const readline = require("readline");

const Marks = require('./Marks')
const Regex = require('./Regex')
const Verbs = require('./Verbs')
const Dictionary = require('./Dictionary')
const Tokenizer = require('./Tokenizer')
const Normalizer = require('./Normalizer')
const Query = require('./Query')

class Main {
    constructor(){
        this.Mark = new Marks
        this.Regex = new Regex
        this.Verbs = new Verbs
        this.Dictionary = new Dictionary
        this.Tokenizer = new Tokenizer
        this.Normalizer = new Normalizer
        this.Query = new Query
    }
    
    start(){
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        // this.Query.kind_query("دانشگاه صنعتی امیرکبیر")
        rl.question("Enter your query: ", (query) => {
            if (query=='exit') {
                process.exit(0)
            }
            this.Query.kind_query(query)
            rl.close()
        });
        
        rl.on("close",  () => {
            this.start()
            //process.exit(0);
        });
    }
}

const main = new Main()
main.start()
