(function () {
    var MINISCRIPT = 'miniscript'
    monaco.languages.register({ id: MINISCRIPT })

    monaco.languages.setMonarchTokensProvider(MINISCRIPT, {
        keywords: ['pk', 'multi', 'time', 'hash', 'thres'],
        operators: ['and', 'or', 'aor'],
        tokenizer: {
            root: [
                [/[a-z_$][\w$]*/, {
                    cases: {
                        '@keywords': 'keyword',
                        '@default': 'identifier'
                    }
                }],
                [/[0-9a-fA-F]+/, 'type.identifier'],
                { include: '@whitespace' },
                [/[()]/, '@brackets'],
                [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                [/\d+/, 'number'],
            ],
            whitespace: [
                [/[ \t\r\n]+/, 'white'],
            ],
        },
    })

    function createDependencyProposals() {
        return [
            { label: "pk", insertText: "pk", kind: monaco.languages.CompletionItemKind.Function, detail: "Require public key HEX to sign" },
            { label: "multi", insertText: "multi", kind: monaco.languages.CompletionItemKind.Function, detail: "Require that NUM out of the following HEX public keys sign" },
            { label: "time", insertText: "time", kind: monaco.languages.CompletionItemKind.Function, detail: "Require that a relative time NUMBER has passed since creating the output" },
            { label: "hash", insertText: "hash", kind: monaco.languages.CompletionItemKind.Function, detail: "Require that the SHA256 preimage of HEX is revealed" },
            { label: "and", insertText: "and", kind: monaco.languages.CompletionItemKind.Function, detail: "Require that both subexpressions are satisfied" },
            { label: "or", insertText: "or", kind: monaco.languages.CompletionItemKind.Function, detail: "Require that one of the subexpressions is satisfied" },
            { label: "aor", insertText: "aor", kind: monaco.languages.CompletionItemKind.Function, detail: "Require that one of the subexpressions is satisfied, the first subexpression is more likely than the second" },
            { label: "thres", insertText: "thres", kind: monaco.languages.CompletionItemKind.Function, detail: "Require that NUM out of the following subexpressions are satisfied" },
        ]
    }

    
    monaco.languages.registerCompletionItemProvider(MINISCRIPT, {
        provideCompletionItems: (model, position) => {
            return { suggestions: createDependencyProposals() }
        }
    });

    /*
pk(HEX): Require public key HEX to sign
multi(NUM,HEX,HEX,...): Require that NUM out of the following HEX public keys sign
time(NUMBER): Require that a relative time NUMBER has passed since creating the output
hash(HEX): Require that the SHA256 preimage of HEX is revealed
and(EXPR,EXPR): Require that both subexpressions are satisfied
or(EXPR,EXPR): Require that one of the subexpressions is satisfied
aor(EXPR,EXPR): Same as above, but the first subexpression is more likely than the second
thres(NUM,EXPR,EXPR,...):Require that NUM out of the following subexpressions are satisfied

    */
    var sigs = {
        pk: [{
            label: "pk(HEX)",
            parameters: [{
                label: "HEX",
                documentation: "public key HEX to sign"
            }]
        }],
        multi: [
            {
                label: "multi(NUM,HEX1,HEX2,...)",
                parameters: [{
                    label: "NUM",
                    documentation: "Number of keys that need to sign"
                },
                {
                    label: "HEX1",
                    documentation: "key to sign"
                },
                {
                    label: "HEX2",
                    documentation: "key to sign"
                },
                {
                    label: "...",
                    documentation: "additional keys to sign"
                }
            ]
            }       
        ],
        time: [{
            label: "time(NUM)",
            parameters: [{
                label: "NUM",
                documentation: "relative time NUMBER"
            }]
        }],
        hash: [{
            label: "hash(HEX)",
            parameters: [{
                label: "HEX",
                documentation: "SHA256 preimage of HEX is revealed"
            }]
        }],
        and: [
            {
                label: "and(EXPR1,EXPR2)",
                parameters: [{
                    label: "EXPR1",
                    documentation: "subexpression to be satisfied"
                },
                {
                    label: "EXPR2",
                    documentation: "subexpression to be satisfied"
                }
            ]
            }       
        ],
        or: [
            {
                label: "or(EXPR1,EXPR2)",
                parameters: [{
                    label: "EXPR1",
                    documentation: "subexpression to be satisfied"
                },
                {
                    label: "EXPR2",
                    documentation: "subexpression to be satisfied"
                }
            ]
            }       
        ],
        aor: [
            {
                label: "aor(EXPR1,EXPR2)",
                parameters: [{
                    label: "EXPR1",
                    documentation: "most likely subexpression to be satisfied"
                },
                {
                    label: "EXPR2",
                    documentation: "subexpression to be satisfied"
                }
            ]
            }       
        ],
        thres: [
            {
                label: "thres(NUM,EXPR1,EXPR2,...)",
                parameters: [{
                    label: "NUM",
                    documentation: "Number of subexpressions that need to satisfied"
                },
                {
                    label: "EXPR1",
                    documentation: "Expression 1"
                },
                {
                    label: "EXPR2",
                    documentation: "Expression 2"
                },
                {
                    label: "...",
                    documentation: "additional expressions"
                }
            ]
            }       
        ],
 
    }

    monaco.languages.registerSignatureHelpProvider(MINISCRIPT, {
        provideSignatureHelp: function (model, position) {
            var offset = model.getOffsetAt(position)-1
            var depth = 0
            var index = 0
            while(offset) {
                if(depth < 0) {
                    var word = model.getWordAtPosition(model.getPositionAt(offset))

                    var sig = {
                        activeSignature: 0,
                        activeParameter: Math.min(index, sigs[word.word][0].parameters.length - 1),
                        signatures: sigs[word.word]
                    }
                    console.log(sig)
                    return sig
                }
                var pos = model.getPositionAt(offset)
                var char = model.getValueInRange({
                    startLineNumber: pos.lineNumber,
                    startColumn: pos.column,
                    endLineNumber: pos.lineNumber,
                    endColumn: pos.column+1,
                })
                if(char == ')') depth++
                if(char == ',') index++
                if(char == '(') depth--
                offset--
            }
        },
        signatureHelpTriggerCharacters: ['(', ',']
    })


    monaco.languages.setLanguageConfiguration(MINISCRIPT, {
        autoClosingPairs: [
            { open: '(', close: ')' }
        ]
    })
})()