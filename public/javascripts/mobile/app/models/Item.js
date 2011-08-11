Ext.data.ProxyMgr.registerType("itemstorage",
Ext.extend(Ext.data.Proxy,
{
   create: function(operation, callback, scope)
   {
   },
   read: function(operation, callback, scope)
   {
      var thisProxy = this;
      var createItems = function(deviceItems)
      {
         //loop over deviceItems and create Item model instances
         var items = [];
         for (var i = 0; i < deviceItems.length; i++)
         {
            var deviceItem = deviceItems[i];
            var item = new thisProxy.model(
            {
               id: deviceItem.id,
               givenName: deviceItem.name.givenName,
               familyName: deviceItem.name.familyName,
               emails: deviceItem.emails,
               phoneNumbers: deviceItem.phoneNumbers
            });
            item.deviceItem = deviceItem;
            items.push(item);
         }
         //return model instances in a result set
         operation.resultSet = new Ext.data.ResultSet(
         {
            records: items,
            total  : items.length,
            loaded : true
         });
         //announce success
         operation.setSuccessful();
         operation.setCompleted();
         //finish with callback
         if (typeof callback == "function")
         {
            callback.call(scope || thisProxy, operation);
         }
      }
      if (Ext.is.Desktop)
      {
         /*
          createItems([
          {
          id : 1,
          name :
          {
          givenName:'abc',
          familyName:'ABC'
          },
          emails: [
          {
          type:'Primary Email',
          value :'abc@gmail.com'
          }],
          phoneNumbers: [
          {
          type:'Cell',
          value:'555-123-4567'
          }]
          },
          {
          id : 2,
          name :
          {
          givenName:'def',
          familyName:'DEF'
          },
          emails: [
          {
          type:'Primary Email',
          value :'def@gmail.com'
          }],
          phoneNumbers: [
          {
          type:'Cell',
          value :'555-234-5678'
          }]
          },
          {
          id : 3,
          name :
          {
          givenName:'ghi',
          familyName:'GHI'
          },
          emails: [
          {
          type:'Primary Email',
          value :'ghi@gmail.com'
          }],
          phoneNumbers: [
          {
          type:'Cell',
          value :'555-345-6789'
          }]
          },
          {
          id : 4,
          name :
          {
          givenName:'jkl',
          familyName:'JKL'
          },
          emails: [
          {
          type:'Primary Email',
          value :'jkl@gmail.com'
          }],
          phoneNumbers: [
          {
          type:'Cell',
          value :'555-456-7890'
          }]
          },
          {
          id : 5,
          name :
          {
          givenName:'mno',
          familyName:'MNO'
          },
          emails: [
          {
          type:'Primary Email',
          value :'mno@gmail.com'
          }],
          phoneNumbers: [
          {
          type:'Cell',
          value :'555-567-8901'
          }]
          }]);
          */
      }
      else
      {
         navigator.service.items.find(
         ['id', 'name', 'emails', 'phoneNumbers', 'addresses'], createItems, function()
         {
         },
         {
            limit:100
         }
         );
      }
   },
   update: function(operation, callback, scope)
   {
      operation.setStarted();
      //put model data back into deviceItem
      var deviceItem = operation.records[0].deviceContacts;
      var item = operation.records[0].data;
      deviceItem.name.givenName = item.givenName;
      deviceItem.name.familyName = item.familyName;
      //save back via PhoneGap
      var thisProxy = this;
      deviceItem.save( function()
      {
         //announce success
         operation.setCompleted();
         operation.setSuccessful();
         //finish with callback
         if (typeof callback == 'function')
         {
            callback.call(scope || thisProxy, operation);
         }
      });
   },
   destroy: function(operation, callback, scope)
   {
   }
})
);

app.models.Item = Ext.regModel("app.models.Item",
{
   fields: [
   {
      name: "id",
      type: "int"
   },
   {
      name: "givenName",
      type: "string"
   },
   {
      name: "familyName",
      type: "string"
   },
   {
      name: "emails",
      type: "auto"
   },
   {
      name: "phoneNumbers",
      type: "auto"
   },
   ],
   proxy :
   {
      type: 'rest',
      url: '/item',
      format: 'json',
      reader:
      {
         type: 'json',
         root: 'data'
         //,record: 'item'
      }
   }
   /*
    proxy:
    {
    type: "itemstorage"
    }
    */
});

app.models.Author = Ext.regModel("app.models.Author",
{
   fields: [
   'id','name', 'photo'
   ]
});

app.models.Item1 = Ext.regModel("app.models.Item1",
{
   fields: [
   {
      name : 'author_id',
      type : 'int'
   },
   {
      name: "url",
      type: "string"
   },
   {
      name: "desc",
      type: "string"
   },
   {
      name: "name",
      type: "string"
   },
   {
      name: "timeStamp",
      type: "date"
   },
   {
      name: "address",
      type: "string"
   },
   ],
   belongsTo  :
   [{
      model: 'app.models.Author',
      associationKey: 'author'
   }]
});

app.stores.items = new Ext.data.Store(
{
   model: "app.models.Item",
   sorters: 'familyName',
   getGroupString : function(record)
   {
      return record.get('familyName')[0];
   }
});

app.stores.items1 = new Ext.data.Store(
{
   model: 'app.models.Item1',
   data : [
   {
      id : 0,
      url: 'resources/img/photo1.PNG',
      desc : 'This is a Hamburger',
      name : 'Cupcakes',
      author_id : 3,
      author :
      {
         id : 3,
         name : 'Cindy',
         photo : 'resources/img/photo1.PNG'
      },
      timeStamp : new Date(),
      address : 'Toronto, ON M5H 1A1'
   },
   {
      id : 1,
      url: 'resources/img/photo1.PNG',
      desc : 'This is a Cheeseburger',
      name : 'Cupcakes1',
      author_id : 4,
      timeStamp : new Date(),
      address : 'Toronto, ON M5H 1A1'
   },
   {
      id : 2,
      url: 'resources/img/photo1.PNG',
      desc : 'This is a IceCream',
      name : 'Cupcakes2',
      author_id : 5,
      timeStamp : new Date(),
      address : 'Toronto, ON M5H 1A1'
   }
   ]
});

app.stores.items2 = new Ext.data.Store(
{
   model: 'app.models.Item1'
});