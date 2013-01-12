Ext.define('Genesis.view.client.SettingsPage',
{
   extend : 'Ext.form.Panel',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Genesis.view.widgets.ListField'],
   alias : 'widget.clientsettingspageview',
   config :
   {
      preRender : null,
      cls : 'viewport',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Settings',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Account Profile',
         //instructions : 'Tell us all about yourself',
         defaults :
         {
            labelWidth : '50%'
         },
         items : [
         {
            xtype : 'textfield',
            name : 'tagid',
            clearIcon : false,
            label : "Mobile Tag ID",
            value : ' ',
            readOnly : true
         },
         {
            xtype : 'textfield',
            cls : 'halfHeight',
            labelWidth : '100%',
            name : 'user',
            label : "John Smith" + "<br/>" + "<label>johnsmith@example.com</label>",
            value : ' ',
            required : false,
            readOnly : true
         },
         {
            xtype : 'datepickerfield',
            label : 'Birthday',
            name : 'birthday',
            required : false,
            picker :
            {
               yearFrom : 1913,
               doneButton :
               {
                  ui : 'normal'
               }
            },
            value : 0
         },
         {
            xtype : 'textfield',
            label : 'Phone#',
            labelWidth : '40%',
            name : 'phone',
            minLength : 12,
            maxLength : 12,
            placeHolder : '800-555-1234',
            required : false,
            listeners :
            {
               keyup : function(f, e, eOpts)
               {
                  var keyCode = e.browserEvent.keyCode;
                  var key = String.fromCharCode(keyCode);
                  var value = f.getValue();
                  if ((keyCode >= 48 && keyCode <= 90) || //
                  (keyCode >= 106 && keyCode <= 111) || //
                  (keyCode >= 186 && keyCode <= 192) || //
                  (keyCode >= 219 && keyCode <= 222))
                  {
                     if (key.match(/[0-9]/) && (!e.browserEvent.shiftKey && !e.browserEvent.ctrlKey && !e.browserEvent.metaKey))
                     {
                        if ((value.length == 3) || (value.length == 7))
                        {
                           f.setValue(value + "-");
                        }
                        else
                        if ((value.length == 4) || (value.length == 8))
                        {
                           var match = value.match(/-/);
                           if (!match)
                           {
                              f.setValue(value.slice(0, value.length - 1) + "-" + value[value.length - 1]);
                           }
                           else
                           {
                              switch (match.length)
                              {
                                 case 1:
                                 {
                                    if (value.length > 4)
                                    {
                                       f.setValue(value.slice(0, value.length - 1) + "-" + value[value.length - 1]);
                                    }
                                    break;
                                 }
                                 default:
                                    break;
                              }
                           }
                        }
                     }
                     else
                     {
                        f.setValue(value.slice(0, value.length - 1));
                     }
                  }
                  //console.debug("Phone#[" + f.getValue() + "]");
               }
            }
         },
         {
            xtype : 'togglefield',
            name : 'facebook',
            label : '<img src="' + //
            'resources/themes/images/' + Genesis.constants.themeName + '/' + 'facebook_icon.png" ' + //
            'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;"/>',
            value : 0
         },
         {
            xtype : 'listfield',
            name : 'changepassword',
            label : 'Change Password',
            value : ' '
         }]
      },
      {
         tag : 'accountUpdate',
         xtype : 'button',
         ui : 'orange-large',
         text : 'Submit'
      },
      {
         xtype : 'fieldset',
         title : 'About Kickbak',
         defaults :
         {
            labelWidth : '50%'
         },
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'textfield',
            label : 'Version ' + Genesis.constants.clientVersion,
            clearIcon : false,
            readOnly : true
         },
         {
            xtype : 'listfield',
            name : 'terms',
            label : 'Terms of Use',
            value : ' '
         },
         {
            xtype : 'listfield',
            name : 'privacy',
            label : 'Privacy',
            value : ' '
         }/*,
          {
          xtype : 'listfield',
          name : 'aboutus',
          label : 'About Us'
          value : ' '
          }*/]
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});
