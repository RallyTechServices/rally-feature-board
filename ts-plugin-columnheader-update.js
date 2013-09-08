
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
        headerTpl: new Rally.ui.renderer.template.progressbar.ProgressBarTemplate({
            calculateColorFn: function(data) {
                if ( data.percentDone > 0.9 ) {
                    return '#c00';
                } 
                return '#00c';
            },
            generateLabelTextFn: function(data) {
                if ( data.percentDone === -1 ) {
                    return "No Planned Velocity";
                } else {
                    if ( data.field_to_aggregate === "c_FeatureEstimate" ) {
                        return 'By Feature: ' + this.calculatePercent(data) + '%';
                    } else {
                        return 'By Story: ' + this.calculatePercent(data) + '%';
                    }
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
        this.planned_velocity = this.column._planned_velocity;
        
        this.column.on('addcard', this.recalculate, this);
        this.column.on('removecard', this.recalculate, this);
        this.column.on('storeload', this.recalculate, this);
        this.column.on('afterrender', this.recalculate, this);
        this.column.on('ready', this.recalculate, this);
    },

    destroy: function() {
        if(this.column) {
            delete this.column;
        }
    },

    recalculate: function() {
        this.total_feature_estimate = this.getTotalFeatureEstimate();
        this.refresh();
    },

    refresh: function() {
        if (this.feature_estimate_container) {
            this.feature_estimate_container.update(this.headerTpl.apply(this.getHeaderData()));
        } else {
            this.feature_estimate_container = Ext.widget({
                xtype: 'container',
                html: this.headerTpl.apply(this.getHeaderData())
            });

            this.column.getColumnHeader().getHeaderTitle().add(this.feature_estimate_container);
        }

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
            field_to_aggregate: this.field_to_aggregate 
        };
    },
    
    getTotalFeatureEstimate: function() {
        var me = this;
        var total = 0;
        var records = this.column.getRecords();
        Ext.Array.each(records, function(record){
            var feature_estimate = record.get(me.field_to_aggregate) || 0;
            total += parseFloat(feature_estimate,10);
        });
        return total;
    }

});