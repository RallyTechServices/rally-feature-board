Ext.define('Rally.ui.cardboard.plugin.ReleaseAlignment', {
        extend: 'Ext.AbstractPlugin',
        alias: 'plugin.tscardreleasealignment',

        inheritableStatics: {

        },

        init: function(cmp) {
            this.callParent(arguments);
            this._addField();
        },

        _addField: function() {
            var me = this;
            var record = this.cmp.getRecord();
            var cmp = this.cmp;
            
            cmp.addField({
                name: "Release",
                renderTpl: function() {
                    me._findAlignment(cmp,record);
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
        _findAlignment: function(cmp,feature) {
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
                        load: function(store,records) {
                            var html = "";
                            if ( records.length > 0 ) {
                                html = "<span class='status-warn'>" + records.length + "</span>";
                            } 
                            Ext.query('#' + feature_fid + '-releasealignment')[0].innerHTML = html;
                        }
                    }
                });
            }
            return true;
        }
    });