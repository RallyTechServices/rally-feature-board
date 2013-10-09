Ext.define('Rally.ui.cardboard.plugin.ReleaseAlignment', {
        extend: 'Ext.AbstractPlugin',
        alias: 'plugin.tscardreleasealignment',

        init: function(cmp) {
            this.callParent(arguments);
            this._addField();
        },

        _addAlignmentClickListener: function() {
            var element_id = this.cmp.record.get('FormattedID') + '-releasealignment';
            var marker = Ext.query('#'+element_id);
            if ( marker.length > 0 ){
                Ext.get(marker[0]).on('click',this._showPopover,this);
            }
        },
        
        _showPopover: function() {
            var me = this;
            var count = this.cmp.record.get('UnalignedStories');
            
            if ( count > 0 ) {
                if ( this.popover ) { this.popover.destroy(); }
                this.popover = Ext.create('Rally.ui.popover.Popover',{
                    target: me.cmp.getEl(),
                    items: [ me._getPopoverContents() ]
                });
                 
                this.popover.show();
            }
        },
        
        _releaseGridRenderer: function(value) {
            if ( value && typeof( value ) == "object" ) {
                return value._refObjectName;
            } else {
                return value;
            }
        },
        
        _storyLinkRenderer: function(value,meta,record) {
            return Rally.nav.DetailLink.getLink({
                showHover: false,
                record:record.getData(),
                text:record.get("FormattedID")
            });
        },
        
        _getPopoverContents: function() {
            var me = this;
            var record = this.cmp.record;
            var store = Ext.create('Rally.data.WsapiDataStore',{
                model:'UserStory',
                filters: [
                    {property:'Feature.ObjectID', value: record.get('ObjectID') },
                    {property:'DirectChildrenCount',value:0 }
                ],
                context: null,
                autoLoad: true,
                pageSize: 5
            });
            var grid = Ext.create('Rally.ui.grid.Grid',{
                store: store,
                
                columnCfgs: [
                    {text:'id',dataIndex:'FormattedID',renderer: me._storyLinkRenderer},
                    {text:'Name',dataIndex:'Name'},
                    {text:'Size',dataIndex:'PlanEstimate'},
                    {text:'Release',dataIndex:'Release',renderer: me._releaseGridRenderer,editor:'rallyreleasecombobox'},
                    {text:'State',dataIndex:'ScheduleState'}
                ],
                pagingToolbarCfg: {
                     pageSizes: [5, 10, 25]
                }
                
            });
            
            
            return grid;
        },
        _addField: function() {
            var me = this;
            var record = this.cmp.getRecord();
            var cmp = this.cmp;
            
            cmp.addField({
                name: "Release",
                renderTpl: function() {
                    me._findAlignment();
                    return [
                        '<div id="' + record.get('FormattedID') + '-releasealignment">',
                            '',
                        '</div>'
                    ].join('');
                    
                },
                isStatus: false
            });
        },

        //TODO: stop calling it a feature
        _findAlignment: function() {
            var me = this;
            var feature = this.cmp.getRecord();
            
            var release = feature.get('Release');
            var feature_fid = feature.get('FormattedID');
            
            if ( release ) {
                var filters = [
                    {property:'Feature.FormattedID',value: feature_fid},
                    {property:'Release.Name',operator:'!=',value:release.Name},
                    {property:'DirectChildrenCount',value:0}
                ];
                Ext.create('Rally.data.WsapiDataStore',{
                    autoLoad: true,
                    model:'UserStory',
                    filters:filters,
                    listeners: {
                        load: function(store,records,operation) {
                            var html = "";
                            var out_of_sync_total = 0;
                            if ( records.length > 0 ) {
                                html = "# User Stories Not in Release: <span class='status-warn'>" + records.length + "</span>";
                            } 
                            Ext.query('#' + feature_fid + '-releasealignment')[0].innerHTML = html;
                            
                            Ext.Array.each( records, function(record) {
                                var estimate = record.get('PlanEstimate') || 0;
                                out_of_sync_total += parseFloat(estimate,10);
                            });
                            me.cmp.record.set('UnalignedStories',records.length);
                            me.cmp.record.set('UnalignedStoriesPlanEstimateTotal',out_of_sync_total);
                            me.cmp.fireEvent('datachanged', me.cmp, records, operation);
                            me._addAlignmentClickListener();
                        }
                    }
                });
            }
            return true;
        }
    });