// Main

const readline = require("readline");

const Marks = require('./Marks')
const Regex = require('./Regex')
const Verbs = require('./Verbs')
const Dictionary = require('./Dictionary')
const Tokenizer = require('./Tokenizer')
const Normalizer = require('./Normalizer')
const Query = require('./Query')
const Champion = require('./Champion')

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
        
        rl.question("Enter your query: ", (query) => {
            if (query=='exit') {
                process.exit(0)
            }
            this.Query.split_query(query)
            rl.close()
        });
        
        rl.on("close",  () => {
            this.start()
        });
    }
}

const main = new Main()
main.start()

// Query

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

// Dictionary

const reader = require('xlsx')
const Tokenizer = require('./Tokenizer')
const Normalizer = require('./Normalizer')
const fs = require('fs');
const Path = require('path')

module.exports = class Read {
    contents = []
    docs_id = []
    docs_title = []
    docs_url = []
    docs_num = 0
    inverted_index = {}
    constructor(){ 
        const file = reader.readFile('./data/IR1_7k_news.xlsx')
        const sheets = file.SheetNames
        let data = []
        for(let i = 0; i < sheets.length; i++)
        {
            const temp = reader.utils.sheet_to_json(
                file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
                data.push(res)
            })
        }
        this.docs_num = data.length
        data.map((rows,i) => {
            if (i<200) {
                this.contents[i] = rows['content']
                this.docs_url[i] = rows['url']
                this.docs_title[i] = rows['title']
                this.docs_id[i] = i
            }
        })
    }

    create_file(text){
        fs.writeFile('Dictionary.json', JSON.stringify(text), 'utf8', function (err) {
            if (err) return console.log(err);
            //console.log('created');
          });
    }

    create_dictionary() {
        let tokenizer = new Tokenizer
        let normalizer = new Normalizer
        let positional_index = {}
        let prechampion = {}
        let doc_tokens_content = []
        let numtoken = 0
        // let contents = ["سلام دانشگاه امیرکبیر خوبی سلام چطوری دانشگاه علموص صنعتی عارفه خوبه 1400آبان ما رفتیم"
        // ,"آبان 200200 گفته شد دانشگاه صنعتی صنعتی امیرکبیر که کرونا داشتم"
        // ," صنعتی"]
        this.contents.map((content,id) => {
            //Get all tokens in the excel file
            let doc_tok = tokenizer.set_tokenizer(content)
            let normal = normalizer.set_normalizer(doc_tok)
            numtoken += doc_tok.length
            //Array.prototype.push.apply(doc_tok_total,doc_tok)
            Array.prototype.push.apply(doc_tokens_content,normal)
            console.clear()
            console.log("create token of content: " + id);
        })
        let numberofdocs = this.contents.length
        console.log("Token total length: "+numtoken);
        console.log("Normal total length: "+doc_tokens_content.length);
        doc_tokens_content = [...new Set(doc_tokens_content)]
        let alltokenlength = doc_tokens_content.length*200
        console.log(alltokenlength);
        doc_tokens_content.map((token,id) => {
            //Check the tokens with the content to find the position
            positional_index[token] = {}
            prechampion[token] = {}
            
            let sumtotal = 0
            this.contents.map((content,tokenid) => {
                if (tokenid<200) {
                    let match
                    var re = RegExp(`${token}`, 'g')
                    let content_token = tokenizer.set_tokenizer(content)
                    let pos = []
                    content_token = normalizer.set_content_normal(content_token)
                    while ((match = re.exec(content_token)) != null) {
                        let space = content.slice(0,match.index).match(new RegExp(` `, 'g'), '')
                        pos.push(space ? space.length+1 : 1)
                    }
                    if (pos.length != 0) {
                        positional_index[token][tokenid+1] = pos
                        //prechampion[token][tokenid+1] = [{"sum": pos.length}]
                        positional_index[token][tokenid+1]['sum'] = pos.length
                        positional_index[token][tokenid+1]["weight"] = 0
                    }
                    sumtotal += pos.length
                    positional_index[token]['sum'] = sumtotal
                    console.clear()
                    console.log("in process: "+ alltokenlength--)
                }
            })

            for (var key in positional_index) {
                let l = 0
                for (var key2 in positional_index[key]) {
                    l++
                }
                for (var key2 in positional_index[key]) {
                    if((typeof positional_index[key][key2])=='object'){
                        //console.log("length: " + (l-1));
                        let idft = Math.log10(numberofdocs/(l-1))
                        //console.log(idft, (l-1));
                        let tf = 1 + Math.log10(positional_index[key][key2]['sum'])
                        //delete
                        //positional_index[key][key2]['weight'] = parseFloat((tf*idft).toFixed(2))
                        if(parseFloat((tf*idft).toFixed(2))>0)
                            prechampion[key][key2+"th"] = parseFloat((tf*idft).toFixed(2))

                    }
                }
            }

        })
        // Object.values(prechampion).map((i)=>{
        //     console.log(i);
        // })
        // console.log(prechampion);
         
        //normalizer.get_heaplaw()
        return prechampion
    }

    sorted(unordered){
        const ordered = Object.keys(unordered).sort().reduce(
            (obj, key) => { 
              obj[key] = unordered[key]; 
              return obj;
        },{});
        //console.log(ordered);
        return ordered
    }

    set_dictionary() {
        let dict = this.create_dictionary()
        this.create_file(dict)
        return dict
    }
}

// Champion

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

            if(keys.length>10){
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

// Marks

module.exports = class Marks {
    punctuation = [')','(','>','<',"؛","،",'{','}',"؟",':',"-", '»', '"', '«', '[', ']','"','+','=','?']
    marks = ['/','//', '\\','|','!', '%', '&','*','$', '#','؟', '*','.','_' ]
    alphabet_string_lower = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q','r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    alphabet_string_upper = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    english_char = this.alphabet_string_lower.concat(this.alphabet_string_upper)
    stopwords = ['در','تا','از','با','که','و','را','به','اما','بر','اخر','حداقل','حتی','حتما','حالی','حالا','حال','جهت','جلوتر','جلو','جز','جدی','توی','توسط','تقریبا','تدریجی','تدریج','تاکنون','تحت','تاحدودی','تاحدی','بیشتر','بیش','بهش','بهتر','بهت','بمراتب','بله','بلکه','بلافاصله','بعضی','بعدی','بعدا','بعد','بصورت','بسیار','بسا','بس','برخلاف','برای','براثر','بر','بدین','بدون','بجای','بخاطر','بااطمینان','باانکه','اگرچه','آن','ان','امیدوارم','امسال','امروزه','امروز','الی','اکثرا','اغلب','اصطلاحا','اصلا','است','اساسا','ازقبیل','ازان','ازش','ازاینرو','ازاین','ازان','اره']
    sep_list = [" ", '\xad', '\u200e','\u200f', '\u200d', '\u200d', '\u200d'].concat(this.marks)
  }
    
// Normalizer

const Marks = require('./Marks')
const Verbs = require('./Verbs')
const Regex = require('./Regex')

module.exports = class Normalizer {

    constructor(){
        this.Marks = new Marks
        this.Verbs = new Verbs
        this.Regex = new Regex

        let before = 0
        let after = 0
    }

    remove_punctuation_marks(word_list){
        for(let i=0 ; i<word_list.length ; i++){
            this.Marks.punctuation.map(mark => {
                word_list[i] = word_list[i].replaceAll(mark,"")
            })
        }
        return word_list
    }

    edit_long_letters(word_list){
        this.Regex.raw_long_letters.map((pattern)=>{
            word_list.map((rows,i)=>{
                let reg = new RegExp(pattern[0], 'g');
                word_list[i] = rows.replace(reg, pattern[1]);
            })
        })
        return word_list
    }

    remove_mokassar(word_list){
        word_list.map((rows,i) => {
            if (this.Verbs.mokassar_dict().hasOwnProperty(rows)) {
                word_list[i] = this.Verbs.mokassar_dict()[rows]
            }
        })
        return word_list
    }

    remove_arabic_notation(word_list){
        this.Regex.raw_arabic_notation.map((pattern)=>{
            word_list.map((rows,i)=>{
                let reg = new RegExp(pattern[0], 'g');
                word_list[i] = rows.replace(reg, pattern[1]);
            })
        })
        return word_list
    }

    create_translation_table(src_list, dst_list, word_list){
        word_list.map((rows,j) => {
           for (let i = 0; i < src_list.length; i++) {
               rows = rows.replaceAll(src_list.substr(i,1) ,dst_list.substr(i,1))
               word_list[j] = rows
           }
       })
       return word_list
    }

    char_digit_Unification(word_list){
        word_list.map((x,i) => {
            if(isNaN(x) || (!isNaN(x) & parseFloat(x)<3000)){
                word_list[i] = x
            }
        })
        let translation_src = ' یکی""' // change arabic form of letterts to persian
        let translation_dst = ' ىكي“”'
        translation_src += 'ئ0123456789أإآ%'
        translation_dst += 'ی۰۱۲۳۴۵۶۷۸۹ااا٪'
        
        return this.create_translation_table(translation_src, translation_dst, word_list)
    }

    verb_Steaming(word_list){
        word_list.map((rows,i) => {
            if (this.Verbs.all_verbs().hasOwnProperty(rows)) {
                word_list[i] = this.Verbs.all_verbs()[rows]
            }
        })
        return word_list
    }

    remove_postfix(word_list){
        this.Regex.raw_postfix.map((pattern)=>{
            word_list.map((rows,i)=>{
                if ( (word_list[i].length>4) & !(this.Verbs.all_verbs_roots.includes(word_list[i])) ) {
                    let reg = new RegExp(pattern[0], 'g');
                    word_list[i] = rows.replace(reg, pattern[1]);
                }
            })
        })
        return word_list
    }
    
    remove_stopwords(word_list){
        for(let i=0 ; i<word_list.length ; i++){
            this.Marks.stopwords.map(mark => {
                if (mark == word_list[i]) {
                    word_list[i] = word_list[i].replaceAll(mark,"")
                }
            })
        }
        return word_list
    }

    morakab_Unification(word_list){
        this.Regex.raw_half_space.map((pattern)=>{
            word_list.map((rows,i)=>{
                let reg = new RegExp(pattern[0], 'g');
                word_list[i] = rows.replace(reg, pattern[1]);
            })
        })
        return word_list
    }

    remove_nones(word_list){
        return word_list.filter((a) => a)
    }

    

    set_normalizer(word_list){
        word_list = this.remove_stopwords(word_list)
        word_list = this.remove_punctuation_marks(word_list)
        word_list = this.edit_long_letters(word_list)
        word_list = this.remove_mokassar(word_list)
        word_list = this.remove_arabic_notation(word_list)
        word_list = this.char_digit_Unification(word_list)
        this.before = word_list.length
        word_list = this.verb_Steaming(word_list)
        word_list = this.remove_postfix(word_list)
        word_list = this.morakab_Unification(word_list)
        word_list = this.remove_nones(word_list)
        this.after = word_list.length
        return word_list
    }

    get_heaplaw(){
        console.log("Before verb_steaming: "+ this.before);
        console.log("After verb_steaming: "+ this.after);
    }

    set_content_normal(word_list){
        word_list = this.remove_mokassar(word_list)
        word_list = this.char_digit_Unification(word_list)
        return word_list
    }
}

// Regex

module.exports = class Regex {
    raw_postfix = [
        ['[\u200c](تر(ین?)?|گری?|های?)' , ''], // تر و ترین و گری به صورت نیم فاصله
        ['(تر(ین?)?|گری?)(?=$)' , ''], //تر ، ترین، گر، گری در آخر کلمه
        ['(?<=[^ او])(م|ت|ش|مان|تان|شان)$' , ''], // حذف شناسه های مالکیت و فعل در آخر کلمه
        ['(ان|ات|گی|گری|های)$' , ''], //ان، ات، ها، های آخر کلمه  
    ]

    raw_arabic_notation = [
        // remove FATHATAN, DAMMATAN, KASRATAN, FATHA, DAMMA, KASRA, SHADDA, SUKUN
        ['[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652]', ''],
    ]
    
    

    raw_prefix_notation = [
        ['پیش*' , '']
    ]

    raw_long_letters = [
        [' +', ' '],  // remove extra spaces
        ['\n\n+', '\n'],  // remove extra newlines
        ['[ـ\r]', ''],  // remove keshide, carriage returns
    ]
    
    raw_half_space = [
        ['[\u200c]', ''],
    ]
}

// Tokenizer

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

// Verbs

module.exports = class Verbs {

    present_roots =['توان','باش','رو','بر','یاور', 'یانداز', 'یای','یاندیش','بخش','باز','خر','بین','شنو','دار','دان','رسان','شناس','گو','گذار','یاب','لرز','ساز','شو','نویس','خوان','کاه','گیر','خواه','کن' ]
    past_roots = ['توانست','بود','کرد','اورد','انداخت','امد','خرید','باخت','برد','رفت','اندیشید','بخشید','دید','شنید','داشت','دانست','رساند','شناخت','گفت','گذشت','یافت','لرزید','ساخت','شد','نوشت','خواند','کاست','گرفت','خواست']
    all_verbs_roots = this.present_roots.concat(this.past_roots)
    empty_list = ['','','','','','','']
    verb_prefix = ['نمی‌', 'می‌','ن','ب',"" ]
    present_verb_postfix = ['م','ی','د','ید','ند','یم']
    past_verb_postfix = ['ایم','اید','ای','ام','اند']
    past_verb_postfix2 = ['م','ی','ید','ند','یم']
    words_list = ['ادب', 'آداب', 'طرف', 'اطراف', 'حقیقت', 'حقایق', 'موج', 'امواج', 'ادیب', 'ادبا', 'عمق', 'اعماق', 'خزینه', 'خزائن', 'مرکز', 'مراکز', 'اثر', 'آثار', 'عالم', 'علما', 'خبر', 'اخبار', 'موقع', 'مواقع', 'اسیر', 'اسرا', 'علم', 'علوم', 'دوره', 'ادوار', 'مصرف', 'مصارف', 'اسم', 'اسامی', 'علامت', 'علائم', 'دین', 'ادیان', 'معرفت', 'معارف', 'اسطوره', 'اساطیر', 'علت', 'علل', 'دفتر', 'دفاتر', 'مبحث', 'مباحث', 'امیر', 'امرا', 'عقیده', 'عقائد', 'ذخیره', 'ذخایر', 'ماده', 'مواد', 'امر', 'اوامر', 'عمل', 'اعمال', 'رفیق', 'رفقا', 'مذهب', 'مذاهب', 'امام', 'ائمه', 'عید', 'اعیاد', 'رای', 'آرا', 'مصیبت', 'مصائب', 'اصل', 'اصول', 'عنصر', 'عناصر', 'رسم', 'رسوم', 'معبد', 'معابد', 'افق', 'آفاق', 'عاطفه', 'عواطف', 'رابطه', 'روابط', 'مسجد', 'مساجد', 'بیت', 'ابیات', 'عضو', 'اعضا', 'رمز', 'رموز', 'معبر', 'معابر', 'تاجر', 'تجار', 'عبارت', 'عبارات', 'رجل', 'رجال', 'مظهر', 'مظاهر', 'تصویر', 'تصاویر', 'عجیب', 'عجایب', 'رقم', 'ارقام', 'منظره', 'مناظر', 'جد', 'اجداد', 'فقیه', 'فقها', 'زاویه', 'زوایا', 'مرض', 'امراض', 'جانب', 'جوانب', 'فن', 'فنون', 'زعیم', 'زعما', 'مورد', 'موارد', 'جزیره', 'جزایر', 'فکر', 'افکار', 'سانحه', 'سوانح', 'مرحله', 'مراحل', 'جبل', 'جبال', 'فریضه', 'فرایض', 'سلطان', 'سلاطین', 'مفهوم', 'مفاهیم', 'جریمه', 'جرایم', 'فعل', 'افعال', 'شعر', 'اشعار', 'منبع', 'منابع', 'حادثه', 'حوادث', 'فقیر', 'فقرا', 'شاعر', 'شعرا', 'مکان', 'اماکن', 'حشم', 'احشام', 'قاعده', 'قواعد']

    all_verbs() {
        let all_verbs = {}
        this.verb_prefix.map(pref => {
            for(let x=0 ; x<this.present_roots.length ; x++ ){
                let present_root = this.present_roots[x]
                this.present_verb_postfix.map(post => {
                    all_verbs[pref+present_root+post] = present_root
                })
            }
            for(let x=0 ; x<this.past_roots.length ; x++ ){
                let past_root = this.past_roots[x]
                this.past_verb_postfix.map(post => {
                    all_verbs[past_root+'ه‌'+post] = past_root
                })
                this.past_verb_postfix2.map(post => {
                    all_verbs[pref+past_root+post] = past_root
                })
            }
        })   
        //console.log(Object.keys(all_verbs).length)
        return all_verbs 
    }

    mokassar_dict(){
        let mokassar_dict ={}
        for(let i=0 ; i<this.words_list.length ; i=i+2){
            mokassar_dict[this.words_list[i+1]] = this.words_list[i] // قاعده <= قواعد
        } 
        return mokassar_dict
    }
  
}

