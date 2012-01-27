Ext.define('Genesis.controller.QrCodeDisplay',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Genesis.view.QRCodeDisplayMode', 'Genesis.view.QRCodeScanMode',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics :
   {
      challenges_path : '/qrcode'
   },
   xtype : 'qrCodeCntlr',
   config :
   {
      refs :
      {
      },
      control :
      {
         'img[cls=qrcode]' :
         {
            tap : this.onQrCodeTap,
         }
      }
   },
   init : function()
   {
      this.callParent(arguments);
   },
   onQrCodeTap : function()
   {
   }
});
