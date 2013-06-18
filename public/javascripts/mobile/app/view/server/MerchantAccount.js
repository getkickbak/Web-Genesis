Ext.define('Genesis.view.server.MerchantAccount',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.servermerchantaccountview',
   config :
   {
      tag : 'merchantMain',
      cls : 'merchantMain viewport',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   disableAnimation : true,
   loadingText : 'Loading ...',
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function(activeItem)
   {
      if (activeItem.isXType('mainpageview', true))
      {
         this.removeAll(true);
      }
      this.callParent(arguments);
   },
   showView : function()
   {
      this.callParent(arguments);
      for (var i = 0; i < this.getInnerItems().length; i++)
      {
         this.getInnerItems()[i].setVisibility(true);
      }
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      me.setPreRender(me.getPreRender().concat([
      // -----------------------------------------------------------------------
      // Merchant Photos and Customer Points
      // -----------------------------------------------------------------------
      Ext.create('Ext.dataview.DataView',
      {
         tag : 'tbPanel',
         xtype : 'dataview',
         store : 'MerchantRenderStore',
         useComponents : true,
         scrollable : undefined,
         minHeight : window.innerWidth,
         defaultType : 'merchantaccountptsitem',
         defaultUnit : 'em',
         margin : '0 0 0.7 0'
      }), Ext.create('Ext.form.Panel',
      {
         xtype : 'formpanel',
         margin : '0 0.8 0.7 0.8',
         defaultUnit : 'em',
         scrollable : null,
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'fieldset',
            title : 'Account Profile',
            //instructions : 'Tell us all about yourself',
            defaults :
            {
               labelWidth : '50%',
               readOnly : true,
               required : false
            },
            items : [
            {
               xtype : 'textfield',
               name : 'tagid',
               clearIcon : false,
               label : "Tag ID",
               value : ' '
            },
            {
               xtype : 'textfield',
               cls : 'halfHeight',
               labelWidth : '100%',
               name : 'user',
               label : "John Smith" + "<br/>" + "<label>johnsmith@example.com</label>",
               value : ' '
            },
            {
               xtype : 'datepickerfield',
               labelWidth : '30%',
               label : 'Birthday',
               name : 'birthday',
               dateFormat : 'M j',
               picker :
               {
                  yearFrom : 1913,
                  doneButton :
                  {
                     ui : 'normal'
                  }
               },
               value : 0
            }, Ext.applyIf(
            {
               labelWidth : '30%',
               placeHolder : '',
               label : 'Phone #',
               name : 'phone',
               required : false
            }, Genesis.view.ViewBase.phoneField())]
         }]
      })]));
      //console.debug("minWidth[" + window.innerWidth + "], minHeight[" + window.innerHeight + "]");
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         if (!type.value)
         {
            return Genesis.constants.getIconPath('miscicons', 'pushnotification');
         }
         else
         {
         }
      }
   }
});
