Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.logger(),
    launch: function() {
        var me = this;
        this.cardboard = Ext.create('Rally.ui.cardboard.CardBoard',{
            types: ['PortfolioItem/Feature'],
            attribute: 'Release',
            columnConfig: {
                xtype: 'rallycardboardcolumn',
                displayField: 'Name',
                valueField: '_ref',
                plugins: [
                    {ptype: 'rallycolumndropcontroller'},
                    {ptype: 'rallycardboardcardrecordprocessor'},
                    {ptype:'tscolumnheaderupdater'}
                ]
            },
            storeConfig:{ },
            cardConfig: {
                showIconsAndHighlightBorder: false,
                fields: [
                    'FormattedID',
                    'Name',
                    { name: 'c_FeatureEstimate', fetch: ['c_FeatureEstimate'] }
                ],
                listeners: {
                    added: function(card,container){
                        me.logger.log(this,card,container);
                    }
                }
            }
        });
        this.add(this.cardboard);
    }
});
