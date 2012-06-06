Ext.define('Genesis.view.client.UploadPhotosPage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.form.Panel', 'Ext.field.TextArea'],
   alias : 'widget.clientuploadphotospageview',
   scrollable : 'vertical',
   config :
   {
      cls : 'photoUploadPage',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Photo Upload',
         items : [
         {
            align : 'right',
            tag : 'post',
            text : 'Post'
         }]
      })]
   },
   showView : function()
   {
      this.callParent(arguments);

      console.debug("Rendering [" + this.metaData['photo_url'] + "]");
      this.query('container[tag=background]')[0].element.dom.style.cssText += 'background-image:url(' + this.metaData['photo_url'] + ');'
      delete this.metaData;
   },
   createView : function()
   {
      this.setPreRender(this.getPreRender().concat([
      // Uploaded Image
      photo = Ext.create('Ext.Container',
      {
         flex : 1,
         xtype : 'container',
         tag : 'background',
         cls : 'background'
      }),
      // Display Comment
      Ext.create('Ext.field.TextArea',
      {
         xtype : 'textareafield',
         bottom : 0,
         left : 0,
         right : 0,
         name : 'desc',
         tag : 'desc',
         cls : 'desc',
         autoComplete : true,
         defaultUnit : 'em',
         minHeight : '2',
         autoCorrect : true,
         autoCapitalize : true,
         maxLength : 256,
         maxRows : 4,
         placeHolder : 'Please enter your photo description',
         clearIcon : false
      })]));
   }
});
