ISOGRAM
=======
Customize your google analytics code. _Visit: https://isogram.whe.app_


## Example
Before:
```html
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-XXXXX-XX', 'auto');
  ga('send', 'pageview');
</script>
```
After:
```html
<script>
  !function(C,O,o,L,K,i,d){C.GoogleAnalyticsObject=o;C[o]||(C[o]=function(){
  (C[o].q=C[o].q||[]).push(arguments)});C[o].l=+new Date;i=O.createElement(L);
  d=O.getElementsByTagName(L)[0];i.src=K;d.parentNode.insertBefore(i,d)}
  (window,document,'ga','script','//www.google-analytics.com/analytics.js');

  ga('create', 'UA-XXXXX-XX', 'auto');
  ga('send', 'pageview');
</script>
```
See more [examples](https://github.com/shinnn/isogram#websites-using-isogram).


## Installation
```bash
$ npm install
```

Start development server:
```bash
$ gulp
```


## Questions?

Please [open an issue](https://github.com/ddhhz/isogram/issues) or [email me](mailto:&#103;&#105;&#116;&#104;&#117;&#098;&#064;&#119;&#101;&#105;&#115;&#112;&#111;&#116;&#046;&#099;&#111;&#109;) with any issues, feedback, or suggestions.


## Author
[**Wei He**](https://whe.me)  [_&#103;&#105;&#116;&#104;&#117;&#098;&#064;&#119;&#101;&#105;&#115;&#112;&#111;&#116;&#046;&#099;&#111;&#109;_](mailto:&#103;&#105;&#116;&#104;&#117;&#098;&#064;&#119;&#101;&#105;&#115;&#112;&#111;&#116;&#046;&#099;&#111;&#109;)


## Donations

If you find this tool helpful, please consider supporting me by [sending me a coffee](https://o.whe.me/supportwei).

I will be commited to delivering quality tools and keep them ad-free. Thank you for your support!


## Acknowledgements

Fork of [jaxgeller/isogrammer](https://github.com/jaxgeller/isogrammer). Project updated to use [shinnn/isogram](https://github.com/shinnn/isogram).


## License
[ISC](LICENSE)
