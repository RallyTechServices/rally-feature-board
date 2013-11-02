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
                    {ptype:'rallycolumndropcontroller'},
                    {ptype:'rallycardboardcardrecordprocessor'},
                    {ptype:'tscolumnheaderupdater'}  /*,
                    {ptype:'tscolumnheaderupdater', field_to_aggregate: 'LeafStoryPlanEstimateTotal'}*/
                ]
            },
            storeConfig:{ },
            cardConfig: {
                showIconsAndHighlightBorder: false,
                
                fields: [
                    'FormattedID',
                    'Name',
                    { name: 'Project', renderer: me._renderProject },
                    'State',
                    { name: 'PercentDoneByStoryPlanEstimate' },
                    { name: 'c_FeatureEstimate', fetch: ['c_FeatureEstimate'] }
                ],
                listeners: {
                    added: function(card,container){
                        me.logger.log(this,card,container);
                    },
                    fieldClick: function(eOpts) {
                        me.logger.log(this,eOpts);
                        if ( eOpts == "PercentDoneByStoryPlanEstimate" ) {
                            me._showDoneTooltip(eOpts,this);
                        }
                    }
                }
            }
        });
        
        this.add(this.cardboard);
        
    },
    _showDoneTooltip:function(field_name,card) {
        var me = this;
        var record = card.getRecord();
        var progress = card.getEl().down('.progress-bar-container');
        me.logger.log("record", record.data);
        
        Ext.create('Rally.ui.popover.PercentDonePopover', {
            target: progress,
            percentDoneData: record.data,
            percentDoneName: field_name,
            piRef: record.data._ref
        });
    },
    _renderProject: function(value) {
        return value.get('Name');
    }
});
