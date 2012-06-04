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
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Photo Upload',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'right',
            tag : 'post',
            text : 'Post'
         }]
      }]
   },
   showView : function()
   {
      this.add(
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
      });
   }
});
