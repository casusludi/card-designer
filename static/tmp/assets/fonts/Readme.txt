/* Orange - July 2015 */

/* Recommended @font-face snippet for web fonts */

@font-face{
	font-family:"Font Name";
	src:url("Fonts/fontfile.eot?#iefix");
	src:url("Fonts/fontfile.eot?#iefix") format("eot"),
	url("Fonts/fontfile.woff2") format("woff2"),
	url("Fonts/fontfile.woff") format("woff"),
	url("Fonts/fontfile.ttf") format("truetype"),
	url("Fonts/fontfile.svg") format("svg");
}

/* Usage */

p.classname {
	font-family: "Font Name";
}