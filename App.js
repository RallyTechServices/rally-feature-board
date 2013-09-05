Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.logger(),
    launch: function() {
        this.cardboard = Ext.create('Rally.ui.cardboard.CardBoard',{
            types: ['PortfolioItem/Feature'],
            attribute: 'Release',
            columnConfig: {
                xtype: 'rallycardboardcolumn',
                displayField: 'Name',
                valueField: '_ref'
            },
            storeConfig:{ },
            cardConfig: {
                showIconsAndHighlightBorder: false
            }
        });
        this.add(this.cardboard);
        this.logger.log(this,"here");
    }
});
