$(function(){
    $("input[name=delimiter]").click(function(){
        var delimiter = $("input[name=delimiter]:checked").val();
        if (delimiter === 'other') {
            $("#other_delimiter").show();
        }else{
            $("#other_delimiter").hide();
        }
    });

    function get_header(data) {
        var max = _.max(data, function(x){return x.length}).length; 
        return _.map(_.range(max), function(x){return ["第", (x + 1),"列"].join('')});
    }

    /* 格式化锯齿数组: 补齐列，清空空白列
     *
     * 格式化前：
     * | 1 |  | 1 |
     * | 2 |  | 2 | 2 |
     * | 3 |  |
     * | 4 |  | 4 |
     *
     * 格式化后
     * | 1 | 1 |   |
     * | 2 | 2 | 2 |
     * | 3 |   |   |
     * | 4 | 4 |   |
     */
    function format_table(data) {
        var max = _.max(data, function(x){return x.length}).length; 

        // 用零长度字符串补齐列
        data = data.map(function(x){return x.length === max ? x : x.concat(new Array(max - x.length)).join('.').split('.')});

        // 删除空白列
        var empty_col_index = [];
        for (var i = 0; i < max; i++) {
            var arr = _.map(data, function(x) { return x[i] });
            arr = _.filter(arr, function(x){ return x.trim() !== '' });
            if (_.isEmpty(arr)) {
                empty_col_index.push(i);
            }
        }
        data = _.map(data, function(x){
            var ret = [];
            for (var i = 0; i < max; i++) {
                if (!_.contains(empty_col_index, i)) {
                    ret.push(x[i]); 
                }
            }
            return ret;
        });

        return data;
    }

    function get_delimiter() {
        var delimiter = $("input[name=delimiter]:checked").val();
        if (delimiter === 'other') {
            delimiter = $("#other_delimiter").val();
        }
        return delimiter;
    }

    function is_time(str) {
        str = str.trim();
        if (!str) {
            return false; 
        }
        if (parseInt(str).toString() === str) {
            return false; //纯数字不当作时间格式
        }
        try{
            var year = moment(str).year();
            if (isNaN(year)) {
                return false;
            }
            if (year > 0 && year < 9999) {
                return true;
            }
        }catch(e){
            return false;
        }
        return false;
    }

    // 探测第几列是时间列
    function get_time_col(row) {
        var found = 0;
        for (var i = 0; i < row.length; i++) {
            if (is_time(row[i])) {
                found = i;
                break;
            }
        }
        return _.map(_.range(row.length), function(x){
            return { index:x + 1,
                selected: x === found
            }
        });
    } 

    // 探测第几列是数字列
    function get_number_col(row) {
        var found = 0;
        for (var i = 0; i < row.length; i++) {
            var str = row[i].trim();
            if (!str) {
                continue;
            }
            if (parseInt(str).toString() === str) { // 纯数字列
                found = i;
                break;
            }
        }
        return _.map(_.range(row.length), function(x){
            return { index:x + 1,
                selected: x === found
            }
        });
    } 

    function draw_chart(data) {
        var title = $("#txt-chart-title").val() ||  "默认图表";
        var series = [ ];
        var time_format = $("#txt-timeformat").val().trim() || "YYYY-MM-DD";
        var x_col_index = parseInt($("#sel-x-data").val().trim() || 1) - 1;
        var y_col_index = parseInt($("#sel-y-data").val().trim() || 2) - 1;
        var y_title = $("#txt-y-title").val().trim() || "数据1";
        series.push({
                name: y_title,
                type: 'line',
                data: _.map(data, function(x) {
                    return [ parseInt(moment(x[x_col_index], time_format).format('x')),
                        parseInt(x[y_col_index])
                    ]
                }) 
        });


        $('#container-chart-result').highcharts({
            title: {
                text: title, 
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    formatter: function() {
                        return moment(this.value).format(time_format);
                    }
               }
            },
            tooltip: {
                formatter: function() {
                    return  '<b>' + this.series.name +'</b><br/>' 
                        + moment(this.x).format(time_format)
                        + '<br />' + this.y;
                }
            },
            series: series
        }); 
    }

    var parse_results = null;
    $("#btn_parse").click(function(){
        var csv = $("#txt_csv").val().trim();
        var results = Papa.parse(csv, {
            delimiter: get_delimiter() 
        });
        console.log(results);
        var data = format_table(results.data);
        results.data = data;

        results.x_cols = get_time_col(data[0]);
        results.y_cols = get_number_col(data[0]);
        results.header = get_header(data);
        parse_results = results;

        
        var tpl = $("#tpl-table-result").html();
        var html = Mustache.render(tpl, results);
        $("#container-table-result").html(html);

    });

    $("#btn-gen-chart").live("click", function(){
        draw_chart(parse_results.data);
    })
});
