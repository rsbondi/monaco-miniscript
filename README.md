This package(not yet packaged) provides a [monaco editor](https://microsoft.github.io/monaco-editor/index.html) 
language definition for
[miniscript](http://bitcoin.sipa.be/miniscript/miniscript.html)

It sets up the language definition providing code completion, tokenization and signature help for miniscript

### Usage

```html
<div id="container"></div>

<!-- monaco scripts here, see example index.html -->

<script src="path/to/index.js"></script>

<script>
  var editor = monaco.editor.create(document.getElementById('container'), {
    value: '',
    language: 'miniscript'
  });
</script>
```


TODO: 
* bracket matching
* npm package