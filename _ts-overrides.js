Ext.override(Rally.ui.cardboard.CardBoard,{
    /**
     * Create a Rally.ui.cardboard.Column object and add it to the list of columns in the cardboard
     * @param {Object} columnConfig A config object for the column
     * @param {Number} index The index to insert the column.  Defaults to the end of the columns list.
     * @return {Rally.ui.cardboard.Column} column
     */
    addColumn: function(columnConfig, index) {
        console.log(columnConfig);
        var column = this._createColumnDefinition(columnConfig);
        Ext.Array.insert(this.columnDefinitions, Ext.isNumber(index) ? index : this.columnDefinitions.length, [column]);
        return column;
    },
        
    _buildColumnsFromModel: function() {
        var me = this;
        var model = this.models[0];
        if (model) {
            if ( this.attribute === "Release" ) { 
                var retrievedColumns = [];
                retrievedColumns.push({
                    value: null,
                    columnHeaderConfig: {
                        headerTpl: "Backlog"
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
                    fetch: ['Name','ReleaseStartDate','ReleaseDate'],
                    listeners: {
                        load: function(store,records) {
                            Ext.Array.each(records, function(record){
                                var date_range = Rally.util.DateTime.formatWithNoYearWithDefault(record.get('ReleaseStartDate')) +
                                    " - " + 
                                    Rally.util.DateTime.formatWithNoYearWithDefault(record.get('ReleaseDate'));
                                retrievedColumns.push({
                                    value: record.get('_ref'),
                                    columnHeaderConfig: {
                                        headerTpl: record.get('Name') + "<br/>" + date_range
                                    }
                                });
                            });
                            console.log(retrievedColumns);
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