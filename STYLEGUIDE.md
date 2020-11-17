backend javascript
==================

`let` instead of `var`
  > where applicable, of course. var is still necessary for global scoping (ew) 
  > and self-referencing initialization (temporal dead zone).
 
`const` for all requires

attempt to align require statements from the = onwards, grouped by relevance
  > for instance, all Module requires can be grouped, then utility packages like fs, path, etc.

arrow functions instead of `function` keyword
  > except insituations such as when callee `this` is needed

use promises instead of callbacks or async

`forEach` instead of `for` loop, unless returning early is possible

literals over `new (object)`
  > eg. `{}` instead of `new Object()`
  
`/regex/` literal instead of `new RegExp()` object
  > sometimes still necessary, but opens a major possible pitfall
  > (regex objects keeping memory of called functions)

use object method shorthand
```
  let obj = {
    method(param){
      return param;
    }
  }
```

instead of

```
  let obj = {
    method: function(param){
      return param;
    }
  }
```

while looking up references i came across this: https://github.com/airbnb/javascript
i agree with nearly all of this, i may update this file to include a reference to this and my few changes

for instance, const over let, no comma operator on initializations, 19.3 is dumb, 
22.3 and 22.6 conflict, but kinda makes sense (i prefer !! but + is error-prone)