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