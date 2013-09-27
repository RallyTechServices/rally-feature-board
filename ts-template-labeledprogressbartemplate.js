Ext.define('Rally.technicalservices.template.LabeledProgressBarTemplate',{
    extend: 'Ext.XTemplate',
    config: {
        /**
         * 
         * @type {String} label to display above the bar
         */
        fieldLabel: '',
        /**
         * @cfg {String} width define a width if necessary to fit where it's being used
         */
        width: '100%',
        /**
         * @cfg {String} height define a height if necessary to fit where it's being used
         */
        height: '20px',
        /**
         * @cfg {String} percentDoneName sometimes it's necessary to name the variable used as the percent done replacement in the template,
         * like in a grid when a record is used to render the template. The record's field name might be 'PercentDoneByStoryCount', not 'percentDone'
         */
        percentDoneName: 'percentDone',
        /**
         * @cfg {Function} showDangerNotificationFn A function that should return true to show a triangle in the top right to denote something is missing.
         * Defaults to:
         *      function(){ return false; }
         */
        showDangerNotificationFn: function() {
            return false;
        },

        /**
         * @cfg {Function} (required)
         * A function that returns the color for the percent done bar in hex
         */
        calculateColorFn: Ext.emptyFn,

        /**
         * @cfg {Boolean} If the percent done is 0%, do not show the bar at all
         */
        showOnlyIfInProgress: false,

        /**
         * @cfg {Function}
         * A function that returns the text to show in the progress bar.
         * Defaults to a function that returns the percentage complete.
         */
        generateLabelTextFn: function (recordData) {
            return this.calculatePercent(recordData) + '%';
        }
    },
    constructor: function(config) {
        this.initConfig(config);
        config = this.config;
        var templateConfig = [
            '<tpl if="this.shouldShowPercentDone(values)">',
                '<div class="progress-bar-fieldlabel">{[this.fieldLabel]}</div>',
                '<div class="progress-bar-container field-{[this.getPercentDoneName()]} {[this.getClickableClass()]}" style="{[this.getDimensionStyle()]}">',
                    '<div class="progress-bar" style="background-color: {[this.calculateColor(values)]}; width: {[this.calculateWidth(values)]}; "></div>',
                    '<tpl if="this.showDangerNotification(values)">',
                        '<div class="progress-bar-danger-notification"></div>',
                    '</tpl>',
                    '<div class="progress-bar-label">',
                        '{[this.generateLabelText(values)]}',
                    '</div>',
                '</div>',
            '</tpl>',
            {
                shouldShowPercentDone: function(recordData) {
                    var value = recordData[config.percentDoneName];
                    if(!Ext.isNumber(value)){
                        return false;
                    }

                    if (config.showOnlyIfInProgress) {
                        return value > 0;
                    } else {
                        return true;
                    }
                },
                getClickableClass: function(){
                    return config.isClickable ? 'clickable' : '';
                },
                getDimensionStyle: function(){
                    return 'width: ' + config.width + '; height: ' + config.height + '; line-height: ' + config.height;
                },
                calculateWidth: function (recordData) {
                    var percentDone = this.calculatePercent(recordData);
                    return percentDone > 100 ? '100%' : percentDone + '%';
                },
                calculatePercent: function (recordData) {
                    var percentDone = recordData[config.percentDoneName];
                    return Math.round(percentDone * 100);
                },
                generateLabelText: config.generateLabelTextFn,
                calculateColor: config.calculateColorFn,
                showDangerNotification: config.showDangerNotificationFn
            }];
        /**
         * @param {Date}  config.startDate  (days since the epoch or date type where Tomorrow()-Today() = 1.0 (real))
         * @param {Date} config.endDate (same type as startDate)
         * @param {Date} config.asOfDate (same type as startDate) - Most often today. The naming of
         * @param {Boolean} config.inProgress
         */
        return this.callParent(templateConfig);

    }
});