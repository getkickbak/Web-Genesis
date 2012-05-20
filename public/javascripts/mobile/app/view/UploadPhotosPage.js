Ext.define('Genesis.view.UploadPhotosPage',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.form.Panel', 'Ext.field.TextArea'],
   alias : 'widget.uploadphotospageview',
   scrollable : 'vertical',
   config :
   {
      cls : 'photoUploadPage',
      changeTitle : false,
      title : 'Photo Upload',
      layout : 'fit',
      items : [
      {
         xtype : 'component',
         tag : 'background',
         cls : 'background'
      },
      // Display Comment
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
      }]
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      activeItem.query('textareafield')[0].reset();
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
   },
   afterActivate : function(activeItem, oldActiveItem)
   {
   },
   afterDeactivate : function(activeItem, oldActiveItem)
   {
   }
});
