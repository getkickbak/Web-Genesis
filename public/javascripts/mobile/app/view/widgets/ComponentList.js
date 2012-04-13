Ext.define('Genesis.view.widgets.ComponentList',
{
   alternateClassName : 'Genesis.ComponentList',
   extend : 'Ext.dataview.List',
   xtype : 'componentlist',
   requires : ['Genesis.view.widgets.ComponentListItem'],
   initialize : function()
   {
      var me = this, container;

      me.on(me.getTriggerCtEvent(), me.onContainerTrigger, me);
      container = me.container = this.add(new Genesis.view.widgets.ComponentListItem(
      {
         baseCls : this.getBaseCls()
      }));
      container.dataview = me;

      me.on(me.getTriggerEvent(), me.onItemTrigger, me);

      container.element.on(
      {
         delegate : '.' + this.getBaseCls() + '-disclosure',
         tap : 'handleItemDisclosure',
         scope : me
      });

      container.on(
      {
         itemtouchstart : 'onItemTouchStart',
         itemtouchend : 'onItemTouchEnd',
         itemtap : 'onItemTap',
         itemtaphold : 'onItemTapHold',
         itemtouchmove : 'onItemTouchMove',
         itemsingletap : 'onItemSingleTap',
         itemdoubletap : 'onItemDoubleTap',
         itemswipe : 'onItemSwipe',
         scope : me
      });

      if(this.getStore())
      {
         this.refresh();
      }
   }
});
