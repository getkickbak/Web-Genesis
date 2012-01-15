Ext.define('Genesis.controller.QrCodeDisplay', {
   extend : 'Genesis.controller.ControllerBase',
   requires : [
   'Genesis.view.QRCodeDisplayMode', 'Genesis.view.QRCodeScanMode',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics : {
      challenges_path : '/qrcode'
   },
   xtype : 'qrCodeCntlr',
   config : {
   },
   views : ['QRCodeDisplayMode', 'QRCodeScanMode'],
   init : function()
   {
      this.callParent(arguments);
      this.control({
         'img[cls=qrcode]' : {
            tap : this.onQrCodeTap
         }
      });
   },
   onQrCodeTap : function()
   {
   }
});
