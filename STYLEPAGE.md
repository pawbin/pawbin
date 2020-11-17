# pawb.in

This is a typical paragraph. It would help to write a whole lot of text here in case of weird line spacing or word wrap issues, but I honestly can't think of enough to write that would fill the sort of space necessary to do that. Maybe I'll just try posting a bunch of different headers in Markdown to see how those look. After that, I could do a bunch of other tests on features like bold, italic, blockquote, code, lists... man, there's actually a lot of ground to cover here. Better get started!





---

#### MARKDOWN

> Headers

# Header 1
is used pretty much exclusively for the title, "pawb.in" and any other variations of the title that might appear. This is the only text size warranted to be this large, really. 

## Header 2
is used for subtitles and page headers.

### Header 3
is used for page sections and categories. Typically delineates sections that are reasonably large. For example, the major underlined sections of a Wikipedia page, or the headline for a series of consecutive news posts.

#### Header 4
is used for repeating titles and emphasis. Tends to be similar in size to the normal font but clearly stands out. For example, sits above distinct sections of a form.

##### Header 5
is used for subcategories and smaller sections. 

###### Header 6
is used for small text which is distinct from normal text but appears repeatedly. For example, dates on news posts, which appear on every news post, but should not take up a very large amount of screen space.

> Blockquotes

look similar to Header 4. These can be used as a section header but should come as a second priority to Header 4 as it has a large visual impact but with less contrast.

> This is a blockquote... but all alone on one line.

> This blockquote, however,
> spans multiple lines, which
> is much cooler than the
> blockquote above.

> Formatting

*Checking text that is italic, yep, looks slanted.*

**Checking text that is bold, yep, looks thick.**

~~Checking text that is struckthrough, yep, looks crossed off.~~

Although that last strikethrough was the `del` tag, <s>so I'm also going to try the `s` tag here.</s>

> Lists

Things to consider:
1. The first item in this list.
2. The second item in this list.
3. The third item in this list.
4. Additional items in this list.
5. The total quantity of items in this list.

Honorable mentions:
- Other items not included among these five items.
- Other lists that aren't this list.
- Other... I'm out of ideas on this one.

> Code blocks

`Here's some code without anything else surrounding it`

Meanwhile here's some `code` but placed directly into the middle and at the `end of this sentence.`

```
In fact, I wonder if an entire preformatted code block works correctly?
Best to try multiple lines, just to be sure.
Nice.
```

<pre>
And here's a test of just a preformatted block, not necessarily code.
Markdown automatically converts ``` ``` into `pre code` as in the block above, so this is an important case to check.
Should look similar to the `pre code` block, except note that no syntax highlighting can be performed in this block.
</pre>

> Links & Images

I'm referring to [this cheatsheet](https://www.markdownguide.org/cheat-sheet/) for markdown styling.

Here's a picture of Pajamy:

![Picture of Pajamy's head](https://cdn.glitch.com/3ffbe794-725c-40ae-b812-76257af22230%2Ficon_pajamy.png?v=1556597301416)





---

#### FORMS

An input all by itself.

<input>

A normal form. Remember to group things using `div.form-group`.

<form>
  <div class="form-group">
    <input>
  </div>
  <div class="form-group">
    <label>neat</label><input>
  </div>
  <div class="form-group">
    <label>one more label</label><input>
  </div>
  <button>submit</button>
</form>

```html
<form>
  <div class="form-group">
    <input>
  </div>
  <div class="form-group">
    <label>neat</label><input>
  </div>
  <div class="form-group">
    <label>one more label</label><input>
  </div>
  <button>submit</button>
</form>
```

An inline form. Use `form.inline`.

<form class="inline">
  <input>
  <button>search</button>
</form>

```html
<form class="inline">
  <input>
  <button>search</button>
</form>
```

Another inline form, this time with more buttons.

<form class="inline">
  <input>
  <button>accept</button>
  <button>reject</button>
  <button>cancel</button>
</form>

```html
<form class="inline">
  <input>
  <button>accept</button>
  <button>reject</button>
  <button>cancel</button>
</form>
```






---

#### BUTTONS

> button, .button

Sometimes the normal HTML button tag is necessary for things like forms. When possible, use the `.button` class instead.

Use `.disabled` for disabled buttons.

<div class="button">test 1</div>
<div class="button">test 2</div>
<div class="button disabled">test 3</div>

```html
<div class="button">test 1</div>
<div class="button">test 2</div>
<div class="button disabled">test 3</div>
```




---

#### SPECIFIC CSS CLASSES

> .textcenter

Centers text within its own block. That is to say, should work on block elements and not inline elements.

<p class="textcenter">This text is centered.</p>

```html
<p class="textcenter">This text is centered.</p>
```

> .textcaps

Makes text full caps.

<p class="textcaps">This text is in full capitals.</p>

```html
<p class="textcaps">This text is in full capitals.</p>
```

> .noscroll

Prevents scrolling on a touch screen when starting on this element.

<blockquote class="noscroll">Try scrolling while starting a touch action here.</blockquote>

```html
<blockquote class="noscroll">Try scrolling while starting a touch action here.</blockquote>
```

> .hidden

Completely hides this element.

<p class="hidden">You're just going to have to trust that there was something here.</p>

```html
<p class="hidden">You're just going to have to trust that there was something here.</p>
```