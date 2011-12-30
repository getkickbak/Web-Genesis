Ext.define('Kitchensink.view.Video', {
    extend: 'Ext.Container',
    requires: [
        'Ext.Video'
    ],
    config: {
        layout: 'fit',
        items: [{
            xtype: 'video',
            url: Ext.Loader.getPath("Kitchensink")+"/../"+'../video/space.mp4',
            loop: true,
            posterUrl: Ext.Loader.getPath("Kitchensink")+"/../"+'../video/Screenshot.png'
        }]
    }
});
