
Ext.define('Rally.technicalservices.plugin.ColumnHeaderUpdater', {
    alias: 'plugin.tscolumnheaderupdater',
    extend: 'Ext.AbstractPlugin',

    config: {
        /**
         * 
         * @type {String} The name of the field holding the card's estimate
         * 
         * Defaults to c_FeatureEstimate (try LeafStoryPlanEstimateTotal)
         */
        field_to_aggregate: "c_FeatureEstimate",
        
        /**
         * @property {Number} The current count of feature estimates
         */
        total_feature_estimate: 0,

        /**
         * @property {String|Ext.XTemplate} the header template to use 
         */
        headerTpl: new Rally.technicalservices.template.LabeledProgressBarTemplate({
            fieldLabel: 'Features Planned vs Planned Velocity: ',
            calculateColorFn: function(data) {
                if ( data.percentDone > 0.9 ) {
                    return '#EDB5B1';
                } 
                return '#99CCFF';
            },
            showDangerNotificationFn: function(data) {
                return data.missing_estimate;
            },
            generateLabelTextFn: function(data) {
                if ( data.percentDone === -1 ) {
                    return "No Planned Velocity";
                } else {
                    var text_string = "";
                    if ( data.field_to_aggregate === "c_FeatureEstimate" ) {
                        text_string = this.calculatePercent(data) + '%';
                    } else {
                        text_string = 'By Story: ' + this.calculatePercent(data) + '%';
                    }
                    
                    return text_string;
                }
            }
        })
        //headerTpl: '<div class="wipLimit">({total_feature_estimate} of {planned_velocity})</div>'
    },

    constructor: function(config) {
        this.callParent(arguments);
        if(Ext.isString(this.headerTpl)) {
            this.headerTpl = Ext.create('Ext.XTemplate', this.headerTpl);
        }
        
    },

    init: function(column) {
        this.column = column;

        if ( column.value === null ) {
            this.headerTpl = new Ext.XTemplate('');
        }
        this.planned_velocity = this.column._planned_velocity;
        this.missing_estimate = this.column._missing_estimate;
        
        this.column.on('addcard', this.recalculate, this);
        this.column.on('removecard', this.recalculate, this);
        this.column.on('storeload', this.recalculate, this);
        this.column.on('afterrender', this._afterRender, this);
        this.column.on('ready', this.recalculate, this);
        this.column.on('datachanged', this.recalculate, this);

    },

    destroy: function() {
        if(this.column) {
            delete this.column;
        }
    },

    _afterRender: function() {
        if ( this.feature_estimate_container ) {
            this.feature_estimate_container.getEl().on('click', this._showPopover, this);
        }
    },
    
    recalculate: function() {
        this.total_feature_estimate = this.getTotalFeatureEstimate();
        this.refresh();
    },

    refresh: function() {
        var me = this;
        if (this.feature_estimate_container) {
            this.feature_estimate_container.update(this.headerTpl.apply(this.getHeaderData()));
        } else {
            this.feature_estimate_container = Ext.widget({
                xtype: 'container',
                html: this.headerTpl.apply(this.getHeaderData())
            });
            
            this.column.getColumnHeader().getHeaderTitle().add(this.feature_estimate_container);
        }
        
        if ( this.feature_estimate_container ) {
            this.feature_estimate_container.getEl().on('click', this._showPopover, this);
        }
    },

    _showPopover: function() {
        var me = this;
        if ( me.planned_velocity > 0 ) {
            if ( this.popover ) { this.popover.destroy(); }
            this.popover = Ext.create('Rally.ui.popover.Popover',{
                target: me.column.getColumnHeader().getHeaderTitle().getEl(),
                items: [ me.getSummaryGrid() ]
            });
            
            this.popover.show();
        }
    },
    
    getSummaryGrid: function() {
        var me = this;
        var estimate_title = "Feature Estimates";
        if ( this.field_to_aggregate !== "c_FeatureEstimate") {
            estimate_title = "Story Estimates";
        }
        var store = Ext.create('Rally.data.custom.Store',{
            data: [
                {
                    'PlannedVelocity': me.planned_velocity,
                    'TotalEstimate': me.getTotalFeatureEstimate(),
                    'Remaining': me.getCapacity(),
                    'MissingEstimate': me.missing_estimate
                }
            ]
        });
        var grid = Ext.create('Rally.ui.grid.Grid',{
            store: store,
            columnCfgs: [
                { text: 'Release Plan', dataIndex:'PlannedVelocity' },
                { text: estimate_title, dataIndex: 'TotalEstimate' },
                { text: 'Remaining', dataIndex: 'Remaining' },
                { text: 'Team Missing Plan?', dataIndex: 'MissingEstimate' }
            ],
            showPagingToolbar: false
        });
        return grid;
    },
    
    getHeaderData: function() {
        var total_feature_estimate = this.getTotalFeatureEstimate();
        var percent_done = -1;
        if ( this.planned_velocity > 0 ) {
            percent_done = total_feature_estimate / this.planned_velocity;
        }
        return {
            total_feature_estimate: total_feature_estimate,
            planned_velocity: this.planned_velocity,
            percentDone: percent_done,
            field_to_aggregate: this.field_to_aggregate,
            missing_estimate: this.missing_estimate
        };
    },
    
    getCapacity: function() {
        return this.planned_velocity - this.getTotalFeatureEstimate();
    },
    
    getTotalFeatureEstimate: function() {
        var me = this;
        var total = 0;
        var total_unaligned = 0;
        var records = this.column.getRecords();
        Ext.Array.each(records, function(record){
            var feature_estimate = record.get(me.field_to_aggregate) || 0;
            var unaligned_estimate = record.get('UnalignedStoriesPlanEstimateTotal') || 0;
            total += parseFloat(feature_estimate,10);
            total_unaligned += parseFloat(unaligned_estimate,10);
        });
        
        if ( me.field_to_aggregate !== "c_FeatureEstimate" ) {
            total = total - total_unaligned;
        }
        return total;
    }

});
