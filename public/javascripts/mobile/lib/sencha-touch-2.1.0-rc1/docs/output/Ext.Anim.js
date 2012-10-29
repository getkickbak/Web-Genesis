Ext.data.JsonP.Ext_Anim({"subclasses":[],"parentMixins":[],"aliases":{},"html_meta":{},"inheritable":null,"uses":[],"alternateClassNames":[],"override":null,"extends":null,"tagname":"class","requires":[],"files":[{"href":"Anim.html#Ext-Anim","filename":"Anim.js"}],"superclasses":[],"singleton":true,"members":{"cfg":[{"owner":"Ext.Anim","tagname":"cfg","name":"after","id":"cfg-after","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"autoClear","id":"cfg-autoClear","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"before","id":"cfg-before","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"delay","id":"cfg-delay","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"direction","id":"cfg-direction","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"disableAnimations","id":"cfg-disableAnimations","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"duration","id":"cfg-duration","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"easing","id":"cfg-easing","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"from","id":"cfg-from","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"out","id":"cfg-out","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"reverse","id":"cfg-reverse","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"scope","id":"cfg-scope","meta":{}},{"owner":"Ext.Anim","tagname":"cfg","name":"to","id":"cfg-to","meta":{}}],"method":[{"owner":"Ext.Anim","tagname":"method","name":"constructor","id":"method-constructor","meta":{"private":true}},{"owner":"Ext.Anim","tagname":"method","name":"initConfig","id":"method-initConfig","meta":{"private":true}},{"owner":"Ext.Anim","tagname":"method","name":"onTransitionEnd","id":"method-onTransitionEnd","meta":{"private":true}},{"owner":"Ext.Anim","tagname":"method","name":"run","id":"method-run","meta":{}}],"property":[{"owner":"Ext.Anim","tagname":"property","name":"defaultConfig","id":"property-defaultConfig","meta":{"private":true}},{"owner":"Ext.Anim","tagname":"property","name":"isAnim","id":"property-isAnim","meta":{"private":true}}],"css_var":[],"event":[],"css_mixin":[]},"statics":{"cfg":[],"property":[],"method":[],"css_var":[],"event":[],"css_mixin":[]},"private":null,"component":false,"mixins":[],"name":"Ext.Anim","linenr":1,"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/Anim.html#Ext-Anim' target='_blank'>Anim.js</a></div></pre><div class='doc-contents'><p><a href=\"#!/api/Ext.Anim\" rel=\"Ext.Anim\" class=\"docClass\">Ext.Anim</a> is used to execute simple animations defined in <a href=\"#!/api/Ext.anims\" rel=\"Ext.anims\" class=\"docClass\">Ext.anims</a>. The <a href=\"#!/api/Ext.Anim-method-run\" rel=\"Ext.Anim-method-run\" class=\"docClass\">run</a> method can take any of the\nproperties defined below.</p>\n\n<pre><code><a href=\"#!/api/Ext.Anim-method-run\" rel=\"Ext.Anim-method-run\" class=\"docClass\">Ext.Anim.run</a>(this, 'fade', {\n    out: false,\n    autoClear: true\n});\n</code></pre>\n\n<p>When using <a href=\"#!/api/Ext.Anim-method-run\" rel=\"Ext.Anim-method-run\" class=\"docClass\">run</a>, ensure you require <a href=\"#!/api/Ext.Anim\" rel=\"Ext.Anim\" class=\"docClass\">Ext.Anim</a> in your application. Either do this using <a href=\"#!/api/Ext-method-require\" rel=\"Ext-method-require\" class=\"docClass\">Ext.require</a>:</p>\n\n<pre><code>Ext.requires('<a href=\"#!/api/Ext.Anim\" rel=\"Ext.Anim\" class=\"docClass\">Ext.Anim</a>');\n</code></pre>\n\n<p>when using <a href=\"#!/api/Ext-method-setup\" rel=\"Ext-method-setup\" class=\"docClass\">Ext.setup</a>:</p>\n\n<pre><code><a href=\"#!/api/Ext-method-setup\" rel=\"Ext-method-setup\" class=\"docClass\">Ext.setup</a>({\n    requires: ['<a href=\"#!/api/Ext.Anim\" rel=\"Ext.Anim\" class=\"docClass\">Ext.Anim</a>'],\n    onReady: function() {\n        //do something\n    }\n});\n</code></pre>\n\n<p>or when using <a href=\"#!/api/Ext-method-application\" rel=\"Ext-method-application\" class=\"docClass\">Ext.application</a>:</p>\n\n<pre><code><a href=\"#!/api/Ext-method-application\" rel=\"Ext-method-application\" class=\"docClass\">Ext.application</a>({\n    requires: ['<a href=\"#!/api/Ext.Anim\" rel=\"Ext.Anim\" class=\"docClass\">Ext.Anim</a>'],\n    launch: function() {\n        //do something\n    }\n});\n</code></pre>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-after' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-after' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-after' class='name not-expandable'>after</a><span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a></span></div><div class='description'><div class='short'><p>Code to execute after the animation ends.</p>\n</div><div class='long'><p>Code to execute after the animation ends.</p>\n</div></div></div><div id='cfg-autoClear' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-autoClear' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-autoClear' class='name expandable'>autoClear</a><span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span></div><div class='description'><div class='short'>true to remove all custom CSS defined in the to config when the animation is over. ...</div><div class='long'><p><code>true</code> to remove all custom CSS defined in the <a href=\"#!/api/Ext.Anim-cfg-to\" rel=\"Ext.Anim-cfg-to\" class=\"docClass\">to</a> config when the animation is over.</p>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-before' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-before' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-before' class='name not-expandable'>before</a><span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a></span></div><div class='description'><div class='short'><p>Code to execute before starting the animation.</p>\n</div><div class='long'><p>Code to execute before starting the animation.</p>\n</div></div></div><div id='cfg-delay' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-delay' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-delay' class='name expandable'>delay</a><span> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span></div><div class='description'><div class='short'>Time to delay before starting the animation. ...</div><div class='long'><p>Time to delay before starting the animation.</p>\n<p>Defaults to: <code>0</code></p></div></div></div><div id='cfg-direction' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-direction' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-direction' class='name not-expandable'>direction</a><span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span></div><div class='description'><div class='short'><p>Valid values are: 'left', 'right', 'up', 'down', and <code>null</code>.</p>\n</div><div class='long'><p>Valid values are: 'left', 'right', 'up', 'down', and <code>null</code>.</p>\n</div></div></div><div id='cfg-disableAnimations' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-disableAnimations' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-disableAnimations' class='name expandable'>disableAnimations</a><span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span></div><div class='description'><div class='short'>true to disable animations. ...</div><div class='long'><p><code>true</code> to disable animations.</p>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='cfg-duration' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-duration' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-duration' class='name expandable'>duration</a><span> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span></div><div class='description'><div class='short'>Time in milliseconds for the animation to last. ...</div><div class='long'><p>Time in milliseconds for the animation to last.</p>\n<p>Defaults to: <code>250</code></p></div></div></div><div id='cfg-easing' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-easing' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-easing' class='name expandable'>easing</a><span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span></div><div class='description'><div class='short'>Valid values are 'ease', 'linear', ease-in', 'ease-out', 'ease-in-out', or a cubic-bezier curve as defined by CSS. ...</div><div class='long'><p>Valid values are 'ease', 'linear', ease-in', 'ease-out', 'ease-in-out', or a cubic-bezier curve as defined by CSS.</p>\n<p>Defaults to: <code>'ease-in-out'</code></p></div></div></div><div id='cfg-from' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-from' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-from' class='name expandable'>from</a><span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span></div><div class='description'><div class='short'>An object of CSS values which the animation begins with. ...</div><div class='long'><p>An object of CSS values which the animation begins with. If you define a CSS property here, you must also\ndefine it in the <a href=\"#!/api/Ext.Anim-cfg-to\" rel=\"Ext.Anim-cfg-to\" class=\"docClass\">to</a> config.</p>\n<p>Defaults to: <code>{}</code></p></div></div></div><div id='cfg-out' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-out' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-out' class='name expandable'>out</a><span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span></div><div class='description'><div class='short'>true if you want the animation to slide out of the screen. ...</div><div class='long'><p><code>true</code> if you want the animation to slide out of the screen.</p>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-reverse' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-reverse' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-reverse' class='name expandable'>reverse</a><span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span></div><div class='description'><div class='short'>true to reverse the animation direction. ...</div><div class='long'><p><code>true</code> to reverse the animation direction. For example, if the animation direction was set to 'left', it would\nthen use 'right'.</p>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='cfg-scope' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-scope' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-scope' class='name not-expandable'>scope</a><span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span></div><div class='description'><div class='short'><p>Scope to run the <a href=\"#!/api/Ext.Anim-cfg-before\" rel=\"Ext.Anim-cfg-before\" class=\"docClass\">before</a> function in.</p>\n</div><div class='long'><p>Scope to run the <a href=\"#!/api/Ext.Anim-cfg-before\" rel=\"Ext.Anim-cfg-before\" class=\"docClass\">before</a> function in.</p>\n</div></div></div><div id='cfg-to' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-cfg-to' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-cfg-to' class='name expandable'>to</a><span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span></div><div class='description'><div class='short'>An object of CSS values which the animation ends with. ...</div><div class='long'><p>An object of CSS values which the animation ends with. If you define a CSS property here, you must also\ndefine it in the <a href=\"#!/api/Ext.Anim-cfg-from\" rel=\"Ext.Anim-cfg-from\" class=\"docClass\">from</a> config.</p>\n<p>Defaults to: <code>{}</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-defaultConfig' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-property-defaultConfig' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-property-defaultConfig' class='name expandable'>defaultConfig</a><span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>{from: {}, to: {}, duration: 250, delay: 0, easing: 'ease-in-out', autoClear: true, out: true, direction: null, reverse: false}</code></p></div></div></div><div id='property-isAnim' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-property-isAnim' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-property-isAnim' class='name expandable'>isAnim</a><span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>true</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/Ext.Anim-method-constructor' class='name expandable'>Ext.Anim</a>( <span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> config</span> )<strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>config</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-initConfig' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-method-initConfig' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-method-initConfig' class='name expandable'>initConfig</a>( <span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> el, <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> runConfig</span> )<strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>el</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li><li><span class='pre'>runConfig</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-onTransitionEnd' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-method-onTransitionEnd' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-method-onTransitionEnd' class='name expandable'>onTransitionEnd</a>( <span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> ev, <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> el, <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> o</span> )<strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>ev</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li><li><span class='pre'>el</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li><li><span class='pre'>o</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-run' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Ext.Anim'>Ext.Anim</span><br/><a href='source/Anim.html#Ext-Anim-method-run' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Ext.Anim-method-run' class='name expandable'>run</a>( <span class='pre'><a href=\"#!/api/Ext.dom.Element\" rel=\"Ext.dom.Element\" class=\"docClass\">Ext.Element</a>/HTMLElement el, <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a> anim, <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> config</span> )</div><div class='description'><div class='short'>Used to run an animation on a specific element. ...</div><div class='long'><p>Used to run an animation on a specific element. Use the config argument to customize the animation.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>el</span> : <a href=\"#!/api/Ext.dom.Element\" rel=\"Ext.dom.Element\" class=\"docClass\">Ext.Element</a>/HTMLElement<div class='sub-desc'><p>The element to animate.</p>\n</div></li><li><span class='pre'>anim</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The animation type, defined in <a href=\"#!/api/Ext.anims\" rel=\"Ext.anims\" class=\"docClass\">Ext.anims</a>.</p>\n</div></li><li><span class='pre'>config</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>The config object for the animation.</p>\n</div></li></ul></div></div></div></div></div></div></div>","inheritdoc":null,"enum":null,"id":"class-Ext.Anim","mixedInto":[],"meta":{}});