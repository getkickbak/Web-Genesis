Ext.define('Genesis.view.widgets.Calculator',
{
   extend : 'Ext.Container',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.calculator',
   config :
   {
      title : null,
      bottomButtons : null,
      placeHolder : '0',
      hideZero : false,
      cls : 'calculator',
      layout : 'fit',
      // -------------------------------------------------------------------
      // Reward Calculator
      // -------------------------------------------------------------------
      items : [
      {
         docked : 'top',
         xtype : 'toolbar',
         centered : false,
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            xtype : 'title',
            title : ' '
         },
         {
            xtype : 'spacer',
            align : 'right'
         }]
      },
      {
         docked : 'top',
         xtype : 'textfield',
         name : 'amount',
         value : '',
         clearIcon : false,
         placeHolder : ' ',
         readOnly : true,
         required : true
      },
      {
         xtype : 'container',
         layout : 'vbox',
         tag : 'dialpad',
         cls : 'dialpad',
         defaults :
         {
            xtype : 'container',
            layout : 'hbox',
            flex : 1,
            defaults :
            {
               xtype : 'button',
               flex : 1
            }
         },
         items : [
         {
            items : [
            {
               text : '1'
            },
            {
               text : '2'
            },
            {
               text : '3'
            }]
         },
         {
            items : [
            {
               text : '4'
            },
            {
               text : '5'
            },
            {
               text : '6'
            }]
         },
         {
            items : [
            {
               text : '7'
            },
            {
               text : '8'
            },
            {
               text : '9'
            }]
         },
         {
            items : [
            {
               text : 'AC'
            },
            {
               tag : 'zero',
               flex : 2.3,
               text : '0'
            }]
         }]
      },
      {
         cls : 'bottomButtons',
         xtype : 'container',
         tag : 'bottomButtons',
         docked : 'bottom',
         layout : 'hbox',
         defaults :
         {
            xtype : 'button',
            flex : 1
         }
      }]
   },
   initialize : function()
   {
      var me = this;
      var title = me.query('title')[0];
      var textField = me.query('textfield')[0];
      var buttons = me.query('container[tag=bottomButtons]')[0];

      title.setTitle(me.getTitle());
      textField.setPlaceHolder(me.getPlaceHolder());
      buttons.add(me.getBottomButtons());

      if (me.getHideZero())
      {
         var btn = me.query("button[tag=zero]")[0];
         btn.getParent().remove(btn);
      }
   }
});
