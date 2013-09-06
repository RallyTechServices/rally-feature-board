
Ext.define('Rally.technicalservices.plugin.ColumnHeaderUpdater', {
    alias: 'plugin.tscolumnheaderupdater',
    extend: 'Ext.AbstractPlugin',

    config: {

        /**
         * 
         * @type {String} The name of the field holding the card's estimate
         */
        total_feature_estimate_field_name: "c_FeatureEstimate",
        
        /**
         * @property {Number} The current count of feature estimates
         */
        total_feature_estimate: 0,

        /**
         * @property {String|Ext.XTemplate} the header template to use 
         */
        headerTpl: '<div class="wipLimit">({total_feature_estimate})</div>'
    },

    constructor: function(config) {
        this.callParent(arguments);
        if(Ext.isString(this.headerTpl)) {
            this.headerTpl = Ext.create('Ext.XTemplate', this.headerTpl);
        }
    },

    init: function(column) {
        this.column = column;
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
        return {
            total_feature_estimate: this.getTotalFeatureEstimate()
        };
    },
    
    getTotalFeatureEstimate: function() {
        var me = this;
        var total = 0;
        var records = this.column.getRecords();
        Ext.Array.each(records, function(record){
            var feature_estimate = record.get(me.total_feature_estimate_field_name) || 0;
            total += parseFloat(feature_estimate,10);
        });
        return total;
    }

});