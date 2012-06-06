Ext.define('Genesis.view.client.UploadPhotosPage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.form.Panel', 'Ext.field.TextArea'],
   alias : 'widget.clientuploadphotospageview',
   scrollable : 'vertical',
   config :
   {
      cls : 'photoUploadPage',
      layout : 'fit',
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
   createView : function()
   {
      this.getPreRender() = this.getPreRender().concat([
      // Uploaded Image
      Ext.create('Ext.Component',
      {
         xtype : 'component',
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
         style : 'background-image:url(' + this.metaData['photo_url'] + ')',
         autoComplete : true,
         defaultUnit : 'em',
         minHeight : '2',
         autoCorrect : true,
         autoCapitalize : true,
         maxLength : 256,
         maxRows : 4,
         placeHolder : 'Please enter your photo description',
         clearIcon : false
      })]);
      delete this.metaData;
   }
});
