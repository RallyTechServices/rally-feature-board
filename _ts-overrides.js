/*
 * Modify the building of columns based on release instead of a string drop-down
 */

Ext.override(Rally.ui.cardboard.CardBoard,{

    _buildColumnsFromModel: function() {
        var me = this;
        var model = this.models[0];
        if (model) {
            if ( this.attribute === "Release" ) { 
                var retrievedColumns = [];
                retrievedColumns.push({
                    
                    value: null,
                    columnHeaderConfig: {
                        headerTpl: "{name}",
                        headerData: {
                            name: "Backlog"
                        }
                    }
                });
                
                var today_iso = Rally.util.DateTime.toIsoString(new Date(),false);
                var filters = [{property:'ReleaseDate',operator:'>',value:today_iso}];
                
                Ext.create('Rally.data.WsapiDataStore',{
                    model:me.attribute,
                    autoLoad: true,
                    filters: filters,
                    sorters: [
                        {
                            property: 'ReleaseDate',
                            direction: 'ASC'
                        }
                    ],
                    limit: 3,
                    pageSize: 3,
                    fetch: ['Name','ReleaseStartDate','ReleaseDate','PlannedVelocity'],
                    listeners: {
                        load: function(store,records) {
                            Ext.Array.each(records, function(record){
                                var start_date = Rally.util.DateTime.formatWithNoYearWithDefault(record.get('ReleaseStartDate'));
                                var end_date = Rally.util.DateTime.formatWithNoYearWithDefault(record.get('ReleaseDate'));
                                var planned_velocity = record.get('PlannedVelocity') || 0;
                                
                                retrievedColumns.push({
                                    value: record.get('_ref'),
                                    _planned_velocity: planned_velocity,
                                    columnHeaderConfig: {
                                        headerTpl: "{name}<br/>{start_date} - {end_date}",
                                        headerData: {
                                            name: record.get('Name'),
                                            start_date: start_date,
                                            end_date: end_date,
                                            planned_velocity: planned_velocity
                                        }
                                    }
                                });
                            });
                            this.fireEvent('columnsretrieved',this,retrievedColumns);
                            this.columnDefinitions = [];
                            _.map(retrievedColumns,this.addColumn,this);
                            this._renderColumns();
                        },
                        scope: this
                    }
                });
                
            } else {
                var attribute = model.getField(this.attribute);
               
                if (attribute) {
                    attribute.getAllowedValueStore().load({
                        callback: function(records, operation, success) {
                            var retrievedColumns = [];
                            _.forEach(records, function(allowedValue) {
                                var value = allowedValue.get('StringValue');
                                if (!value && attribute.attributeDefinition.AttributeType.toLowerCase() === 'rating') {
                                    value = "None";
                                }
                                if (value.toLowerCase() !== 'null') {
                                    retrievedColumns.push({
                                        value: value,
                                        columnHeaderConfig: {
                                            headerTpl: value || 'None'
                                        }
                                    });
                                }
                            });
        
                            this.fireEvent('columnsretrieved', this, retrievedColumns);
        
                            this.columnDefinitions = [];
                            _.map(retrievedColumns, this.addColumn, this);
                            this._renderColumns();
                        },
                        scope: this
                    });
                }
            }
        }
    }
});

Ext.override(Rally.ui.cardboard.Card,{
    _setupPlugins: function() {
        var cardContentRightPlugin = {ptype: 'rallycardcontentright'};

        this.plugins.push(cardContentRightPlugin);
        this.plugins.push({ptype: 'rallycardcontentleft'});

        if (this.record.get('updatable')) {
            if (this.editable) {
                this.addCls('editable');
                this.plugins.push({ptype: 'rallycardediting'});

                var predicateFn = Rally.predicate.RecordPredicates.hasField('PlanEstimate');
                if (predicateFn(this.record) && Ext.Array.contains(this.getFields(), 'PlanEstimate')) {
                    cardContentRightPlugin.showPlanEstimate = true;
                }

                if (this.enableValidationUi) {
                    this.plugins.push({ptype: 'rallycardvalidation'});
                    this.plugins.push({ptype: 'rallycardvalidationui', notificationFieldNames: ['PlanEstimate']});
                }
            }

            if (this.showIconsAndHighlightBorder) {
                this.plugins.push({
                    ptype: 'rallycardicons',
                    showMenus: this.showIconMenus,
                    showColorPopover: this.showColorPopover
                });
            }
        }

        if (this.showAge > -1) {
            this.plugins.push({ptype: 'rallycardage'});
        }
        
        this.plugins.push({ptype:'tscardreleasealignment'});
    }
});